import { CardData } from "../classes/cardData";
import { pageWrapper } from "./constants";

export function toggleScrollLock(isLocked: boolean): void {
  if (isLocked) {
    pageWrapper.classList.add('page__wrapper_locked');
  } else {
    pageWrapper.classList.remove('page__wrapper_locked');
  }
}

export function pasteContent(modalContent: HTMLElement, clonedElement: HTMLElement) {
  if (modalContent) {
    while (modalContent.firstChild) {
      modalContent.removeChild(modalContent.firstChild);
  }
  modalContent.appendChild(clonedElement);
  }
}