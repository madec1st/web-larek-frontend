import { IPaymentForm } from "../types";

export class Payment implements IPaymentForm {
  payment: string;
  address: string;

  constructor() {
    this.payment = '';
    this.address = '';
  }

  public selectPaymentMethod(method: 'online' | 'onDelivery') {
    this.payment = method;
  }

  public enterAddress(inputAddress: HTMLInputElement) {
    this.address = inputAddress.value;
  }
}