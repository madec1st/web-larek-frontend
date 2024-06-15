import { IOrder, IBasketOperations, TBasketItem } from '../types/index'

export class Basket implements IOrder, IBasketOperations {
  items: TBasketItem[] = [];
  totalPrice: number = 0;

  constructor() {
    this.items = [];
  }

  public addToBasket(item: TBasketItem): void {
    this.items.push(item);
    this.calculateTotalPrice();
  }

  public calculateTotalPrice(): number {
    let total = 0;
    for (const item of this.items) {
      total += item.price || 0; 
    }

    return this.totalPrice = total;
  }

  public deleteItem(id: string): void {
    const itemIndex = this.items.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
      this.calculateTotalPrice();
    }
  }

  public clearOrder(): void {
    this.items = [];
    this.totalPrice = 0;
  }
}