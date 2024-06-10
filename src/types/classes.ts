import { IRequest, IResponse, IApi, IProductsServerResponse, ICardData, IOrder, IBasketOperations, IPaymentForm, IContactsForm, TTotalPrice, TBasketItem } from '../types/index'
import { API_URL, CDN_URL } from '../utils/constants'

export class CardApi implements IApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  request<T>(request: IRequest<T>): Promise<IResponse<T>> {
    return fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json()
    .then(data => ({ status: response.status, data })))
    .catch(() => ({ status: 500, data: null }));
  }

  getProducts(): Promise<IResponse<IProductsServerResponse>> {
    const request: IRequest<null> = {
      method: 'GET',
      url: `${this.baseUrl}/product/`,
      data: null
    };

    return this.request<IProductsServerResponse>(request)
      .then(response => {
        if (response.status === 200 && response.data) {
          return { status: response.status, data: response.data };
        } else {
          return { status: response.status, data: {total: 0, items: []} };
        }
    });
  }
}

export class ClientApi implements IApi {
  request<T>(request: IRequest<T>): Promise<IResponse<T>> {
    return fetch(request.url, {
      method: 'POST',
      body: request.data ? JSON.stringify(request.data) : null,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json()
    .then(data => ({ status: response.status, data })))
    .catch(() => ({ status: 500, data: null }));
  }
}

export class BaseCard implements ICardData {
  image: string;
  title: string;
  category: string;
  price: number|null;
  cardElement: HTMLElement | null = null;

  constructor(data: ICardData) {
    this.image = data.image;
    this.title = data.title;
    this.category = data.category;
    this.price = data.price;
  }

