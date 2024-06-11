import { IRequest, IResponse, IApi, IProductsServerResponse, ICardData, IOrder, IBasketOperations, IPaymentForm, IContactsForm, IOrderData, TTotalPrice, TBasketItem } from '../types/index'
import { API_URL, CDN_URL, basketCounter, modalContentCardPreview, basketTemplate, modalContentBasket, cardBasketTemplate, basketItems, formPaymentTemplate, modalContentPayment,
  formContactsTemplate, modalContentContacts, successPopupTemplate, modalContentSuccessfulOrder } from '../utils/constants'
import { pasteContent, toggleScrollLock } from '../utils/functions';


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

class ClientApi implements IApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

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

  postOrder(orderData: OrderData): Promise<IResponse<OrderData>> {
    const request: IRequest<OrderData> = {
      method: 'POST',
      url: `${this.baseUrl}/order`,
      data: orderData
    };

    return this.request<OrderData>(request)
      .then(response => {
        if (response.status === 200 && response.data) {
          return { status: response.status, data: response.data };
        } else {
          return { status: response.status, data: null };
        }
      })
      .catch(() => ({ status: 500, data: null }));
    }
}

class OrderData implements IOrderData {
  total: number;
  items: string[]
  payment: string;
  address: string;
  email: string;
  phone: number;

  constructor(basketData: Basket, paymentData: Payment, contactsData: Contacts) {
    const itemsIdArray = basketData.items.map(item => item.id);

    this.total = basketData.totalPrice;
    this.items = itemsIdArray;
    this.payment = paymentData.payment;
    this.address = paymentData.address;
    this.email = contactsData.email;
    this.phone = contactsData.phone;
  }
}

class CardData implements ICardData {
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
}

