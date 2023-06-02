// User Interface management module

const D = document;

export function clearList() {
  const list = itemContainer.querySelectorAll("new-item");
  list.forEach((item) => item.remove());
}

// header
export const exRateButton = D.querySelector("rate-button");

export const exchangeRateElem = D.querySelector(
  '[data-element="exchange-rate"]'
);
export const totalBsElem = D.querySelector('[data-element="total-bs"]');
export const totalUSDElem = D.querySelector('[data-element="total-usd"]');
export const addItemBtn = D.querySelector('[data-button="unitary-item"]');
export const addWeightedItem = D.querySelector('[data-button="weighted-item"]');

// containers
export const mainContainer = D.querySelector('[data-container="main"]');
export const itemContainer = D.querySelector('[data-container="list"]');

// dialogs

const exchangeRateDialog = D.querySelector('[data-dialog="exchange-rate"]');
const unitaryItemDialog = D.querySelector('[data-dialog="unitary-item"]');
const weightedItemDialog = D.querySelector('[data-dialog="weighted-item"]');

export const dialogs = {
  exchangeRate: {
    dialog: exchangeRateDialog,
    input: exchangeRateDialog.querySelector('[data-input="exchange-rate"]'),
  },
  unitaryItem: {
    dialog: unitaryItemDialog,
    inputQty: unitaryItemDialog.querySelector('[data-input="quantity"]'),
    inputProduct: unitaryItemDialog.querySelector('[data-input="name"]'),
    inputPrice: unitaryItemDialog.querySelector('[data-input="price"]'),
  },
  weightedItem: {
    dialog: weightedItemDialog,
    inputWeight: weightedItemDialog.querySelector('[data-input="weight"]'),
    inputProduct: weightedItemDialog.querySelector('[data-input="name"]'),
    inputPrice: weightedItemDialog.querySelector('[data-input="price"]'),
  },
};

// templates
export const newItemTemplate = D.querySelector('[data-template="new-item"]');
