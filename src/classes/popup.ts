import { toggleScrollLock } from "../utils/functions";

export abstract class Popup {
  protected savedScrollPosition: number = 0;
  protected modalElement: HTMLElement;
  public popup: Popup;
  public closeButton: HTMLButtonElement;

  constructor(modalSelector: string) {
    this.modalElement = document.querySelector(modalSelector) as HTMLElement;
    this.closeButton = this.modalElement.querySelector('.modal__close');
    this.closeModal = this.closeModal.bind(this)
    this.closeBySpaceAround = this.closeBySpaceAround.bind(this);
  }

  public openModal(): void {
    this.savedScrollPosition = window.scrollY;
    this.modalElement.classList.add('modal_active');
    toggleScrollLock(true);
    this.closeButton.addEventListener('click', this.closeModal);
    document.addEventListener('click', this.closeBySpaceAround);
  }

  public closeModal(): void {
    this.modalElement.classList.remove('modal_active');
    toggleScrollLock(false);
    window.scrollTo(0, this.savedScrollPosition);
    this.closeButton.removeEventListener('click', this.closeModal);
    document.removeEventListener('click', this.closeBySpaceAround);
  }

  private closeBySpaceAround(evt: MouseEvent): void {
    const target = evt.target as HTMLElement;
  
    if (target.classList.contains('modal_active')) {
      this.closeModal();
    }
  }
}