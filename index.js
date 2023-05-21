import * as UI from "./modules/ui.js";
import * as Local from "./modules/localstorage-management.js";
import {
  generateId,
  isValidProduct,
  isValidNumber,
  roundToTwo,
} from "./modules/utility-functions.js";
import { State } from "./modules/state.js";
import { ItemElement } from "./web-components/item/item.js";
import {
  updateList,
  renderList,
  renderTotalUSD,
  renderTotalBs,
} from "./modules/custom-events.js";

const ERROR_MESSAGE = {
  EXCHANGE_RATE_NOT_SET: "Tasa de cambio no actualizada",
  EXCHANGE_EQUAL_TO_ZERO: "La tasa de cambio no puede ser cero",
  INVALID_INPUT: "Datos invalidos o incompletos",
};

const CURRENCY_TYPE = {
  USD: "usd",
  BS: "bs",
};

const PRODUCT_TYPE = {
  UNITARY: "unitary",
  WEIGHTED: "weighted",
};

class Item {
  constructor(obj) {
    this.quantity = obj.quantity;
    this.weight = obj.weight;
    this.product = obj.product;
    this.rawPrice = obj.price;
    this.currency = obj.currency;
    this.type = obj.type;
    this.id = obj.id;
    this.totalPriceBs = this.#bs();
    this.totalPriceUSD = this.#usd();
  }

  #bs() {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === CURRENCY_TYPE.USD) {
      return subTotal * State.exchangeRate;
    }
    return subTotal;
  }

  #usd() {
    const subTotal =
      Number.parseFloat(this.rawPrice) * (this.quantity || this.weight);
    if (this.currency === CURRENCY_TYPE.BS) {
      return subTotal / State.exchangeRate;
    }
    return subTotal;
  }

  adjustPrice() {
    this.totalPriceBs = this.#bs();
    this.totalPriceUSD = this.#usd();
  }
}

UI.exchangeRateElem.addEventListener("pointerdown", () => {
  // Open up exchange rate dialog box
  UI.dialogExchangeRate.showModal();
});

UI.dialogExchangeRate.addEventListener("close", () => {
  // Capture info about the exchange rate
  // and save it to local storage

  const exRateInputEl = UI.dialogExchangeRate.querySelector(
    '[data-input="exchange-rate"]'
  );
  const exRate = Number.parseFloat(exRateInputEl.value);

  if (Number.isNaN(exRate)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }
  if (exRate === 0) {
    alert(ERROR_MESSAGE.EXCHANGE_EQUAL_TO_ZERO);
    return;
  }

  State.exchangeRate = exRate;
  UI.exchangeRateElem.innerText = roundToTwo(exRate);
  Local.saveExRate();

  // Update item's price when the exchange rate changes
  State.savedItems.forEach((item) => item.adjustPrice());
  UI.dialogExchangeRate.dispatchEvent(renderList);
});

UI.addItemBtn.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new item
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }

  const quantityEl = UI.dialogUnitaryItem.querySelector(
    '[data-input="quantity"]'
  );
  const productEl = UI.dialogUnitaryItem.querySelector('[data-input="name"]');
  const priceEl = UI.dialogUnitaryItem.querySelector('[data-input="price"]');
  quantityEl.value = 1;
  productEl.value = "";
  priceEl.value = null;
  UI.dialogUnitaryItem.showModal();
});

UI.dialogUnitaryItem.addEventListener("close", () => {
  // Capture user info about the product

  const dialogEl = UI.dialogUnitaryItem;
  const quantityEl = dialogEl.querySelector('[data-input="quantity"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector("fieldset input:checked");
  const productEl = dialogEl.querySelector('[data-input="name"]');

  if (dialogEl.returnValue === "close") {
    return;
  }

  const product = productEl.value.trim();
  const currency = currencyEl.value;
  const quantity = Number.parseInt(quantityEl.value);
  const price = roundToTwo(Number.parseFloat(priceEl.value));

  if (!isValidProduct(product) || !isValidNumber(price)) {
    alert(ERROR_MESSAGE.INVALID_INPUT);
    return;
  }

  updateList.detail.product = product;
  updateList.detail.currency = currency;
  updateList.detail.quantity = quantity;
  updateList.detail.price = price;
  updateList.detail.type = PRODUCT_TYPE.UNITARY;
  updateList.detail.weight = null;
  updateList.detail.id = generateId(product);
  UI.dialogUnitaryItem.dispatchEvent(updateList);
});

UI.addWeightedItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new weighted items
  // just if the exchangeRate is set

  if (!("exchangeRate" in localStorage)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }

  const productEl = UI.dialogWeightedItem.querySelector('[data-input="name"]');
  const priceEl = UI.dialogWeightedItem.querySelector('[data-input="price"]');
  const weightEl = UI.dialogWeightedItem.querySelector('[data-input="weight"]');
  productEl.value = "";
  priceEl.value = null;
  weightEl.value = null;
  UI.dialogWeightedItem.showModal();
});

