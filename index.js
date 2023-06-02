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
import { ExchangeRateButton } from "./web-components/exchange-rate-button/exchange-rate-button.js";

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

/**
 * Display the exchange rate dialog box
 */
UI.exRateButton.onpointerdown = () => {
  UI.dialogs.exchangeRate.dialog.showModal();
};

/**
 * Get the exchange rate and save it
 * */
UI.dialogs.exchangeRate.dialog.onclose = () => {
  if (UI.dialogs.exchangeRate.dialog.returnValue === "close") {
    return;
  }

  const exRateInput = UI.dialogs.exchangeRate.input;
  const exRate = Number.parseFloat(exRateInput.value);
  if (Number.isNaN(exRate)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }

  if (exRate === 0) {
    alert(ERROR_MESSAGE.EXCHANGE_EQUAL_TO_ZERO);
    return;
  }

  State.exchangeRate = exRate;
  UI.exRateButton.dataset.rate = exRate;
  UI.exchangeRateElem.innerText = roundToTwo(exRate);
  Local.saveExRate();

  // Update item's price when the exchange rate changes
  State.savedItems.forEach((item) => item.adjustPrice());
  UI.dialogs.exchangeRate.dialog.dispatchEvent(renderList);
};

/**
 * Display the dialog box to add a new item
 */
UI.addItemBtn.onpointerdown = () => {
  if (!("exchangeRate" in localStorage)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }

  const productEl = UI.dialogs.unitaryItem.inputProduct;
  const quantityEl = UI.dialogs.unitaryItem.inputQty;
  const priceEl = UI.dialogs.unitaryItem.inputPrice;

  // Set all input values to their default values
  productEl.value = productEl.defaultValue;
  quantityEl.value = quantityEl.defaultValue;
  priceEl.value = priceEl.defaultValue;
  UI.dialogs.unitaryItem.dialog.showModal();
};

/**
 * Get unitary product description
 */
UI.dialogs.unitaryItem.dialog.onclose = () => {
  const productEl = UI.dialogs.unitaryItem.inputProduct;
  const quantityEl = UI.dialogs.unitaryItem.inputQty;
  const priceEl = UI.dialogs.unitaryItem.inputPrice;
  const currencyEl = UI.dialogs.unitaryItem.dialog.querySelector(
    "fieldset input:checked"
  );

  if (UI.dialogs.unitaryItem.dialog.returnValue === "close") {
    return;
  }

  const product = productEl.value.trim();
  const quantity = Number.parseInt(quantityEl.value);
  const price = roundToTwo(Number.parseFloat(priceEl.value));
  const currency = currencyEl.value;

  if (!isValidProduct(product) || !isValidNumber(price)) {
    alert(ERROR_MESSAGE.INVALID_INPUT);
    return;
  }

  updateList.detail.product = product;
  updateList.detail.quantity = quantity;
  updateList.detail.weight = null;
  updateList.detail.price = price;
  updateList.detail.currency = currency;
  updateList.detail.type = PRODUCT_TYPE.UNITARY;
  updateList.detail.id = generateId(product);
  UI.dialogs.unitaryItem.dialog.dispatchEvent(updateList);
};

/**
 * Display the dialog box to add a new weighted item
 */
UI.addWeightedItem.onpointerdown = () => {
  if (!("exchangeRate" in localStorage)) {
    alert(ERROR_MESSAGE.EXCHANGE_RATE_NOT_SET);
    return;
  }

  const productEl = UI.dialogs.weightedItem.inputProduct;
  const weightEl = UI.dialogs.weightedItem.inputWeight;
  const priceEl = UI.dialogs.weightedItem.inputPrice;

  // Set all input values to their default values
  productEl.value = productEl.defaultValue;
  weightEl.value = weightEl.defaultValue;
  priceEl.value = priceEl.defaultValue;
  UI.dialogs.weightedItem.dialog.showModal();
};

/**
 * Get weighted product description
 */
UI.dialogs.weightedItem.dialog.onclose = () => {
  const productEl = UI.dialogs.weightedItem.inputProduct;
  const weightEl = UI.dialogs.weightedItem.inputWeight;
  const priceEl = UI.dialogs.weightedItem.inputPrice;
  const currencyEl = UI.dialogs.weightedItem.dialog.querySelector(
    "fieldset input:checked"
  );

  if (UI.dialogs.weightedItem.dialog.returnValue === "close") {
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

  updateList.detail.product = product;
  updateList.detail.weight = weight;
  updateList.detail.quantity = null;
  updateList.detail.price = price;
  updateList.detail.currency = currency;
  updateList.detail.type = PRODUCT_TYPE.WEIGHTED;
  updateList.detail.id = generateId(product);
  UI.dialogs.unitaryItem.dialog.dispatchEvent(updateList);
};

/**
 * Receive the info about the product saving it
 *  in the State module and localStorage
 */
UI.mainContainer.addEventListener("updateList", (e) => {
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

/**
 *  Render the item's list
 */
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

/**
 * Calculate total in USD and display the result
 */
UI.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (acc, current) => acc + current.totalPriceUSD,
    0
  );
  UI.totalUSDElem.innerText = roundToTwo(total);
  renderTotalBs.detail.totalInUSD = total;
  UI.mainContainer.dispatchEvent(renderTotalBs);
});

/**
 * Calculate total in Bs and display the result
 */
UI.mainContainer.addEventListener("renderTotalBs", (e) => {
  const totalUSD = e.detail.totalInUSD;
  const totalBs = totalUSD * State.exchangeRate;
  UI.totalBsElem.innerText = roundToTwo(totalBs);
});

/**
 * Load information from localStorage and initalize the webApp
 */
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
