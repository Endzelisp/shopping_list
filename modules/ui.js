// User Interface management module

function _getElem(selector) {
  return document.querySelector(selector);
}

export function clearList() {
  const list = itemContainer.querySelectorAll("new-item");
  list.forEach((item) => item.remove());
}

// header
export const exchangeRateElem = _getElem('[data-element="exchange-rate"]');
export const totalBsElem = _getElem('[data-element="total-bs"]');
export const totalUSDElem = _getElem('[data-element="total-usd"]');
export const addItemBtn = _getElem('[data-button="unitary-item"]');
export const addWeightedItem = _getElem('[data-button="weighted-item"]');

// containers
export const mainContainer = _getElem('[data-container="main"]');
export const itemContainer = _getElem('[data-container="list"]');

// dialogs
export const dialogExchangeRate = _getElem('[data-dialog="exchange-rate"]');
export const dialogUnitaryItem = _getElem('[data-dialog="unitary-item"]');
export const dialogWeightedItem = _getElem('[data-dialog="weighted-item"]');

// templates
export const newItemTemplate = _getElem('[data-template="new-item"]');
