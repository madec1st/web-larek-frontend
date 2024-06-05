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

export class CardPopup extends BaseCard {
  id: string;
  description: string;
  basket: Basket;

  constructor(data: ICardData, basket: Basket) {
    super(data);
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.closeBySpaceAround = this.closeBySpaceAround.bind(this);
  }

  openModal(cardElement: HTMLElement): void {
    cardElement.classList.add('modal_active');
    document.addEventListener('click', this.closeBySpaceAround);

    const buyButton = cardElement.querySelector('.card__button');
    buyButton.addEventListener('click', () => {
      this.basket.addToBasket({
        id: this.id,
        title: this.title,
        price: this.price
      })
    })
  }

  closeModal(cardElement: HTMLElement): void {
    cardElement.classList.remove('modal_active');
    document.removeEventListener('click', this.closeBySpaceAround);
  }

  closeBySpaceAround(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
    const modalActive = document.querySelector('.modal_active') as HTMLElement; // вынести общие константы наверх файла
  
    if (modalActive && !modalActive.contains(target)) {
      this.closeModal(modalActive);
    }
  }
}

export class BasketDisplay {
  private basket: Basket;
  private basketList: HTMLUListElement;
  private totalPriceElement: HTMLSpanElement;

  constructor(basket: Basket) {
    this.basket = basket;
    const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
    const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;
    const modalContent = document.querySelector('.modal__content');

    if (modalContent) {
      while (modalContent.firstChild) {
        modalContent.removeChild(modalContent.firstChild);
      }
      modalContent.appendChild(basketContainer);
    }

    this.basketList = document.querySelector('.basket__list') as HTMLUListElement;
    this.totalPriceElement = document.querySelector('.basket__price') as HTMLSpanElement;

    this.initializeBasket();
  }

  private initializeBasket(): void {
    this.basket.items.forEach((item, index) => {
      this.addItemToBasketDisplay(item, index)
    })
    this.updateTotalPrice();
  }

  private addItemToBasketDisplay(item: TBasketItem, index: number): void {
    const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
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


// <template id="card-basket"> <!--Попап корзины. Элемент списка-->
// <li class="basket__item card card_compact">
//   <span class="basket__item-index">1</span>
//   <span class="card__title">Фреймворк куки судьбы</span>
//   <span class="card__price">2500 синапсов</span>
//   <button class="basket__item-delete card__button" aria-label="удалить"></button>
// </li>
// </template>

// <template id="basket"> <!--Попап корзины. Контейнер-->
// <div class="basket">
//   <h2 class="modal__title">Корзина</h2>
//   <ul class="basket__list"></ul>
//   <div class="modal__actions">
//     <button class="button basket__button">Оформить</button>
//     <span class="basket__price">0 синапсов</span>
//   </div>
// </div>
// </template>

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