  protected createCard(templateId: string): void {
    const cardTemplate: HTMLTemplateElement = document.querySelector(templateId);
    this.cardElement = cardTemplate.content.querySelector('.card').cloneNode(true) as HTMLElement;
    const cardTitle = this.cardElement.querySelector('.card__title');
    const cardTag = this.cardElement.querySelector('.card__category');
    const cardImage = this.cardElement.querySelector('.card__image') as HTMLImageElement;
    const cardPrice = this.cardElement.querySelector('.card__price');

    cardTitle.textContent = this.title;
    cardTag.textContent = this.category;
    cardImage.src = `${CDN_URL}${this.image}`;
    cardImage.alt = this.title;

    if (typeof this.price === 'number') {
      cardPrice.textContent = `${this.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }

    const categoryClasses: Record<string, string> = {
      'софт-скил': 'card__category_soft',
      'другое': 'card__category_other',
      'дополнительное': 'card__category_additional',
      'кнопка': 'card__category_button',
      'хард-скил': 'card__category_hard'
    };
  
    const categoryClass = categoryClasses[this.category];
    if (categoryClass) {
      cardTag.classList.add(categoryClass);
    }
  }
}

export class Popup {
  protected savedScrollPosition: number = 0;
  protected modalElement: HTMLElement;
  public popup: Popup;
  public closeButton: HTMLButtonElement;

  constructor(modalSelector: string) {
    this.modalElement = document.querySelector(modalSelector) as HTMLElement;
    this.closeButton = this.modalElement.querySelector('.modal__close');
    this.closeModal = this.closeModal.bind(this)
    this.closeBySpaceAround = this.closeBySpaceAround.bind(this);
  }
 

  openModal(): void {
    this.savedScrollPosition = window.scrollY;
    this.modalElement.classList.add('modal_active');
    toggleScrollLock(true);
    this.closeButton.addEventListener('click', this.closeModal);
    document.addEventListener('click', this.closeBySpaceAround);
    
  }

  closeModal(): void {
    this.modalElement.classList.remove('modal_active');
    toggleScrollLock(false);
    window.scrollTo(0, this.savedScrollPosition);
    this.closeButton.removeEventListener('click', this.closeModal);
    document.removeEventListener('click', this.closeBySpaceAround);
  }

  closeBySpaceAround(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
  
    if (target.classList.contains('modal_active')) {
      this.closeModal();
    }
  }
}

export class Card extends BaseCard {
  constructor(data: ICardData) {
    super(data);
    this.createCard('#card-catalog');
    
  }

  public getCard(): HTMLElement {
    if (!this.cardElement) {
      this.createCard('#card-catalog');
    }
    return this.cardElement;
  }
}

const modalContentCardPreview = document.querySelector('.modal__content_card-preview') as HTMLElement;//наверх
const pageWrapper = document.querySelector('.page__wrapper');//наверх

export class CardPopup extends BaseCard {
  id: string;
  description: string;
  basket: Basket;
  basketUI: BasketUI;
  popup: Popup;

  constructor(data: ICardData, basket: Basket) {
    super(data);
    this.createCard('#card-preview');
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.basketUI = new BasketUI(basket);
    this.popup = new Popup('.modal_card-preview');
    this.closeModal = this.closeModal.bind(this);

    pasteContent(modalContentCardPreview, this.cardElement);

    const cardDescription = this.cardElement.querySelector('.card__text');
    cardDescription.textContent = this.description;
    
  }

  openModal() {
    this.popup.openModal();
    const item = {
      id: this.id,
      title: this.title,
      price: this.price
    }

    const buyButton = this.cardElement.querySelector('.card__button') as HTMLButtonElement;
    let isInBasket = this.basket.items.some(item => item.id === this.id);

    function updateStateItem() {
      buyButton.textContent = isInBasket ? 'Убрать' : 'Купить';
    }
    
    updateStateItem();
    
    buyButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      isInBasket = !isInBasket;

      if (isInBasket) {
        this.basket.addToBasket(item);
        this.basketUI.updateBasketPopup();
        this.basketUI.updateOrderButtonState();
        buyButton.textContent = 'Убрать';
      } else {
        this.basket.deleteItem(item.id);
        this.basketUI.updateBasketPopup();
        this.basketUI.updateOrderButtonState();
        buyButton.textContent = 'Купить';
      }
      updateStateItem();
    })
  }
  
  closeModal() {
    this.popup.closeModal()
  }
}

export class BasketPopup {
  public popup: Popup;
  basket: Basket;
  private basketUI: BasketUI;

  constructor(basket: Basket) {
    this.basketUI = new BasketUI(basket);
    this.basket = basket;
    this.popup = new Popup('.modal_basket');
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
    const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;
    const modalContentBasket = document.querySelector('.modal__content_basket') as HTMLElement;//

    pasteContent(modalContentBasket, basketContainer);
    this.basketUI.updateBasketPopup();
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }
}

export function toggleScrollLock(isLocked: boolean): void {
  if (isLocked) {
    pageWrapper.classList.add('page__wrapper_locked');
  } else {
    pageWrapper.classList.remove('page__wrapper_locked');
  }
}

export function pasteContent(modalContent: HTMLElement, clonedElement: HTMLElement) {
  if (modalContent) {
    while (modalContent.firstChild) {
      modalContent.removeChild(modalContent.firstChild);
  }
  modalContent.appendChild(clonedElement);
  }
}

export class BasketUI {
  private basket: Basket;
  private basketList: HTMLUListElement;
  private popup: Popup;
  private totalPriceElement: HTMLSpanElement;
  private basketIcon: BasketIcon;
  private orderButton: HTMLButtonElement;

  constructor(basket: Basket) {
    this.basket = basket;
    this.basketList = document.querySelector('.basket__list') as HTMLUListElement;
    this.totalPriceElement = document.querySelector('.basket__price') as HTMLSpanElement;
    this.orderButton = document.querySelector('.basket__button') as HTMLButtonElement;
    this.basketIcon = new BasketIcon(basket);
    this.popup = new Popup('.modal_basket');

    this.makeOrder();
  }
  
  updateOrderButtonState() {
    if (this.basket.items.length === 0) {
      this.orderButton.setAttribute('disabled', 'true');
    } else {
      this.orderButton.removeAttribute('disabled')
    }
  }
  
  updateBasketPopup(): void {
    this.clearBasketList();
    this.basket.items.forEach((item) => {
      this.addItemToBasketPopup(item);
    });
    this.updateTotalPrice();
    this.basketIcon.updateCounter();
    this.updateOrderButtonState();
  }

  private clearBasketList(): void {
    while (this.basketList.firstChild) {
      this.basketList.removeChild(this.basketList.firstChild);
    }
  }
  
  private updateItemIndexes(): void {
    const basketItems = document.querySelectorAll('.basket__item');
    basketItems.forEach((item, index) => {
      const itemIndex = item.querySelector('.basket__item-index');
      itemIndex.textContent = (index + 1).toString();
    });
  }

  private addItemToBasketPopup(item: TBasketItem): void {
    const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;//наверх
    const cardBasketElement = cardBasketTemplate.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
    const cardTitle = cardBasketElement.querySelector('.card__title');
    const cardPrice = cardBasketElement.querySelector('.card__price');

    cardBasketElement.setAttribute('data-id', item.id);
    cardTitle.textContent = item.title;
    
    
    if (typeof item.price === 'number') {
      cardPrice.textContent = `${item.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }

    const deleteButton = cardBasketElement.querySelector('.basket__item-delete') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => {
      this.basket.deleteItem(item.id);
      this.removeItemFromBasketPopup(item.id);
    });

    this.basketList.appendChild(cardBasketElement);
    this.updateItemIndexes();
    this.updateOrderButtonState();
  }

