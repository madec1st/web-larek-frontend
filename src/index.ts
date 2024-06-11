import './scss/styles.scss';
import { ICardData } from './types/index'
import { basketData, CardApi, Card, CardPopup, BasketPopup} from './types/classes';
import { cardsContainer, basketButton } from './utils/constants';

const cardApi = new CardApi();
const basketPopup = new BasketPopup(basketData);

cardApi.getProducts()
  .then(res => {
    if (res.data && res.data.items) {
      res.data.items.forEach((cardData) => {
        const card = new Card(cardData);
        card.cardElement.dataset.cardData = JSON.stringify(cardData); 
        cardsContainer.appendChild(card.getCard());
      })
    }
  })
  .catch(err => {
    console.log(`Код ошибки: ${err}`)
  });


basketPopup.updateOrderButtonState();
cardsContainer.addEventListener('click', handleCardClick);
basketButton.addEventListener('click', basketPopup.openModal)


function handleCardClick(evt: MouseEvent): void {
  const clickedElement = evt.target as HTMLElement;
  const cardElement = clickedElement.closest('.card') as HTMLElement;
  
  if (cardElement) {
    const cardDataJSON = cardElement.dataset.cardData;

    if (cardDataJSON) {
      const cardData: ICardData = JSON.parse(cardDataJSON);
      const cardPopup = new CardPopup(cardData, basketData);
      cardPopup.openModal();
    }
  }
}