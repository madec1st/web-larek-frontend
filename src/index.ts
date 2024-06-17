import './scss/styles.scss';
// import { ICardData } from './types';
import { CardData } from './classes/cardData';
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
const paymentData = new Payment();
const contactsData = new Contacts();
const orderData = new OrderData();
const clientApi = new ClientApi();

const basketIcon = new BasketIcon();
const basketPopup = new BasketPopup(basketData, basketIcon, orderData);
const paymentPopup = new PaymentPopup(paymentData, orderData);
const contactsPopup = new ContactsPopup(contactsData, orderData);
const successfulOrderPopup = new SuccessfulOrderPopup(basketData, basketIcon);

function handleCardClick(cardData: CardData): void {
  const cardPopup = new CardPopup(cardData, basketData, basketIcon);
  cardPopup.openModal();      
}

cardApi.getProducts()
  .then((res) => {
    if (res.data && res.data.items) {
      res.data.items.forEach((cardData) => {
        const card = new Card(cardData, handleCardClick);
        cardsContainer.appendChild(card.getCard());
      })
    }
  })
  .catch((err) => {
    console.log(`Не удалось получить данные с сервера. Ошибка: ${err}`)
  });

basketButton.addEventListener('click', basketPopup.openModal);

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
  successfulOrderPopup.closeModal();
});