// User Interface management module

function _getElem(selector) {
  return document.querySelector(selector);
}

export const mainContainer = _getElem('[data-container="data-container"]');
export const exchangeRateEl = _getElem('[data-rate="exchange-rate"]');
export const totalPriceBs = _getElem('[data-total="total-bs"]');
export const totalPriceUSD = _getElem('[data-total="total-usd"]');
export const newItem = _getElem('[data-button="new-item"]');
export const newWeightedItem = _getElem('[data-button="weighted-item"]');
export const itemContainer = _getElem('[data-container="main-list"]');
export const dialogExchangeRate = _getElem('[data-dialog="exchange-rate"]');
export const dialogNewItem = _getElem('[data-dialog="new-item"]');
export const dialogNewweightedItem = _getElem('[data-dialog="weighted-item"]');
export const template = _getElem('[data-template="new-item"]');

export const clearList = function () {
  const list = itemContainer.querySelectorAll("new-product");
  list.forEach((item) => item.remove());
};