  private removeItemFromBasketPopup(itemID: string): void {
    const basketItems = document.querySelectorAll('.basket__item');
    basketItems.forEach((item) => {
      if (item.getAttribute('data-id') === itemID) {
        item.remove();
      }
    });
    this.updateTotalPrice();
    this.updateItemIndexes();
    this.updateBasketPopup();
    this.updateOrderButtonState();
  }

  private updateTotalPrice(): void {
    this.totalPriceElement.textContent = `${this.basket.totalPrice} синапсов`;
  }

  makeOrder() {
    const paymentPopup = new PaymentPopup();
    this.orderButton.addEventListener('click', () => {
      this.popup.closeModal();
      paymentPopup.openModal();
    })
  }
  
}

export class Basket implements IOrder, IBasketOperations {
  items: TBasketItem[] = [];
  totalPrice: number = 0;

  constructor() {
    this.items = [];
  }

  addToBasket(item: TBasketItem): void {
    this.items.push(item);
    this.calculateTotalPrice();

    console.log(`${item.title} добавлен в корзину`);
    console.log(this.totalPrice)
  }

  calculateTotalPrice(): number {
    let total = 0;
    for (const item of this.items) {
      total += item.price || 0; 
    }

    return this.totalPrice = total;
  }

  deleteItem(id: string): void {
    const itemIndex = this.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
    
      const updatedItems = [...this.items];
      const removedItem = updatedItems[itemIndex];

      updatedItems.splice(itemIndex, 1);

      const removedItemPrice = removedItem.price;
      let updatedTotalPrice = this.totalPrice - removedItemPrice;

      this.items = updatedItems;
      this.totalPrice = updatedTotalPrice;

      console.log(`Товар "${removedItem.title}" удалён из корзины`);
      console.log(this.items);
    }
  }

  clearOrder(): void {
    this.items = [];
    this.totalPrice = 0;
  }
}

class BasketIcon {
  private basket: Basket
  private counter: HTMLSpanElement;

  constructor(basket: Basket) {
    this.basket = basket;
    this.counter = document.querySelector('.header__basket-counter') as HTMLSpanElement;

    this.updateCounter();
  }

  updateCounter(): void {
    const currentCounter = this.basket.items.length;
    this.counter.textContent = currentCounter.toString();
  }
}

export class Payment implements IPaymentForm {
  payment: string;
  address: string;

  constructor() {
    this.payment = '';
    this.address = '';
  }

  selectPaymentMethod(method: 'online' | 'onDelivery') {
    this.payment = method;
  }

  enterAddress(inputAddress: HTMLInputElement) {
    this.address = inputAddress.value;
  }

  submit() {
    if (!this.payment || !this.address) {
      console.error('Необходимо выбрать метод оплаты и ввести адрес.');
      return;
    }
    console.log(`Метод оплаты: ${this.payment}, Адрес: ${this.address}`);
  }
}

export class PaymentPopup {
  private popup: Popup;
  private payment: Payment;
  private onlineButton: HTMLButtonElement;
  private onDeliveryButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private errorElement: HTMLSpanElement;
  private validation: Validation
  private nextButton: HTMLButtonElement;

