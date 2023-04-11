// -------------------------
// User Interface Management

export const UIElem = (function () {
  function _getElem(selector) {
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
    const list = itemContainer.querySelectorAll("new-product");
    list.forEach((item) => item.remove());
  };

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
})();

// -----------------------
// localStorage Management

export const Local = (function () {
  const saveList = function () {
    localStorage.setItem("savedItems", JSON.stringify(State.savedItems));
  };
  const read = function () {
    return JSON.parse(localStorage.savedItems);
  };
  const saveExRate = function () {
    localStorage.setItem("exchangeRate", State.exchangeRate);
  };

  return {
    saveList,
    saveExRate,
    read,
  };
})();

// -----------------------
// State Management Object

export const State = {
  exchangeRate: 0,
  savedItems: [],
};

export class Item {
  constructor(obj) {
    this.quantity = obj.quantity;
    this.weight = obj.weight;
    this.product = obj.product;
    this.price = obj.price;
    this.type = obj.type;
    this.id = obj.id;
  }
}

// ---------------
// Event Handlers

export const updateList = new CustomEvent("updateList", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

export const renderList = new CustomEvent("renderList", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

export const renderTotalUSD = new CustomEvent("renderTotalUSD", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

export const renderTotalBs = new CustomEvent("renderTotalBs", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

// ------------
//  Functions

export function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}

export function calculateTotal(item) {
  if (item.type === "unitary") {
    return parseFloat(item.price) * parseInt(item.quantity);
  } else if (item.type === "weighted") {
    return parseFloat(item.price) * parseFloat(item.weight);
  }
}
