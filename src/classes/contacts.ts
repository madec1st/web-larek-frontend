import { IContactsForm } from "../types";

export class Contacts implements IContactsForm {
  email: string;
  phone: number;

  constructor() {
    this.email = '';
    this.phone = 0;
  }

  public enterEmail(inputEmail: HTMLInputElement) {
    this.email = inputEmail.value;
  }

  public enterPhone(inputPhone: HTMLInputElement) {
    this.phone = parseInt(inputPhone.value);
  }
}