  constructor() {
    const formPaymentTemplate = document.querySelector('#order') as HTMLTemplateElement;//наверх
    const formElement = formPaymentTemplate.content.querySelector('.form').cloneNode(true) as HTMLElement;
    const modalContentPayment = document.querySelector('.modal__content_payment') as HTMLElement;
    const onlineButton = formElement.querySelector('.button_alt-online') as HTMLButtonElement;
    const onDeliveryButton = formElement.querySelector('.button_alt-on-delivery') as HTMLButtonElement;
    const addressInput = formElement.querySelector('.form__input') as HTMLInputElement;
    const errorElement = formElement.querySelector('.address-input_error-message') as HTMLSpanElement;
    const nextButton = formElement.querySelector('.order__button') as HTMLButtonElement;

    this.payment = new Payment();
    this.popup = new Popup('.modal_payment');
    this.onlineButton = onlineButton;
    this.onDeliveryButton = onDeliveryButton;
    this.addressInput = addressInput;
    this.errorElement = errorElement;
    this.validation = new Validation(this.addressInput, this.errorElement);
    this.nextButton = nextButton;

    console.log(onlineButton)

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleOnlineClick = this.handleOnlineClick.bind(this);
    this.handleOnDeliveryClick = this.handleOnDeliveryClick.bind(this);
    this.checkInputValidity = this.checkInputValidity.bind(this);

    pasteContent(modalContentPayment, formElement);

    this.onlineButton.addEventListener('click', () => {
      this.handleOnlineClick();
      this.checkValidation();
    });
    
    this.onDeliveryButton.addEventListener('click', () => {
      this.handleOnDeliveryClick();
      this.checkValidation();
    });

    this.addressInput.addEventListener('input', () => {
      this.checkInputValidity();
      this.checkValidation();
    });

    this.nextButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.submit();
    })
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }

  selectPaymentMethod(button: HTMLButtonElement, method: 'online' | 'onDelivery') {
    if (button.classList.contains('button_alt-active')) {
      return
    }

    this.onlineButton.classList.remove('button_alt-active');
    this.onDeliveryButton.classList.remove('button_alt-active');

    button.classList.add('button_alt-active');
    this.payment.selectPaymentMethod(method);
  }  

  handleOnlineClick() {
    this.selectPaymentMethod(this.onlineButton, 'online');
  }

  handleOnDeliveryClick() {
    this.selectPaymentMethod(this.onDeliveryButton, 'onDelivery');
  }

  checkInputValidity() {
    this.validation.checkValidation(this.addressInput);
    this.payment.enterAddress(this.addressInput);
  }

  isActive(button: HTMLButtonElement) {
    if (button.classList.contains('button_alt-active')) {
      return true
    } else return false
  }

  checkValidation() {
    const buttonIsActive = this.isActive(this.onlineButton) || this.isActive(this.onDeliveryButton);
    const inputIsValid = this.validation.checkValidation(this.addressInput);

    if (inputIsValid && buttonIsActive) {
      this.nextButton.removeAttribute('disabled');
    } else {
      console.log(this.addressInput.validity.valid, buttonIsActive)
      this.nextButton.setAttribute('disabled', 'true');
    }
  }

  submit() {
    const contactsPopup = new ContactsPopup();
    this.popup.closeModal();
    contactsPopup.openModal();
  }
}

class Validation {
  inputElement: HTMLInputElement;
  errorElement: HTMLSpanElement;

  constructor(inputElement: HTMLInputElement, errorElement: HTMLSpanElement) {
    this.inputElement = inputElement;
    this.errorElement = errorElement;
  }

  checkValidation(inputElement: HTMLInputElement): boolean {
    if (inputElement.value.trim() === '') {
      this.showErrorMessage();
      return false
    } else if (inputElement.validity.typeMismatch) {
      this.showErrorMessage();
      return false
    } else {
      this.hideErrorMessage();
      return true
    }
  }

  showErrorMessage() {
    if (this.inputElement.value.trim() === '') {
      this.inputElement.setCustomValidity(this.inputElement.dataset.errorMessage);
      this.errorElement.textContent = this.inputElement.validationMessage;
    } else if (this.inputElement.validity.typeMismatch) {
      this.errorElement.textContent = this.inputElement.validationMessage;
    }
  }

  hideErrorMessage() {
    this.inputElement.setCustomValidity('');
    this.errorElement.textContent = '';
  }
}