UI.dialogWeightedItem.addEventListener("close", () => {
  // Capture user info about the weighted product
  // and send it through the event detail object

  const dialogEl = UI.dialogWeightedItem;
  const weightEl = dialogEl.querySelector('[data-input="weight"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector("fieldset input:checked");
  const productEl = dialogEl.querySelector('[data-input="name"]');

  if (dialogEl.returnValue === "close") {
    return;
  }

  // Add a zero before the decimal point if the user didn't do it
  let weight = weightEl.value;
  if (weight[0] === "." || weight[0] === ",") {
    weight = `0${weight}`;
  }
  weight = Number.parseFloat(weight);
  const currency = currencyEl.value;
  const product = productEl.value.trim();
  const price = Number.parseFloat(priceEl.value);

  if (
    !isValidProduct(product) ||
    !isValidNumber(price) ||
    !isValidNumber(weight)
  ) {
    alert(ERROR_MESSAGE.INVALID_INPUT);
    return;
  }

  updateList.detail.weight = weight;
  updateList.detail.price = price;
  updateList.detail.product = product;
  updateList.detail.currency = currency;
  updateList.detail.type = PRODUCT_TYPE.WEIGHTED;
  updateList.detail.quantity = null;
  updateList.detail.id = generateId(product);
  UI.dialogUnitaryItem.dispatchEvent(updateList);
});

UI.mainContainer.addEventListener("updateList", (e) => {
  // Receive captured info about the product
  // saving it in the State module and localStorage

  const quantity = e.detail.quantity;
  const weight = e.detail.weight;
  const product = e.detail.product;
  const currency = e.detail.currency;
  const type = e.detail.type;
  const price = e.detail.price;
  const id = e.detail.id;

  State.savedItems.push(
    new Item({ quantity, weight, product, price, currency, type, id })
  );
  Local.saveList();
  UI.mainContainer.dispatchEvent(renderList);
});

UI.mainContainer.addEventListener("renderList", () => {
  UI.clearList();
  State.savedItems.forEach((item) => {
    const product = new ItemElement();
    product.loadData(
      `${item.quantity || item.weight.toString().concat(" Kg")} ${
        item.product
      }`,
      roundToTwo(item.totalPriceBs),
      item.id
    );
    UI.itemContainer.appendChild(product);
  });

  UI.mainContainer.dispatchEvent(renderTotalUSD);
});

UI.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (acc, current) => acc + current.totalPriceUSD,
    0
  );
  UI.totalUSDElem.innerText = roundToTwo(total);
  renderTotalBs.detail.totalInUSD = total;
  UI.mainContainer.dispatchEvent(renderTotalBs);
});

UI.mainContainer.addEventListener("renderTotalBs", (e) => {
  // Exchange the product prices from USD to Bs
  const totalUSD = e.detail.totalInUSD;
  const totalBs = totalUSD * State.exchangeRate;
  UI.totalBsElem.innerText = roundToTwo(totalBs);
});

// -------------
// Initial setup

function init() {
  if (!("exchangeRate" in localStorage)) {
    UI.exchangeRateElem.innerText = 0;
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }
  const exRate = Number.parseFloat(localStorage.getItem("exchangeRate"));
  State.exchangeRate = exRate;
  UI.exchangeRateElem.innerText = roundToTwo(exRate);
  State.savedItems = Local.readList();
  UI.mainContainer.dispatchEvent(renderList);
}

init();
