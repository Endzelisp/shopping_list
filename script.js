// User Interface Module

const UserInterface = (function () {
  const exchangeRateBtn = document.querySelector('.container__header-exchange > span');
  const dialogExchangeRate = document.querySelector('dialog.exchange-rate');
  const dialogNewItem = document.querySelector('dialog.new-item');
  const newItem = document.querySelector('.container__header > div:nth-of-type(2) > img');
  const itemContainer = document.querySelector('section.container__main-list');
  const template = document.querySelector('template#item-template');

  return {
    exchangeRateBtn,
    dialogExchangeRate,
    dialogNewItem,
    newItem,
    itemContainer,
    template,
  }
})()

function main () {
  
  let exchangeRate;

  function createItem (name, price) {
    const clone = UserInterface.template.content.cloneNode(true);
    const newItem = clone.querySelector('div.item');
    const itemName = newItem.querySelector('#item-name');
    const itemPrice = newItem.querySelector('#item-price');
    itemName.innerText = name;
    itemPrice.innerText = `${price} Bs.`;
    return newItem
  }

  UserInterface.exchangeRateBtn.addEventListener('pointerdown', () => {
    UserInterface.dialogExchangeRate.showModal()
  })

  UserInterface.dialogExchangeRate.addEventListener('close', () => {
    const rate = UserInterface.dialogExchangeRate.querySelector('#exchange-rate');
    exchangeRate = rate.value;
    if (exchangeRate !== undefined && exchangeRate > 0) {
      UserInterface.exchangeRateBtn.innerText = exchangeRate;
    } else {
      alert('Tasa de cambio no actualizada');
    }
  })

  UserInterface.newItem.addEventListener('pointerdown', () => {
    const product = UserInterface.dialogNewItem.querySelector('input#product');
    const price = UserInterface.dialogNewItem.querySelector('input#price');
    product.value = '';
    price.value = null;
    UserInterface.dialogNewItem.showModal();
  })

  UserInterface.dialogNewItem.addEventListener('close', () => {
    const product = UserInterface.dialogNewItem.querySelector('input#product');
    const price = UserInterface.dialogNewItem.querySelector('input#price');
    if (product.value !== '' && price.value !== null) {
      UserInterface.itemContainer.appendChild(
        createItem(product.value, price.value)
      )
    }
  })

  UserInterface.itemContainer.appendChild(createItem('Salsa de tomate', 35));

}

main()
