export interface IRequest<T> {
  method: string;
  url: string;
  data?: T;
}

export interface IResponse<T> {
  status: number;
  data: T | null;
}

export interface IApi {
  request<T>(request: IRequest<T>): Promise<IResponse<T>>;
}

export interface IProductsServerResponse {
  total: number;
  items: ICardData[];
}

export interface ICardData {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number|null;
}

export interface IOrder {
  items: TBasketItem[];
  totalPrice: number;
}

export interface IBasketOperations {
  addToBasket(item: TBasketItem): void;
  calculateTotalPrice(): number;
  deleteItem(id: string): void;
  clearOrder(): void;
}

export interface IPaymentForm {
  payment: string;
  address: string;

  selectPaymentMethod(method: 'online' | 'onDelivery'): void;
  enterAddress(inputAddress: HTMLInputElement): void;
}

export interface IContactsForm {
  email: string;
  phone: number;
  
  enterEmail(inputEmail: HTMLInputElement): void;
  enterPhone(inputPhone: HTMLInputElement): void;
}

export interface IOrderData {
  total: number;
  items: string[];
  payment: string;
  address: string;
  email: string;
  phone: number;
}

export type TTotalPrice = Pick<IOrder, 'totalPrice'>;

export type TBasketItem = Pick<ICardData, 'id' | 'title' | 'price'>;