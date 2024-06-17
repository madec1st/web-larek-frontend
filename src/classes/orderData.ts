import { IOrderData } from "../types";

export class OrderData implements IOrderData {
  total: number;
  items: string[]
  payment: string;
  address: string;
  email: string;
  phone: number;

  constructor() {
    this.total = 0;
    this.items = [];
    this.payment = '';
    this.address = '';
    this.email = '';
    this.phone = 0;
  }

  set totalSet (value: number) {
    this.total = value;
  }

  set itemsSet (value: string[]) {
    this.items = value;
  }

  set paymentSet (value: string) {
    this.payment = value;
  }

  set addressSet (value: string) {
    this.address = value;
  }

  set emailSet (value: string) {
    this.email = value;
  }

  set phoneSet (value: number) {
    this.phone = value;
  }
}