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

const modalContentCardPreview = document.querySelector('.modal__content_card-preview');//наверх
const pageWrapper = document.querySelector('.page__wrapper');//наверх

export class CardPopup extends BaseCard {
  id: string;
  description: string;
  basket: Basket;
  popup: Popup;

  constructor(data: ICardData, basket: Basket) {
    super(data);
    this.createCard('#card-preview');
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.popup = new Popup('.modal_card-preview');
    this.closeModal = this.closeModal.bind(this);

    if (modalContentCardPreview) {
      while (modalContentCardPreview.firstChild) {
        modalContentCardPreview.removeChild(modalContentCardPreview.firstChild);
      }
      modalContentCardPreview.appendChild(this.cardElement);
    }

    const cardDescription = this.cardElement.querySelector('.card__text');
    cardDescription.textContent = this.description;
    
  }

  openModal() {
    this.popup.openModal();
    const buyButton = this.cardElement.querySelector('.card__button');
    buyButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.basket.addToBasket({
        id: this.id,
        title: this.title,
        price: this.price
      })
    })
  }
  
  closeModal() {
    this.popup.closeModal()
  }
}

export class BasketPopup {
  private basket: Basket;
  private basketList: HTMLUListElement;
  private totalPriceElement: HTMLSpanElement;
  public popup: Popup;

  constructor(basket: Basket) {
    this.basket = basket;
    this.popup = new Popup('.modal_basket');
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
    const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;
    const modalContentBasket = document.querySelector('.modal__content_basket');

    if (modalContentBasket) {
      while (modalContentBasket.firstChild) {
        modalContentBasket.removeChild(modalContentBasket.firstChild);
      }
      modalContentBasket.appendChild(basketContainer);
    }

    this.basketList = document.querySelector('.basket__list') as HTMLUListElement;
    this.totalPriceElement = document.querySelector('.basket__price') as HTMLSpanElement;

    this.initializeBasket();
  }

  openModal() {
    this.popup.openModal();
  }

  closeModal() {
    this.popup.closeModal();
  }

  private initializeBasket(): void {
    this.basket.items.forEach((item, index) => {
      this.addItemToBasketPopup(item, index)
    })
    this.updateTotalPrice();
  }

  private addItemToBasketPopup(item: TBasketItem, index: number): void {
    const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;//наверх
    const cardBasketElement = cardBasketTemplate.content.cloneNode(true) as HTMLElement;
    const cardIndex = cardBasketElement.querySelector('.basket__item-index');
    const cardTitle = cardBasketElement.querySelector('.card__title');
    const cardPrice = cardBasketElement.querySelector('.card__price');

    cardIndex.textContent = (index + 1).toString();
    cardTitle.textContent = item.title;

    if (typeof item.price === 'number') {
      cardPrice.textContent = `${item.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }

    const deleteButton = cardBasketElement.querySelector('.basket__item-delete') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => {
      this.basket.deleteItem(item.id);
      this.removeItemFromBasketDisplay(index);
    });

    this.basketList.appendChild(cardBasketElement);
  }

  private removeItemFromBasketDisplay(index: number): void {
    const basketItems = this.basketList.querySelectorAll('.basket__item');
    if (basketItems[index]) {
      basketItems[index].remove();
    }
    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
    this.totalPriceElement.textContent = `${this.basket.totalPrice} синапсов`;
  }
}

export function toggleScrollLock(isLocked: boolean): void {
  if (isLocked) {
    pageWrapper.classList.add('page__wrapper_locked');
  } else {
    pageWrapper.classList.remove('page__wrapper_locked');
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
  }

  calculateTotalPrice(): number {
    let total = 0;
    for (const item of this.items) {
      total += item.price || 0; 
    }

    this.totalPrice = total;
    return total;
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
    }
  }

  placeOrder(): void {
    if (this.items.length === 0) {
      console.log('Корзина пуста. Оформить заказ невозможно');
      return;
    }

    const order: IOrder = {
      items: this.items,
      totalPrice: this.totalPrice,
    }

    console.log(`Ваш заказ успешно оформлен: ${order}`);
    this.items = [];
    this.totalPrice = 0;
  }
}

export class PaymentPopup implements IPaymentForm {
  payment: string;
  address: string;

  constructor() {
    this.payment = '';
    this.address = '';
  }

  selectPaymentMethod(method: 'online' | 'onDelivery') {
    this.payment = method;
  }

  enterAddress(inputAddress: string) {
    this.address = inputAddress;
  }

  submit() {
    if (!this.payment || !this.address) {
      console.error('Необходимо выбрать метод оплаты и ввести адрес.');
      return;
    }
    console.log(`Метод оплаты: ${this.payment}, Адрес: ${this.address}`);
  }
}

export class ContactsPopup implements IContactsForm {
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

export class SuccessfulOrder implements TTotalPrice {
  totalPrice: number;

  constructor(totalPrice: number) {
    this.totalPrice = totalPrice;
  }
}