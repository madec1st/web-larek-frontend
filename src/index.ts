import './scss/styles.scss';
import { ICardData } from './types/index'
import { CardApi } from './classes/cardApi';
import { Basket } from './classes/basket';
import { BasketIcon } from './classes/basketIcon';
import { BasketPopup } from './classes/basketPopup';
import { Payment } from './classes/payment';
import { PaymentPopup } from './classes/paymentPopup';
import { Contacts } from './classes/contacts';
import { ContactsPopup } from './classes/contactsPopup';
import { ClientApi } from './classes/clientApi';
import { SuccessfulOrderPopup } from './classes/successfulOrderPopup';
import { Card } from './classes/card';
import { CardPopup } from './classes/cardPopup';
import { OrderData } from './classes/orderData';
import { cardsContainer, basketButton } from './utils/constants';

const cardApi = new CardApi();
const basketData = new Basket();
const basketIcon = new BasketIcon(basketData);
const basketPopup = new BasketPopup(basketData, basketIcon);
const paymentData = new Payment();
const paymentPopup = new PaymentPopup(paymentData);
const contactsData = new Contacts()
const contactsPopup = new ContactsPopup(contactsData);
const clientApi = new ClientApi();
const successfulOrderPopup = new SuccessfulOrderPopup(basketData);


cardApi.getProducts()
  .then((res) => {
    if (res.data && res.data.items) {
      res.data.items.forEach((cardData) => {
        const card = new Card(cardData);
        card.cardElement.dataset.cardData = JSON.stringify(cardData); 
        cardsContainer.appendChild(card.getCard());
      })
    }
  })
  .catch((err) => {
    console.log(`Не удалось получить данные с сервера. Ошибка: ${err}`)
  });

cardsContainer.addEventListener('click', handleCardClick);
basketButton.addEventListener('click', basketPopup.openModal);


function handleCardClick(evt: MouseEvent): void {
  const clickedElement = evt.target as HTMLElement;
  const cardElement = clickedElement.closest('.card') as HTMLElement;
  
  if (cardElement) {
    const cardDataJSON = cardElement.dataset.cardData;

    if (cardDataJSON) {
      const cardData: ICardData = JSON.parse(cardDataJSON);
      const cardPopup = new CardPopup(cardData, basketData, basketIcon);
      cardPopup.openModal();
    }
  }
}

basketPopup.orderButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  basketPopup.closeModal();
  paymentPopup.openModal();
});

paymentPopup.nextButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  paymentPopup.closeModal();
  contactsPopup.openModal();
});

contactsPopup.submitButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  const orderData = new OrderData(basketData, paymentData, contactsData);
  console.log(orderData);
  clientApi.postOrder(orderData)
    .then((res) => {
      if (res.status === 200) {
        paymentPopup.clearForm();
        contactsPopup.clearForm();
        contactsPopup.closeModal();
        successfulOrderPopup.openModal();
      }
    })
    .catch((err) => {
      console.log(`Данные о заказе не отправлены. Ошибка: ${err}`)
    });
});

successfulOrderPopup.homeButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  basketData.clearOrder();
  basketIcon.updateCounter();
  successfulOrderPopup.closeModal();
});