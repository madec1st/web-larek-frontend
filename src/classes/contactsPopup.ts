import { Popup } from "./popup";
import { Contacts } from "./contacts";
import { Validation } from "./validation";
import { pasteContent } from "../utils/functions";
import { formContactsTemplate, modalContentContacts } from "../utils/constants";

export class ContactsPopup {
  private popup: Popup;
  private contacts: Contacts;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private validationEmail: Validation;
  private validationPhone: Validation;
  public submitButton: HTMLButtonElement;

  constructor(contacts: Contacts) {
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
    this.contacts = contacts;
    this.validationEmail = new Validation(emailInput, emailErrorElement);
    this.validationPhone = new Validation(phoneInput, phoneErrorElement);


    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.checkValidation = this.checkValidation.bind(this);

    pasteContent(modalContentContacts, formElement);

    this.emailInput.addEventListener('input', () => {
      if (this.phoneInput.value !== '') {
        this.checkValidation();
      }
      this.contacts.enterEmail(this.emailInput);
    });

    this.phoneInput.addEventListener('input', () => {
      if (this.emailInput.value !== '') {
        this.checkValidation();
      }
      this.contacts.enterPhone(this.phoneInput);
    });
  }

  public openModal() {
    this.popup.openModal();
  }

  public closeModal() {
    this.popup.closeModal();
  }

  private checkValidation() {
    if (this.validationEmail.checkValidation(this.emailInput) && this.validationPhone.checkValidation(this.phoneInput)) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', 'true')
    }
  }

  public clearForm() {
    this.emailInput.value = '';
    this.phoneInput.value = '';
    this.submitButton.setAttribute('disabled', 'true');
  }
}