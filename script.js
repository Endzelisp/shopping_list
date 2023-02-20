function main () {

  // User Interface Elements Module

  const UIElem = (function () {
    
    function _getElem (selector) {
      return document.querySelector(selector)
    }

    const mainContainer = _getElem('div.container');
    const exchangeRateEl = _getElem('.container__header-exchange > span');
    const dialogExchangeRate = _getElem('dialog.exchange-rate');
    const dialogNewItem = _getElem('dialog.new-item');
    const newItem = _getElem('.container__header > div:nth-of-type(2) > img');
    const itemContainer = _getElem('section.container__main-list');
    const template = _getElem('template#item-template');
    const totalPriceBs = _getElem('span#currency-bs > #value');
    const totalPriceUSD = _getElem('span#currency-usd > #value');
    const clearList = function () {
      const list = itemContainer.querySelectorAll('.item');
      list.forEach((item) => item.remove());
    }

    return {
      mainContainer,
      exchangeRateEl,
      dialogExchangeRate,
      dialogNewItem,
      newItem,
      itemContainer,
      template,
      totalPriceBs,
      totalPriceUSD,
      clearList,
    }
  })()

  // localStorage Management Module

  const Local = (function() {
    const saveList = function () {
      localStorage.setItem('savedItems', JSON.stringify(State.savedItems));
    }
    const read = function () {
      return JSON.parse(localStorage.savedItems);
    }
    const saveExRate = function () {
      localStorage.setItem('exchangeRate', State.exchangeRate);
    }

    return {
      saveList,
      saveExRate,
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

  const updateList = new CustomEvent ('updateList', {
    detail: {},
    bubbles: true,
    cancelable: false,
    composed: false,
  })

    const renderList = new CustomEvent ('renderList', {
    detail: {},
    bubbles: true,
    cancelable: false,
    composed: false,
  })

  const renderTotalBs = new CustomEvent ('renderTotalBs', {
    detail: {},
    bubbles: true,
    cancelable: false,
    composed: false,
  })

  function createItem (name, price) {

    function _removeItemFn () {
      const itemEl = this.parentElement.querySelector('#item-name');
      delete State.savedItems[itemEl.innerText];
      Local.saveList();
      this.parentElement.remove();
      UIElem.mainContainer.dispatchEvent(renderList);
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

  UIElem.mainContainer.addEventListener('updateList', (e) => {
    const product = e.detail.product;
    const currency = e.detail.currency;
    const quantity = e.detail.quantity;
    let price = e.detail.price;

    price *= parseInt(quantity);
    price = (currency === 'bs') ? price : (price * State.exchangeRate).toFixed(2);
    State.savedItems[product] = price;
    Local.saveList();
    UIElem.mainContainer.dispatchEvent(renderList);
  })

  UIElem.mainContainer.addEventListener('renderList', () => {
    // Clear out the actual displayed list of items
    UIElem.clearList();

    if (!(State.savedItems.hasOwnProperty())) {
      // Runs when the saved items list obj is empty
      State.savedItems = Local.read();
    }

    // Render all saved items on the list
    for (const key in State.savedItems) {
      UIElem.itemContainer.appendChild(
        createItem(key, State.savedItems[key])
      )
    }
    UIElem.mainContainer.dispatchEvent(renderTotalBs);
  })

  UIElem.mainContainer.addEventListener('renderTotalBs', () => {
    let total = 0;
    for (const key in State.savedItems) {
      total += parseFloat(State.savedItems[key]);
    }
    UIElem.totalPriceBs.innerText = total;
  })

  UIElem.exchangeRateEl.addEventListener('pointerdown', () => {
    UIElem.dialogExchangeRate.showModal()
  })

  UIElem.dialogExchangeRate.addEventListener('close', () => {
    const exRateInputEl = UIElem.dialogExchangeRate.querySelector('input#exchange-rate');
    const exRate = exRateInputEl.value;
    if (exRate !== undefined && exRate > 0) {
      State.exchangeRate = exRate;
      UIElem.exchangeRateEl.innerText = exRate;
      Local.saveExRate()
    } else {
      alert('Tasa de cambio no actualizada');
    }
  })

  UIElem.newItem.addEventListener('pointerdown', () => {
    if ('exchangeRate' in localStorage) {   
      const productEl = UIElem.dialogNewItem.querySelector('input#product');
      const priceEl = UIElem.dialogNewItem.querySelector('input#price');
      productEl.value = '';
      priceEl.value = null;
      UIElem.dialogNewItem.showModal();
    } else {
      alert('La tasa de cambio no ha sido configurada');
    }
  })

  UIElem.dialogNewItem.addEventListener('close', () => {
    const dialogEl = UIElem.dialogNewItem;
    const productEl = dialogEl.querySelector('input#product');
    const priceEl = dialogEl.querySelector('input#price');
    const currencyEl = dialogEl.querySelector('select#currency');
    const quantityEl = dialogEl.querySelector('input#quantity');
    const product = (productEl.value).trim();
    const currency = currencyEl.value;
    const quantity = quantityEl.value;
    let price = priceEl.value;
    if (product !== '' && price !== null) {
      // Add the captured info to the event detail object
      updateList.detail.product = product;
      updateList.detail.currency = currency;
      updateList.detail.quantity = quantity;
      updateList.detail.price = price;

      UIElem.dialogNewItem.dispatchEvent(updateList);
    }
  })

  UIElem.mainContainer.dispatchEvent(renderList);

  if ('exchangeRate' in localStorage) {
    const exRate = localStorage.getItem('exchangeRate');
    State.exchangeRate = exRate;
    UIElem.exchangeRateEl.innerText = exRate;
  } else {
    alert('Tasa de cambio no configurada');
    UIElem.exchangeRateEl.innerText = 0;
  }
}

main()
