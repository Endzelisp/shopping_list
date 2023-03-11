function main () {


  // -------------------------
  //   User Interface Module


  const UIElem = (function () {
    
    function _getElem (selector) {
      return document.querySelector(selector);
    }

    const mainContainer = _getElem('[data-container="data-container"]');
    const exchangeRateEl = _getElem('[data-rate="exchange-rate"]');
    const totalPriceBs = _getElem('[data-total="total-bs"]');
    const totalPriceUSD = _getElem('[data-total="total-usd"]');
    const newItem = _getElem('[data-button="new-item"]');
    const newWeightedItem = _getElem('[data-button="weighted-item"]');
    const itemContainer = _getElem('[data-container="main-list"]');
    const dialogExchangeRate = _getElem('[data-dialog="exchange-rate"]');
    const dialogNewItem = _getElem('[data-dialog="new-item"]');
    const dialogNewweightedItem = _getElem('[data-dialog="weighted-item"]');
    const template = _getElem('[data-template="new-item"]');
    
    const clearList = function () {
      const list = itemContainer.querySelectorAll('.item');
      list.forEach((item) => item.remove());
    }

    return {
      mainContainer,
      exchangeRateEl,
      dialogExchangeRate,
      dialogNewItem,
      dialogNewweightedItem,
      newItem,
      newWeightedItem,
      itemContainer,
      template,
      totalPriceBs,
      totalPriceUSD,
      clearList,
    };
  })()


  // ------------------------------
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
    };
  })()


  // -----------------------
  // State Management Object


  const State = {
    exchangeRate: 0,
    savedItems: {},
  }


  // ----------------
  //  Custom Events


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

  const renderTotalUSD = new CustomEvent ('renderTotalUSD', {
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


  // ------------
  //  Functions


  function createItem (name, price) {

    function _removeItemFn () {
      const itemEl = this.parentElement.querySelector('[data-item="name"]');
      delete State.savedItems[itemEl.innerText];
      Local.saveList();
      this.parentElement.remove();
      UIElem.mainContainer.dispatchEvent(renderList);
    }

    const clone = UIElem.template.content.cloneNode(true);
    const newItem = clone.querySelector('[data-item="container"]');
    const itemName = newItem.querySelector('[data-item="name"]');
    const itemPrice = newItem.querySelector('[data-item="price"]');
    const removeItem = newItem.querySelector('[data-item="delete"]');
    removeItem.addEventListener('pointerdown', _removeItemFn);
    itemName.innerText = name;
    itemPrice.innerText = `${price} Bs.`;
    return newItem;
  }


  // ----------------
  //  event handlers


  UIElem.exchangeRateEl.addEventListener('pointerdown', () => {
    // Open up exchange rate dialog box
    UIElem.dialogExchangeRate.showModal();
  })


  UIElem.newItem.addEventListener('pointerdown', () => {
    // Show up the dialog box to add a new item
    // just if the exchangeRate is set

    if ('exchangeRate' in localStorage) {
      const productEl = UIElem.dialogNewItem.querySelector('[data-input="name"]');
      const priceEl = UIElem.dialogNewItem.querySelector('[data-input="price"]');
      productEl.value = '';
      priceEl.value = null;
      UIElem.dialogNewItem.showModal();
    } else {
      alert('La tasa de cambio no ha sido configurada');
    }
  })

  UIElem.newWeightedItem.addEventListener('pointerdown', () => {
    // Show up the dialog box to add a new weighted items
    // just if the exchangeRate is set

    if ('exchangeRate' in localStorage) {
      const productEl = UIElem.dialogNewweightedItem.querySelector('[data-input="name"]');
      const priceEl = UIElem.dialogNewweightedItem.querySelector('[data-input="price"]');
      const weightEl = UIElem.dialogNewweightedItem.querySelector('[data-input="weight"]');
      productEl.value = '';
      priceEl.value = null;
      weightEl.value = null;
      UIElem.dialogNewweightedItem.showModal();
    } else {
      alert('La tasa de cambio no ha sido configurada');
    }
  })

  UIElem.dialogExchangeRate.addEventListener('close', () => {
    // Capture info about the exchange rate
    // and save it to local storage

    const exRateInputEl = UIElem.dialogExchangeRate
      .querySelector('[data-input="exchange-rate"]');
    const exRate = exRateInputEl.value;

    if (exRate !== undefined && exRate > 0) {
      State.exchangeRate = exRate;
      UIElem.exchangeRateEl.innerText = (parseFloat(exRate)).toFixed(2);
      Local.saveExRate();
    } else {
      alert('Tasa de cambio no actualizada');
    }

    // Update item's price when the exchange rate changes
    UIElem.dialogExchangeRate.dispatchEvent(renderList);
  })

  UIElem.dialogNewItem.addEventListener('close', () => {
    // Capture user info about the product and
    // send it through the event detail object

    const dialogEl = UIElem.dialogNewItem;
    const quantityEl = dialogEl.querySelector('[data-input="quantity"]');
    const priceEl = dialogEl.querySelector('[data-input="price"]');
    const currencyEl = dialogEl.querySelector('[data-input="currency"]');
    const productEl = dialogEl.querySelector('[data-input="name"]');
    const product = (productEl.value).trim();
    const currency = currencyEl.value;
    const quantity = quantityEl.value;
    let price = (parseFloat(priceEl.value) * parseInt(quantity)).toFixed(2);

    if (product !== '' && price !== null) {
      updateList.detail.product = `${quantity} ${product}`;
      updateList.detail.currency = currency;
      updateList.detail.quantity = quantity;
      updateList.detail.price = price;

      UIElem.dialogNewItem.dispatchEvent(updateList);
    }
  })

  UIElem.dialogNewweightedItem.addEventListener('close', () => {
    const dialogEl = UIElem.dialogNewweightedItem;
    const weightEl = dialogEl.querySelector('[data-input="weight"]');
    const priceEl = dialogEl.querySelector('[data-input="price"]');
    const currencyEl = dialogEl.querySelector('[data-input="currency"]');
    const productEl = dialogEl.querySelector('[data-input="name"]');
    const weight = weightEl.value;
    const currency = currencyEl.value;
    const product = (productEl.value).trim();
    const price = (parseFloat(priceEl.value) * parseFloat(weight)).toFixed(2);

    if (product !== '' && price !== null) {
      updateList.detail.price = price;
      updateList.detail.currency = currency;
      updateList.detail.product = `${weight}Kg de ${product}`;

      UIElem.dialogNewItem.dispatchEvent(updateList);
    }
  })

  UIElem.mainContainer.addEventListener('updateList', (e) => {
    // Receive captured info about the product
    // saving it in the State module and localStorage 

    const product = e.detail.product;
    const currency = e.detail.currency;
    let price = e.detail.price;

    if (currency === 'bs') {
      price = (price / State.exchangeRate);
    }
    State.savedItems[product] = price;
    Local.saveList();
    UIElem.mainContainer.dispatchEvent(renderList);
  })


  UIElem.mainContainer.addEventListener('renderList', () => {
    // Clear out the actual displayed list of items
    UIElem.clearList();

    if (!(State.savedItems.hasOwnProperty()) && 'savedItems' in localStorage) {
      // Runs when the saved items list obj is empty
      State.savedItems = Local.read();
    }

    // Render all saved items on the list
    for (const key in State.savedItems) {
      const price = parseFloat(State.savedItems[key]);
      const priceInBs = price * parseFloat(State.exchangeRate);
      UIElem.itemContainer.appendChild(
        createItem(key, (priceInBs).toFixed(2))
      )
    }
    UIElem.mainContainer.dispatchEvent(renderTotalUSD);
  })


  UIElem.mainContainer.addEventListener('renderTotalUSD', () => {
    // Total all product prices in USD
    let total = 0;
    for (const key in State.savedItems) {
      total += parseFloat(State.savedItems[key]);
    }
    UIElem.totalPriceUSD.innerText = (total).toFixed(2);

    renderTotalBs.detail.totalInUSD = total;
    UIElem.mainContainer.dispatchEvent(renderTotalBs);
  })


  UIElem.mainContainer.addEventListener('renderTotalBs', (e) => {
    // Exchange the product prices from USD to Bs
    let total = e.detail.totalInUSD;
    total *= parseFloat(State.exchangeRate); 
    UIElem.totalPriceBs.innerText = (total).toFixed(2);
  })


  // -----------------
  // one time run code


  if ('exchangeRate' in localStorage) {
    const exRate = localStorage.getItem('exchangeRate');
    State.exchangeRate = exRate;
    UIElem.exchangeRateEl.innerText = (parseFloat(exRate)).toFixed(2);
  } else {
    alert('Tasa de cambio no configurada');
    UIElem.exchangeRateEl.innerText = 0;
  }

  UIElem.mainContainer.dispatchEvent(renderList);
}

main()
