import { IOrderData } from "../types";
import { Basket } from "./basket";
import { Payment } from "./payment";
import { Contacts } from "./contacts";

export class OrderData implements IOrderData {
  total: number;
  items: string[]
  payment: string;
  address: string;
  email: string;
  phone: number;

  constructor(basket: Basket, payment: Payment, contacts: Contacts) {
    const itemsIdArray = basket.items.map(item => item.id);

    this.total = basket.totalPrice;
    this.items = itemsIdArray;
    this.payment = payment.payment;
    this.address = payment.address;
    this.email = contacts.email;
    this.phone = contacts.phone;
  }
}