import { Popup } from "./popup";
import { Contacts } from "./contacts";
import { FormValidation } from "./validation";
import { pasteContent } from "../utils/functions";
import { formContactsTemplate, modalContentContacts } from "../utils/constants";
import { OrderData } from "./orderData";

export class ContactsPopup extends Popup {
  private contacts: Contacts;
  private orderData: OrderData;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private formValidation: FormValidation;
  public submitButton: HTMLButtonElement;

  constructor(contacts: Contacts, orderData: OrderData) {
    super('.modal_contacts');
    const formElement = formContactsTemplate.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
    const emailInput = formElement.querySelector('.form__input-email') as HTMLInputElement;
    const phoneInput = formElement.querySelector('.form__input-phone') as HTMLInputElement;
    const submitButton = formElement.querySelector('.form__button') as HTMLButtonElement;

    this.emailInput = emailInput;
    this.phoneInput = phoneInput;
    this.submitButton = submitButton;
    this.contacts = contacts;
    this.orderData = orderData;
    this.formValidation = new FormValidation(formElement);

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    pasteContent(modalContentContacts, formElement);

    this.emailInput.addEventListener('input', () => {
      if (this.formValidation.checkInputValidity(this.emailInput)) {
        this.contacts.enterEmail(this.emailInput);
        this.orderData.emailSet = this.contacts.email;
      }      
    });

    this.phoneInput.addEventListener('input', () => {
      if (this.formValidation.checkInputValidity(this.phoneInput)) {
        this.contacts.enterPhone(this.phoneInput);
        this.orderData.phoneSet = this.contacts.phone;
      }
    });
  }

  public openModal() {
    super.openModal();
  }

  public closeModal() {
    super.closeModal();
  }

  public clearForm() {
    this.emailInput.value = '';
    this.phoneInput.value = '';
    this.submitButton.setAttribute('disabled', 'true');
  }
}