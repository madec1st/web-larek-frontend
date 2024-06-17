import { TTotalPrice } from "../types";
import { Basket } from "./basket";
import { Popup } from "./popup";
import { successPopupTemplate, modalContentSuccessfulOrder } from "../utils/constants";
import { pasteContent } from "../utils/functions";
import { BasketIcon } from "./basketIcon";

export class SuccessfulOrderPopup extends Popup implements TTotalPrice {
  public totalPrice: number;
  private basket: Basket;
  private basketIcon: BasketIcon;
  public homeButton: HTMLButtonElement;
  private notificationElement: HTMLParagraphElement;

  constructor(basket: Basket, basketIcon: BasketIcon) {
    super('.modal_success');
    const successPopup = successPopupTemplate.content.querySelector('.order-success').cloneNode(true) as HTMLElement;
    const spentTokensNotification = successPopup.querySelector('.order-success__description') as HTMLParagraphElement;
    const homeButton = successPopup.querySelector('.order-success__close') as HTMLButtonElement;
  
    this.basket = basket;
    this.basketIcon = basketIcon;
    this.notificationElement = spentTokensNotification;
    this.homeButton = homeButton;

    pasteContent(modalContentSuccessfulOrder, successPopup);
    
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  public openModal() {
    this.printTotalPrice();
    super.openModal();
  }
  
  public closeModal() {
    this.basket.clearOrder();
    this.basketIcon.updateCounter(this.basket.items.length);
    super.closeModal();
  }

  private printTotalPrice() {
    this.totalPrice = this.basket.totalPrice;
    this.notificationElement.textContent = `Списано ${this.totalPrice} синапсов`
  }
}