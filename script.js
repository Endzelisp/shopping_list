// User Interface Elements Module

const UIElem = (function () {
  
  function _getElem (selector) {
    return document.querySelector(selector)
  }

  const exchangeRateBtn = _getElem('.container__header-exchange > span');
  const dialogExchangeRate = _getElem('dialog.exchange-rate');
  const dialogNewItem = _getElem('dialog.new-item');
  const newItem = _getElem('.container__header > div:nth-of-type(2) > img');
  const itemContainer = _getElem('section.container__main-list');
  const template = _getElem('template#item-template');
  const totalPriceBs = _getElem('span#currency-bs > #value');
  const totalPriceUSD = _getElem('span#currency-usd > #value');

  return {
    exchangeRateBtn,
    dialogExchangeRate,
    dialogNewItem,
    newItem,
    itemContainer,
    template,
    totalPriceBs,
    totalPriceUSD,
  }
})()

function main () {
  
  let exchangeRate;
  let savedItems = {};

  function createItem (name, price) {

    function _removeItemFn () {
      const itemEl = this.parentElement.querySelector('#item-name');
      const itemPrice = savedItems[itemEl.innerText];
      UIElem.totalPriceBs.innerText = (
        parseFloat(UIElem.totalPriceBs.innerText) - parseFloat(itemPrice)
      )
      delete savedItems[itemEl.innerText];
      localStorage.setItem('savedItems', JSON.stringify(savedItems));
      this.parentElement.remove();
    }

    const clone = UIElem.template.content.cloneNode(true);
    const newItem = clone.querySelector('div.item');
    const itemName = newItem.querySelector('#item-name');
    const itemPrice = newItem.querySelector('#item-price');
    const removeItem = newItem.querySelector('span#delete');
    removeItem.addEventListener('pointerdown', _removeItemFn);
    itemName.innerText = name;
    itemPrice.innerText = `${price} Bs.`;
    return newItem
  }

  UIElem.exchangeRateBtn.addEventListener('pointerdown', () => {
    UIElem.dialogExchangeRate.showModal()
  })

  UIElem.dialogExchangeRate.addEventListener('close', () => {
    const rate = UIElem.dialogExchangeRate.querySelector('#exchange-rate');
    exchangeRate = rate.value;
    if (exchangeRate !== undefined && exchangeRate > 0) {
      UIElem.exchangeRateBtn.innerText = exchangeRate;
    } else {
      alert('Tasa de cambio no actualizada');
    }
  })

  UIElem.newItem.addEventListener('pointerdown', () => {
    const product = UIElem.dialogNewItem.querySelector('input#product');
    const price = UIElem.dialogNewItem.querySelector('input#price');
    product.value = '';
    price.value = null;
    UIElem.dialogNewItem.showModal();
  })

  UIElem.dialogNewItem.addEventListener('close', () => {
    const product = UIElem.dialogNewItem.querySelector('input#product');
    const price = UIElem.dialogNewItem.querySelector('input#price');
    if (product.value !== '' && price.value !== null) {
      savedItems[product.value] = price.value;
      UIElem.itemContainer.appendChild(
        createItem(product.value, price.value)
      );
      UIElem.totalPriceBs.innerText = 
        parseFloat(UIElem.totalPriceBs.innerText) + (parseFloat(price.value));
      localStorage.setItem('savedItems', JSON.stringify(savedItems));
    }
  })



  if (('savedItems' in localStorage)) {
    // Read the localStorage and if savedItems exist
    // display all elements that are present
    savedItems = JSON.parse(localStorage.savedItems);
    totalPriceBs = 0;
    for (const key in savedItems) {
      UIElem.itemContainer.appendChild(
        createItem(`${key}`, savedItems[key])
      )
      totalPriceBs += parseFloat(savedItems[key]);
    }
    UIElem.totalPriceBs.innerText = totalPriceBs;
  }  
}

main()
