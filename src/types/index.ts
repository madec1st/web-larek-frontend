interface IRequest<T> {
  method: string;
  url: string;
  data?: T;
}

interface IResponse<T> {
  status: number;
  data: T | null;
}

interface IApi {
  request<T>(request: IRequest<T>): Promise<IResponse<T>>;
}

interface ICardData {
  id?: string;
  description?: string;
  image: string;
  title: string;
  category: string;
  price: number|null;
}

interface IOrder {
  items: Pick<ICardData, 'id' | 'title' | 'price'>[];
  totalPrice: number;
}

interface IBasketOperations {
  calculateTotalPrice(): number;
  deleteItem(id: string): void;
  placeOrder(): void;
}

interface IPaymentForm {
  payment: string;
  address: string;

  selectPaymentMethod(method: 'online' | 'onDelivery'): void;
  enterAddress(inputAddress: string): void;
  submit(): void;
}

interface IContactsForm {
  email: string;
  phone: number;
  
  enterEmail(inputEmail: string): void;
  enterPhone(inputPhone: number): void;
  submit(): void;
}

type TCardsArray = ICardData[];

type TClient = IPaymentForm & IContactsForm;

type TTotalPrice = Pick<IOrder, 'totalPrice'>;

class CardApi implements IApi {
  request<T>(request: IRequest<T>): Promise<IResponse<T>> {
    return fetch(request.url, {
      method: 'GET',
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

class ClientApi implements IApi {
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

class Card implements ICardData{
  image: string;
  title: string;
  category: string;
  price: number|null;
}

class CardPopup implements ICardData {
  description: string;
  image: string;
  title: string;
  category: string;
  price: number|null;

  addToBasket(items: Pick<ICardData, 'id' | 'title' | 'price'>[]): void {
    const newItem: ICardData = {
      description: this.description,
      image: this.image,
      title: this.title,
      category: this.category,
      price: this.price
    }

    items.push(newItem);
    console.log(`${this.title} добавлен в корзину`);
  }
}

class Basket implements IOrder, IBasketOperations {
  items: Pick<ICardData, 'id' | 'title' | 'price'>[] = [];
  totalPrice: number;

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

class PaymentPopup implements IPaymentForm {
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

class ContactsPopup implements IContactsForm {
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

class SuccessfulOrder implements TTotalPrice {
  totalPrice: number;

  constructor(totalPrice: number) {
    this.totalPrice = totalPrice;
  }
}