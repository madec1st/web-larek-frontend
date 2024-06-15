import { ICardData } from "../types";
import { CardTemplate } from "./cardTemplate";
import { Basket } from "./basket";
import { BasketIcon } from "./basketIcon";
import { Popup } from "./popup";
import { pasteContent } from "../utils/functions";
import { modalContentCardPreview } from "../utils/constants";

export class CardPopup extends CardTemplate {
  id: string;
  description: string;
  basket: Basket;
  basketIcon: BasketIcon;
  popup: Popup;

  constructor(data: ICardData, basket: Basket, basketIcon: BasketIcon) {
    super(data);
    this.createCard('#card-preview');
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.basketIcon = basketIcon;
    this.popup = new Popup('.modal_card-preview');
    this.closeModal = this.closeModal.bind(this);

    pasteContent(modalContentCardPreview, this.cardElement);

    const cardDescription = this.cardElement.querySelector('.card__text');
    cardDescription.textContent = this.description;

    const buyButton = this.cardElement.querySelector('.card__button') as HTMLButtonElement;
    this.updateStateItem(buyButton);
    
    buyButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.toggleStateButton(buyButton);
    })
    
  }

  public openModal() {
    this.popup.openModal();
  }

  private updateStateItem(button: HTMLButtonElement) {
    let isInBasket = this.basket.items.some(item => item.id === this.id);
    button.textContent = isInBasket ? 'Убрать' : 'Купить';
  }

  private toggleStateButton(button: HTMLButtonElement) {
    const item = {
      id: this.id,
      title: this.title,
      price: this.price
    }

    let isInBasket = this.basket.items.some(item => item.id === this.id);
    isInBasket = !isInBasket;

    if (isInBasket) {
      this.basket.addToBasket(item);
      this.basketIcon.updateCounter();
      button.textContent = 'Убрать';
    } else {
      this.basket.deleteItem(item.id);
      this.basketIcon.updateCounter();
      button.textContent = 'Купить';
    }
    
    this.updateStateItem(button);
  }

  public closeModal() {
    this.popup.closeModal()
  }
}