class CardTemplate extends CardData {
  constructor(data: ICardData) {
    super(data);
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

class Popup {
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

export class Card extends CardTemplate {
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

export class CardPopup extends CardTemplate {
  id: string;
  description: string;
  basket: Basket;
  basketPopup: BasketPopup;
  popup: Popup;

  constructor(data: ICardData, basket: Basket) {
    super(data);
    this.createCard('#card-preview');
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.basketPopup = new BasketPopup(basket);
    this.popup = new Popup('.modal_card-preview');
    this.closeModal = this.closeModal.bind(this);

    pasteContent(modalContentCardPreview, this.cardElement);

    const cardDescription = this.cardElement.querySelector('.card__text');
    cardDescription.textContent = this.description;

    const buyButton = this.cardElement.querySelector('.card__button') as HTMLButtonElement;
    this.updateStateItem(buyButton);
    
    buyButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.toggleStateButton(buyButton);
    })
    
  }

  openModal() {
    this.popup.openModal();
  }

  updateStateItem(button: HTMLButtonElement) {
    let isInBasket = this.basket.items.some(item => item.id === this.id);
    button.textContent = isInBasket ? 'Убрать' : 'Купить';
  }

  toggleStateButton(button: HTMLButtonElement) {
    const item = {
      id: this.id,
      title: this.title,
      price: this.price
    }

    let isInBasket = this.basket.items.some(item => item.id === this.id);
    isInBasket = !isInBasket;

      if (isInBasket) {
        this.basket.addToBasket(item);
        this.basketPopup.updateBasketPopup();
        this.basketPopup.updateOrderButtonState();
        button.textContent = 'Убрать';
      } else {
        this.basket.deleteItem(item.id);
        this.basketPopup.updateBasketPopup();
        this.basketPopup.updateOrderButtonState();
        button.textContent = 'Купить';
      }
      this.updateStateItem(button);
  }

  closeModal() {
    this.popup.closeModal()
  }
}

class Basket implements IOrder, IBasketOperations {
  items: TBasketItem[] = [];
  totalPrice: number = 0;

  constructor() {
    this.items = [];
  }

  addToBasket(item: TBasketItem): void {
    this.items.push(item);
    this.calculateTotalPrice();
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
      this.items.splice(itemIndex, 1);
      this.calculateTotalPrice();
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
    this.counter = basketCounter;

    this.updateCounter();
  }

  updateCounter(): void {
    const currentCounter = this.basket.items.length;
    this.counter.textContent = currentCounter.toString();
  }
}

export class BasketPopup {
  private popup: Popup;
  private basket: Basket;
  private basketList: HTMLUListElement;
  private totalPriceElement: HTMLSpanElement;
  private basketIcon: BasketIcon;
  private orderButton: HTMLButtonElement;

  constructor(basket: Basket) {
    const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;

    this.basket = basket;
    this.popup = new Popup('.modal_basket');
    this.basketIcon = new BasketIcon(basket);
    this.basketList = basketContainer.querySelector('.basket__list') as HTMLUListElement;
    this.totalPriceElement = basketContainer.querySelector('.basket__price') as HTMLSpanElement;
    this.orderButton = basketContainer.querySelector('.basket__button') as HTMLButtonElement;
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.makeOrder = this.makeOrder.bind(this);

    pasteContent(modalContentBasket, basketContainer);

    this.updateBasketPopup();
    this.orderButton.addEventListener('click', this.makeOrder)
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }

  updateOrderButtonState() {
    if (this.basket.items.length === 0) {
      this.orderButton.setAttribute('disabled', 'true');
    } else {
      this.orderButton.removeAttribute('disabled')
    }
  }

  clearBasketList(): void {
    while (this.basketList.firstChild) {
      this.basketList.removeChild(this.basketList.firstChild);
    }
  }

  updateItemIndexes(): void {
    const basketItems = document.querySelectorAll('.basket__item');
    basketItems.forEach((item, index) => {
      const itemIndex = item.querySelector('.basket__item-index');
      itemIndex.textContent = (index + 1).toString();
    });
  }

  updateTotalPrice(): void {
    this.totalPriceElement.textContent = `${this.basket.totalPrice} синапсов`;
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

  addItemToBasketPopup(item: TBasketItem): void {
    const cardBasketElement = cardBasketTemplate.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
    const cardTitle = cardBasketElement.querySelector('.card__title');
    const cardPrice = cardBasketElement.querySelector('.card__price');
    const deleteButton = cardBasketElement.querySelector('.basket__item-delete') as HTMLButtonElement;

    cardBasketElement.setAttribute('data-id', item.id);
    cardTitle.textContent = item.title;
    
    if (typeof item.price === 'number') {
      cardPrice.textContent = `${item.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }
    
    deleteButton.addEventListener('click', () => {
      this.basket.deleteItem(item.id);
      this.removeItemFromBasketPopup(item.id);
    });

    this.basketList.appendChild(cardBasketElement);
    this.updateItemIndexes();
    this.updateOrderButtonState();
  }

  removeItemFromBasketPopup(itemId: string): void {
    basketItems.forEach((item) => {
      if (item.getAttribute('data-id') === itemId) {
        item.remove();
      }
    });
    this.updateTotalPrice();
    this.updateItemIndexes();
    this.updateBasketPopup();
    this.updateOrderButtonState();
  }

  makeOrder() {
    this.popup.closeModal();
    paymentPopup.openModal();
  }
}

class Payment implements IPaymentForm {
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

class PaymentPopup {
  private popup: Popup;
  protected payment: Payment;
  private onlineButton: HTMLButtonElement;
  private onDeliveryButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private errorElement: HTMLSpanElement;
  private validation: Validation
  private nextButton: HTMLButtonElement;

  constructor() {
    const formElement = formPaymentTemplate.content.querySelector('.form').cloneNode(true) as HTMLElement;
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
      this.nextButton.setAttribute('disabled', 'true');
    }
  }

  getPayment() {
    return this.payment
  }

  submit() {
    this.popup.closeModal();
    contactsPopup.openModal();
  }
}

class Contacts implements IContactsForm {
  email: string;
  phone: number;

  constructor(email: string, phone: number) {
    this.email = email;
    this.phone = phone;
  }

  enterEmail(inputEmail: HTMLInputElement) {
    this.email = inputEmail.value;
  }

  enterPhone(inputPhone: HTMLInputElement) {
    this.phone = parseInt(inputPhone.value);
  }
}

class ContactsPopup {
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
    const formElement = formContactsTemplate.content.querySelector('.form').cloneNode(true) as HTMLElement;
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
      this.contacts.enterEmail(this.emailInput);
    });

    this.phoneInput.addEventListener('input', () => {
      this.checkValidation();
      this.contacts.enterPhone(this.phoneInput);
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

  getContacts() {
    return this.contacts;
  }

  submit() {
    const paymentData = paymentPopup.getPayment();
    const contactsData = this.getContacts();
    const orderData = new OrderData(basketData, paymentData, contactsData);
    const successfulOrderPopup = new SuccessfulOrderPopup();
    clientApi.postOrder(orderData);
    this.popup.closeModal();
    successfulOrderPopup.openModal();
  }
}

class SuccessfulOrderPopup {
  totalPrice: number;
  basket: Basket;
  homeButton: HTMLButtonElement;
  notificationElement: HTMLParagraphElement
  popup: Popup;

  constructor() {
    const successPopup = successPopupTemplate.content.querySelector('.order-success').cloneNode(true) as HTMLElement;
    const spentTokensNotification = successPopup.querySelector('.order-success__description') as HTMLParagraphElement;
    const homeButton = successPopup.querySelector('.order-success__close') as HTMLButtonElement;
  
    this.popup = new Popup('.modal_success');
    this.basket = basketData;
    this.totalPrice = this.basket.totalPrice;
    this.notificationElement = spentTokensNotification;
    this.homeButton = homeButton;

    pasteContent(modalContentSuccessfulOrder, successPopup);
    
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.returnToHomeScreen = this.returnToHomeScreen.bind(this);

    this.notificationElement.textContent = `Списано ${this.totalPrice} синапсов`

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

export const basketData = new Basket();
const paymentPopup = new PaymentPopup();
const contactsPopup = new ContactsPopup();
const clientApi = new ClientApi();