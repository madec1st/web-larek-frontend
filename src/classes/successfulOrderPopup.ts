import { TTotalPrice } from "../types";
import { Basket } from "./basket";
import { Popup } from "./popup";
import { successPopupTemplate, modalContentSuccessfulOrder } from "../utils/constants";
import { pasteContent } from "../utils/functions";

export class SuccessfulOrderPopup implements TTotalPrice {
  public totalPrice: number;
  private basket: Basket;
  public homeButton: HTMLButtonElement;
  private notificationElement: HTMLParagraphElement
  private popup: Popup;

  constructor(basket: Basket) {
    const successPopup = successPopupTemplate.content.querySelector('.order-success').cloneNode(true) as HTMLElement;
    const spentTokensNotification = successPopup.querySelector('.order-success__description') as HTMLParagraphElement;
    const homeButton = successPopup.querySelector('.order-success__close') as HTMLButtonElement;
  
    this.popup = new Popup('.modal_success');
    this.basket = basket;
    this.notificationElement = spentTokensNotification;
    this.homeButton = homeButton;

    pasteContent(modalContentSuccessfulOrder, successPopup);
    
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  public openModal() {
    this.printTotalPrice();
    this.popup.openModal();
  }

  public closeModal() {
    this.popup.closeModal();
  }

  private printTotalPrice() {
    this.totalPrice = this.basket.totalPrice;
    this.notificationElement.textContent = `Списано ${this.totalPrice} синапсов`
  }
}