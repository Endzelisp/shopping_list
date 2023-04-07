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
    const list = itemContainer.querySelectorAll(".item");
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
  savedItems: {},
};
