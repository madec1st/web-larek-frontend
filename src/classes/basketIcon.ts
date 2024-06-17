import { Basket } from "./basket";
import { basketCounter } from "../utils/constants";

export class BasketIcon {
  private basket: Basket;
  private counter: HTMLSpanElement;

  constructor() {
    this.counter = basketCounter;
    this.updateCounter(0);
  }

  public updateCounter(currentCount: number): void {
    this.counter.textContent = currentCount.toString();
  }
}