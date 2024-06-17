import { CardData } from "./cardData";
import { CardTemplate } from "./cardTemplate";
import { Basket } from "./basket";
import { BasketIcon } from "./basketIcon";
import { pasteContent } from "../utils/functions";
import { modalContentCardPreview } from "../utils/constants";

export class CardPopup extends CardTemplate {
  private id: string;
  private description: string;
  private basket: Basket;
  private basketIcon: BasketIcon;

  constructor(data: CardData, basket: Basket, basketIcon: BasketIcon) {
    super(data);
    this.createCard('#card-preview');
    this.id = data.id;
    this.description = data.description;
    this.basket = basket;
    this.basketIcon = basketIcon;
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)

    pasteContent(modalContentCardPreview, this.cardElement);

    const cardDescription = this.cardElement.querySelector('.card__text');
    cardDescription.textContent = this.description;

    const buyButton = this.cardElement.querySelector('.card__button') as HTMLButtonElement;
    this.updateStateItem(buyButton);

    if (this.price === null) {
      buyButton.setAttribute('disabled', 'true');
    }
    
    buyButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      this.toggleStateButton(buyButton);
    })
    
  }

  public openModal() {
    super.openModal();
  }

  public closeModal() {
    super.closeModal()
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
      this.basketIcon.updateCounter(this.basket.items.length);
      button.textContent = 'Убрать';
    } else {
      this.basket.deleteItem(item.id);
      this.basketIcon.updateCounter(this.basket.items.length);
      button.textContent = 'Купить';
    }
    
    this.updateStateItem(button);
  }

  
}