export class ContactsPopup {
  private popup: Popup;
  private contacts: Contacts;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private email: string;
  private phone: number;
  private validationEmail: Validation;
  private validationPhone: Validation;
  private submitButton: HTMLButtonElement;

  constructor() {
    const formContactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;//наверх
    const formElement = formContactsTemplate.content.querySelector('.form').cloneNode(true) as HTMLElement;
    const modalContentContacts = document.querySelector('.modal__content_contacts') as HTMLElement;
    const emailInput = formElement.querySelector('.form__input-email') as HTMLInputElement;
    const emailErrorElement = formElement.querySelector('.email-input_error-message') as HTMLSpanElement;
    const phoneInput = formElement.querySelector('.form__input-phone') as HTMLInputElement;
    const phoneErrorElement = formElement.querySelector('.phone-input_error-message') as HTMLSpanElement;
    const submitButton = formElement.querySelector('.button_submit') as HTMLButtonElement;

    this.popup = new Popup('.modal_contacts');
    this.emailInput = emailInput;
    this.phoneInput = phoneInput;
    this.submitButton = submitButton;
    this.contacts = new Contacts(this.email, this.phone);
    this.validationEmail = new Validation(emailInput, emailErrorElement);
    this.validationPhone = new Validation(phoneInput, phoneErrorElement);


    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.checkValidation = this.checkValidation.bind(this);

    pasteContent(modalContentContacts, formElement);

    this.emailInput.addEventListener('input', () => {
      this.checkValidation();
      this.email = this.emailInput.value;
      this.contacts.email = this.email;
    });

    this.phoneInput.addEventListener('input', () => {
      this.checkValidation();
      this.phone = parseInt(this.phoneInput.value);
      this.contacts.phone = this.phone;
    });

    this.submitButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.submit();
    })
    
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }

  checkValidation() {
    if (this.validationEmail.checkValidation(this.emailInput) && this.validationPhone.checkValidation(this.phoneInput)) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', 'true')
    }
  }

  submit() {
    const successfulOrderPopup = new SuccessfulOrderPopup();
    this.popup.closeModal();
    successfulOrderPopup.openModal();
  }
}

export class Contacts implements IContactsForm {
  email: string;
  phone: number;

  constructor(email: string, phone: number) {
    this.email = email;
    this.phone = phone;
  }

  enterEmail(inputEmail: string) {
    this.email = inputEmail;
  }

  enterPhone(inputPhone: number) {
    this.phone = inputPhone;
  }

  submit() {
    if (!this.email || !this.phone) {
      console.error('Необходимо ввести адрес электронной почты и номер телефона.');
      return;
    }
    console.log(`Email: ${this.email}, телефон: ${this.phone}`);
  }
}

export class SuccessfulOrderPopup {
  successfulOrder: SuccessfulOrder;
  basket: Basket;
  homeButton: HTMLButtonElement;
  notificationElement: HTMLParagraphElement
  popup: Popup;

  constructor() {
    const successPopupTemplate = document.querySelector('#success') as HTMLTemplateElement;//наверх
    const successPopup = successPopupTemplate.content.querySelector('.order-success').cloneNode(true) as HTMLElement;
    const modalContentSuccessfulOrder = document.querySelector('.modal__content_success') as HTMLElement;
    const spentTokensNotification = successPopup.querySelector('.order-success__description') as HTMLParagraphElement;
    const homeButton = successPopup.querySelector('.order-success__close') as HTMLButtonElement;
  
    this.popup = new Popup('.modal_success');
    this.basket = basket;
    this.successfulOrder = new SuccessfulOrder(this.basket);
    this.notificationElement = spentTokensNotification;
    this.homeButton = homeButton;

    pasteContent(modalContentSuccessfulOrder, successPopup);
    
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.returnToHomeScreen = this.returnToHomeScreen.bind(this);

    this.notificationElement.textContent = `Списано ${this.successfulOrder.totalPrice} синапсов`

    this.homeButton.addEventListener('click', this.returnToHomeScreen);
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }

  returnToHomeScreen() {
    this.basket.clearOrder();
    this.closeModal();
    window.location.reload();
  }
}

export class SuccessfulOrder implements TTotalPrice {
  totalPrice: number;
  basket: Basket;

  constructor(basket: Basket) {
    this.basket = basket;
    this.totalPrice = this.basket.totalPrice;
  }
}

export const basket = new Basket();