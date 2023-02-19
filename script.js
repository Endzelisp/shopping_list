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
    const clearList = function () {
      const list = itemContainer.querySelectorAll('.item');
      list.forEach((item) => item.remove());
    }

    return {
      exchangeRateBtn,
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
    const exRateInputEl = UIElem.dialogExchangeRate.querySelector('input#exchange-rate');
    const exRate = exRateInputEl.value;
    if (exRate !== undefined && exRate > 0) {
      State.exchangeRate = exRate;
      UIElem.exchangeRateBtn.innerText = exRate;
      localStorage.setItem('exchangeRate', exRate);
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
    const currencyEl = UIElem.dialogNewItem.querySelector('select#currency');
    const quantityEl = UIElem.dialogNewItem.querySelector('input#quantity');
    const product = productEl.value;
    const currency = currencyEl.value;
    const quantity = quantityEl.value;
    let price = priceEl.value;
    if (product !== '' && price !== null) {
      price *= parseInt(quantity);
      price = (currency === 'bs') ? price : (price * State.exchangeRate).toFixed(2);
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

  if ('exchangeRate' in localStorage) {
    const exRate = localStorage.getItem('exchangeRate');
    State.exchangeRate = exRate;
    UIElem.exchangeRateBtn.innerText = exRate;
  } else {
    alert('Tasa de cambio no configurada');
    UIElem.exchangeRateBtn.innerText = 0;
  }
}

main()
