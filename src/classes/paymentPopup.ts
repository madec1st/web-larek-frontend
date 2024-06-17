import { Popup } from "./popup";
import { Payment } from "./payment";
import { FormValidation } from "./validation";
import { pasteContent } from "../utils/functions";
import { formPaymentTemplate, modalContentPayment } from "../utils/constants";
import { OrderData } from "./orderData";

export class PaymentPopup extends Popup {
  protected payment: Payment;
  private orderData: OrderData;
  private onlineButton: HTMLButtonElement;
  private onDeliveryButton: HTMLButtonElement;
  private addressInput: HTMLInputElement;
  private formValidation: FormValidation;
  public nextButton: HTMLButtonElement;

  constructor(payment: Payment, orderData: OrderData) {
    super('.modal_payment');
    const formElement = formPaymentTemplate.content.querySelector('.form').cloneNode(true) as HTMLFormElement;
    const onlineButton = formElement.querySelector('.button_alt-online') as HTMLButtonElement;
    const onDeliveryButton = formElement.querySelector('.button_alt-on-delivery') as HTMLButtonElement;
    const addressInput = formElement.querySelector('.form__input') as HTMLInputElement;
    const nextButton = formElement.querySelector('.form__button') as HTMLButtonElement;

    this.payment = payment;
    this.orderData = orderData;
    this.onlineButton = onlineButton;
    this.onDeliveryButton = onDeliveryButton;
    this.addressInput = addressInput;
    this.formValidation = new FormValidation(formElement);
    this.nextButton = nextButton;

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleOnlineClick = this.handleOnlineClick.bind(this);
    this.handleOnDeliveryClick = this.handleOnDeliveryClick.bind(this);

    pasteContent(modalContentPayment, formElement);

    this.onlineButton.addEventListener('click', () => {
      this.handleOnlineClick();
      if (this.addressInput.value) {
        this.checkFormValidity();
      }
    });
    
    this.onDeliveryButton.addEventListener('click', () => {
      this.handleOnDeliveryClick();
      if (this.addressInput.value) {
        this.checkFormValidity();
      }
    });

    this.addressInput.addEventListener('input', () => {
      if (this.formValidation.checkInputValidity(this.addressInput)) {
        this.payment.enterAddress(this.addressInput);
        this.orderData.addressSet = this.payment.address;
        this.checkFormValidity();
      }
    });
  }

  public openModal() {
    super.openModal();
  }

  public closeModal() {
    super.closeModal();
  }

  private selectPaymentMethod(button: HTMLButtonElement, method: 'online' | 'onDelivery') {
    if (button.classList.contains('button_alt-active')) {
      return
    }

    this.onlineButton.classList.remove('button_alt-active');
    this.onDeliveryButton.classList.remove('button_alt-active');

    button.classList.add('button_alt-active');
    this.payment.selectPaymentMethod(method);
    this.orderData.paymentSet = this.payment.payment;
  }  

  private handleOnlineClick() {
    this.selectPaymentMethod(this.onlineButton, 'online');
  }

  private handleOnDeliveryClick() {
    this.selectPaymentMethod(this.onDeliveryButton, 'onDelivery');
  }

  private isActive(button: HTMLButtonElement) {
    if (button.classList.contains('button_alt-active')) {
      return true
    } else return false
  }

  private checkFormValidity() {
    const buttonIsActive = this.isActive(this.onlineButton) || this.isActive(this.onDeliveryButton);
    const inputIsValid = this.formValidation.checkInputValidity(this.addressInput);

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