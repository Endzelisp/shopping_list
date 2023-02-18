function main () {

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

  // localStorage Management Module

  const Local = (function() {
    const save = function () {
      localStorage.setItem('savedItems', JSON.stringify(State.savedItems));
    }
    const read = function () {
      return JSON.parse(localStorage.savedItems);
    } 

    return {
      save,
      read,
    }
  })()

  // State Management Module

  const State = (function () {
    let exchangeRate;
    let savedItems = {};


    return {
      exchangeRate,
      savedItems,
    }
  })()
  

  function createItem (name, price) {

    function _removeItemFn () {
      const itemEl = this.parentElement.querySelector('#item-name');
      const itemPrice = State.savedItems[itemEl.innerText];
      UIElem.totalPriceBs.innerText = (
        parseFloat(UIElem.totalPriceBs.innerText) - parseFloat(itemPrice)
      )
      delete State.savedItems[itemEl.innerText];
      Local.save();
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
    State.exchangeRate = rate.value;
    if (State.exchangeRate !== undefined && State.exchangeRate > 0) {
      UIElem.exchangeRateBtn.innerText = State.exchangeRate;
    } else {
      alert('Tasa de cambio no actualizada');
    }
  })

  UIElem.newItem.addEventListener('pointerdown', () => {
    const productEl = UIElem.dialogNewItem.querySelector('input#product');
    const priceEl = UIElem.dialogNewItem.querySelector('input#price');
    productEl.value = '';
    priceEl.value = null;
    UIElem.dialogNewItem.showModal();
  })

  UIElem.dialogNewItem.addEventListener('close', () => {
    const productEl = UIElem.dialogNewItem.querySelector('input#product');
    const priceEl = UIElem.dialogNewItem.querySelector('input#price');
    const product = productEl.value;
    const price = priceEl.value;
    if (product !== '' && price !== null) {
      State.savedItems[product] = price;
      UIElem.itemContainer.appendChild(
        createItem(product, price)
      );
      UIElem.totalPriceBs.innerText = 
        parseFloat(UIElem.totalPriceBs.innerText) + (parseFloat(price));
      Local.save();
    }
  })

  if (('savedItems' in localStorage)) {
    // Read the localStorage and if savedItems exist
    // display all elements that are present
    State.savedItems = Local.read();
    totalPriceBs = 0;
    for (const key in State.savedItems) {
      UIElem.itemContainer.appendChild(
        createItem(`${key}`, State.savedItems[key])
      )
      totalPriceBs += parseFloat(State.savedItems[key]);
    }
    UIElem.totalPriceBs.innerText = totalPriceBs;
  }  
}

main()
