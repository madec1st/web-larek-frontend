import { Popup } from "./popup";
import { Payment } from "./payment";
import { Validation } from "./validation";
import { pasteContent } from "../utils/functions";
import { formPaymentTemplate, modalContentPayment } from "../utils/constants";

export class PaymentPopup {
  private popup: Popup;
  protected payment: Payment;
  private onlineButton: HTMLButtonElement;
  private onDeliveryButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private errorElement: HTMLSpanElement;
  private validation: Validation
  public nextButton: HTMLButtonElement;

  constructor(payment: Payment) {
    const formElement = formPaymentTemplate.content.querySelector('.form').cloneNode(true) as HTMLElement;
    const onlineButton = formElement.querySelector('.button_alt-online') as HTMLButtonElement;
    const onDeliveryButton = formElement.querySelector('.button_alt-on-delivery') as HTMLButtonElement;
    const addressInput = formElement.querySelector('.form__input') as HTMLInputElement;
    const errorElement = formElement.querySelector('.address-input_error-message') as HTMLSpanElement;
    const nextButton = formElement.querySelector('.order__button') as HTMLButtonElement;

    this.payment = payment;
    this.popup = new Popup('.modal_payment');
    this.onlineButton = onlineButton;
    this.onDeliveryButton = onDeliveryButton;
    this.addressInput = addressInput;
    this.errorElement = errorElement;
    this.validation = new Validation(this.addressInput, this.errorElement);
    this.nextButton = nextButton;

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleOnlineClick = this.handleOnlineClick.bind(this);
    this.handleOnDeliveryClick = this.handleOnDeliveryClick.bind(this);
    this.checkInputValidity = this.checkInputValidity.bind(this);

    pasteContent(modalContentPayment, formElement);

    this.onlineButton.addEventListener('click', () => {
      this.handleOnlineClick();
      if (this.addressInput.value !== '') {
        this.checkValidation();
      }
    });
    
    this.onDeliveryButton.addEventListener('click', () => {
      this.handleOnDeliveryClick();
      if (this.addressInput.value !== '') {
        this.checkValidation();
      }
    });

    this.addressInput.addEventListener('input', () => {
      this.checkInputValidity();
      this.checkValidation();
    });
  }

  public openModal() {
    this.popup.openModal();
  }

  public closeModal() {
    this.popup.closeModal();
  }

  private selectPaymentMethod(button: HTMLButtonElement, method: 'online' | 'onDelivery') {
    if (button.classList.contains('button_alt-active')) {
      return
    }

    this.onlineButton.classList.remove('button_alt-active');
    this.onDeliveryButton.classList.remove('button_alt-active');

    button.classList.add('button_alt-active');
    this.payment.selectPaymentMethod(method);
  }  

  private handleOnlineClick() {
    this.selectPaymentMethod(this.onlineButton, 'online');
  }

  private handleOnDeliveryClick() {
    this.selectPaymentMethod(this.onDeliveryButton, 'onDelivery');
  }

  private checkInputValidity() {
    this.validation.checkValidation(this.addressInput);
    this.payment.enterAddress(this.addressInput);
  }

  private isActive(button: HTMLButtonElement) {
    if (button.classList.contains('button_alt-active')) {
      return true
    } else return false
  }

  private checkValidation() {
    const buttonIsActive = this.isActive(this.onlineButton) || this.isActive(this.onDeliveryButton);
    const inputIsValid = this.validation.checkValidation(this.addressInput);

    if (inputIsValid && buttonIsActive) {
      this.nextButton.removeAttribute('disabled');
    } else {
      this.nextButton.setAttribute('disabled', 'true');
    }
  }

  public clearForm() {
    if (this.isActive(this.onlineButton)) {
      this.onlineButton.classList.remove('button_alt-active')
    } else {
      this.onDeliveryButton.classList.remove('button_alt-active')
    }

    this.addressInput.value = '';
    this.nextButton.setAttribute('disabled', 'true');
  }
}
