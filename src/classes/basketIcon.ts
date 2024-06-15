import { Basket } from "./basket";
import { basketCounter } from "../utils/constants";

export class BasketIcon {
  private basket: Basket;
  private counter: HTMLSpanElement;

  constructor(basket: Basket) {
    this.basket = basket;
    this.counter = basketCounter;

    this.updateCounter();
  }

  public updateCounter(): void {
    const currentCounter = this.basket.items.length;
    this.counter.textContent = currentCounter.toString();
  }
}