import { TBasketItem } from "../types";
import { Basket } from "./basket";
import { BasketIcon } from "./basketIcon";
import { Popup } from "./popup";
import { basketTemplate, modalContentBasket, cardBasketTemplate, basketItems } from "../utils/constants";
import { pasteContent } from "../utils/functions";

export class BasketPopup {
  private popup: Popup;
  private basket: Basket;
  private basketList: HTMLUListElement;
  private totalPriceElement: HTMLSpanElement;
  private basketIcon: BasketIcon;
  public orderButton: HTMLButtonElement;

  constructor(basket: Basket, basketIcon: BasketIcon) {
    const basketContainer = basketTemplate.content.cloneNode(true) as HTMLElement;

    this.basket = basket;
    console.log(this.basket)
    this.popup = new Popup('.modal_basket');
    this.basketIcon = basketIcon;
    this.basketList = basketContainer.querySelector('.basket__list') as HTMLUListElement;
    this.totalPriceElement = basketContainer.querySelector('.basket__price') as HTMLSpanElement;
    this.orderButton = basketContainer.querySelector('.basket__button') as HTMLButtonElement;
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    pasteContent(modalContentBasket, basketContainer);

    this.updateBasketPopup();
  }

  public openModal() {
    this.popup.openModal();
    this.updateBasketPopup()
  }

  public closeModal() {
    this.popup.closeModal();
  }

  private updateOrderButtonState() {
    if (this.basket.items.length === 0) {
      this.orderButton.setAttribute('disabled', 'true');
    } else {
      this.orderButton.removeAttribute('disabled')
    }
  }

  private clearBasketList(): void {
    while (this.basketList.firstChild) {
      this.basketList.removeChild(this.basketList.firstChild);
    }
  }

  private updateItemIndexes(): void {
    const basketItems = document.querySelectorAll('.basket__item');
    basketItems.forEach((item, index) => {
      const itemIndex = item.querySelector('.basket__item-index');
      itemIndex.textContent = (index + 1).toString();
    });
  }

  private updateTotalPrice(): void {
    this.totalPriceElement.textContent = `${this.basket.totalPrice} синапсов`;
  }

  private updateBasketPopup(): void {
    this.clearBasketList();
    this.basket.items.forEach((item) => {
      this.addItemToBasketPopup(item);
    });
    this.updateTotalPrice();
    this.basketIcon.updateCounter();
    this.updateOrderButtonState();
  }

  private addItemToBasketPopup(item: TBasketItem): void {
    const cardBasketElement = cardBasketTemplate.content.querySelector('.basket__item').cloneNode(true) as HTMLElement;
    const cardTitle = cardBasketElement.querySelector('.card__title');
    const cardPrice = cardBasketElement.querySelector('.card__price');
    const deleteButton = cardBasketElement.querySelector('.basket__item-delete') as HTMLButtonElement;

    cardBasketElement.setAttribute('data-id', item.id);
    cardTitle.textContent = item.title;
    
    if (typeof item.price === 'number') {
      cardPrice.textContent = `${item.price} синапсов`;
    } else {
      cardPrice.textContent = 'Бесценно';
    }
    
    deleteButton.addEventListener('click', () => {
      this.basket.deleteItem(item.id);
      this.removeItemFromBasketPopup(item.id);
    });

    this.basketList.appendChild(cardBasketElement);
    this.updateItemIndexes();
    this.updateOrderButtonState();
  }

  private removeItemFromBasketPopup(itemId: string): void {
    basketItems.forEach((item) => {
      if (item.getAttribute('data-id') === itemId) {
        item.remove();
      }
    });
    this.updateItemIndexes();
    this.updateBasketPopup();
  }
}