import { UIElem, Local, State } from "./modules.js";

// ----------------
//  Custom Events

const updateList = new CustomEvent("updateList", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

const renderList = new CustomEvent("renderList", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

const renderTotalUSD = new CustomEvent("renderTotalUSD", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

const renderTotalBs = new CustomEvent("renderTotalBs", {
  detail: {},
  bubbles: true,
  cancelable: false,
  composed: false,
});

// ------------
//  Functions

function createItem(name, price, id) {
  function _removeItemFn() {
    const itemEl = this.parentElement;
    const id = itemEl.getAttribute("id");
    const indexToDelete = State.savedItems.findIndex((item) => item.id === id);
    State.savedItems.splice(indexToDelete, 1);
    Local.saveList();
    itemEl.remove();
    UIElem.mainContainer.dispatchEvent(renderList);
  }

  const clone = UIElem.template.content.cloneNode(true);
  const newItem = clone.querySelector('[data-item="container"]');
  const itemName = newItem.querySelector('[data-item="name"]');
  const itemPrice = newItem.querySelector('[data-item="price"]');
  const removeItem = newItem.querySelector('[data-item="delete"]');
  newItem.setAttribute("id", id);
  removeItem.addEventListener("pointerdown", _removeItemFn);
  itemName.innerText = name;
  itemPrice.innerText = `${price} Bs.`;
  return newItem;
}

function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}

function calculateTotal(item) {
  if (item.type === "unitary") {
    return parseFloat(item.price) * parseInt(item.quantity);
  } else if (item.type === "weighted") {
    return parseFloat(item.price) * parseFloat(item.weight);
  }
}

class Item {
  constructor(obj) {
    this.quantity = obj.quantity;
    this.weight = obj.weight;
    this.product = obj.product;
    this.price = obj.price;
    this.type = obj.type;
    this.id = obj.id;
  }
}

// ----------------
//  event handlers

UIElem.exchangeRateEl.addEventListener("pointerdown", () => {
  // Open up exchange rate dialog box
  UIElem.dialogExchangeRate.showModal();
});

UIElem.dialogExchangeRate.addEventListener("close", () => {
  // Capture info about the exchange rate
  // and save it to local storage

  const exRateInputEl = UIElem.dialogExchangeRate.querySelector(
    '[data-input="exchange-rate"]'
  );
  const exRate = exRateInputEl.value;

  if (exRate !== undefined && exRate > 0) {
    State.exchangeRate = exRate;
    UIElem.exchangeRateEl.innerText = parseFloat(exRate).toFixed(2);
    Local.saveExRate();
  } else {
    alert("Tasa de cambio no actualizada");
  }

  // Update item's price when the exchange rate changes
  UIElem.dialogExchangeRate.dispatchEvent(renderList);
});

UIElem.newItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new item
  // just if the exchangeRate is set

  if ("exchangeRate" in localStorage) {
    const quantityEl = UIElem.dialogNewItem.querySelector(
      '[data-input="quantity"]'
    );
    const productEl = UIElem.dialogNewItem.querySelector('[data-input="name"]');
    const priceEl = UIElem.dialogNewItem.querySelector('[data-input="price"]');
    quantityEl.value = 1;
    productEl.value = "";
    priceEl.value = null;
    UIElem.dialogNewItem.showModal();
  } else {
    alert("La tasa de cambio no ha sido configurada");
  }
});

UIElem.dialogNewItem.addEventListener("close", () => {
  // Capture user info about the product and
  // send it through the event detail object

  const dialogEl = UIElem.dialogNewItem;
  const quantityEl = dialogEl.querySelector('[data-input="quantity"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector('[data-input="currency"]');
  const productEl = dialogEl.querySelector('[data-input="name"]');
  const product = productEl.value.trim();
  const currency = currencyEl.value;
  const quantity = parseInt(quantityEl.value);
  const price = parseFloat(priceEl.value).toFixed(2);

  if (product !== "" && price !== null) {
    updateList.detail.product = product;
    updateList.detail.currency = currency;
    updateList.detail.quantity = quantity;
    updateList.detail.price = price;
    updateList.detail.type = "unitary";
    updateList.detail.weight = null;
    updateList.detail.id = generateId(product);

    UIElem.dialogNewItem.dispatchEvent(updateList);
  }
});

UIElem.newWeightedItem.addEventListener("pointerdown", () => {
  // Show up the dialog box to add a new weighted items
  // just if the exchangeRate is set

  if ("exchangeRate" in localStorage) {
    const productEl = UIElem.dialogNewweightedItem.querySelector(
      '[data-input="name"]'
    );
    const priceEl = UIElem.dialogNewweightedItem.querySelector(
      '[data-input="price"]'
    );
    const weightEl = UIElem.dialogNewweightedItem.querySelector(
      '[data-input="weight"]'
    );
    productEl.value = "";
    priceEl.value = null;
    weightEl.value = null;
    UIElem.dialogNewweightedItem.showModal();
  } else {
    alert("La tasa de cambio no ha sido configurada");
  }
});

UIElem.dialogNewweightedItem.addEventListener("close", () => {
  // Capture user info about the weighted product
  // and send it through the event detail object

  const dialogEl = UIElem.dialogNewweightedItem;
  const weightEl = dialogEl.querySelector('[data-input="weight"]');
  const priceEl = dialogEl.querySelector('[data-input="price"]');
  const currencyEl = dialogEl.querySelector('[data-input="currency"]');
  const productEl = dialogEl.querySelector('[data-input="name"]');

  // Add a zero before the decimal point if the user didn't do it
  let weight = weightEl.value;
  if (weight[0] === "." || weight[0] === ",") {
    weight = `0${weight}`;
  }
  weight = parseFloat(weight);
  const currency = currencyEl.value;
  const product = productEl.value.trim();
  const price = parseFloat(priceEl.value);

  if (product !== "" && price !== null) {
    updateList.detail.weight = weight;
    updateList.detail.price = price;
    updateList.detail.product = product;
    updateList.detail.currency = currency;
    updateList.detail.type = "weighted";
    updateList.detail.quantity = null;
    updateList.detail.id = generateId(product);

    UIElem.dialogNewItem.dispatchEvent(updateList);
  }
});

UIElem.mainContainer.addEventListener("updateList", (e) => {
  // Receive captured info about the product
  // saving it in the State module and localStorage

  const quantity = e.detail.quantity;
  const weight = e.detail.weight;
  const product = e.detail.product;
  const currency = e.detail.currency;
  const type = e.detail.type;
  let price = e.detail.price;
  const id = e.detail.id;

  if (currency === "bs") {
    price = price / State.exchangeRate;
  }
  State.savedItems.push(
    new Item({ quantity, weight, product, type, price, id })
  );
  Local.saveList();
  UIElem.mainContainer.dispatchEvent(renderList);
});

UIElem.mainContainer.addEventListener("renderList", () => {
  // Clear out the actual displayed list of items
  UIElem.clearList();
  const checkObj = State.savedItems.map((item) => item.product);
  if (checkObj.length === 0 && "savedItems" in localStorage) {
    // Runs if the savedItems list is empty
    State.savedItems = Local.read();
  }

  State.savedItems.forEach((item) => {
    const priceBs = calculateTotal(item) * parseFloat(State.exchangeRate);
    UIElem.itemContainer.appendChild(
      createItem(
        `${item.quantity || item.weight.toString().concat(" Kg")} ${
          item.product
        }`,
        priceBs.toFixed(2),
        item.id
      )
    );
  });

  UIElem.mainContainer.dispatchEvent(renderTotalUSD);
});

UIElem.mainContainer.addEventListener("renderTotalUSD", () => {
  const total = State.savedItems.reduce(
    (accumulator, currentValue) => accumulator + calculateTotal(currentValue),
    0
  );
  UIElem.totalPriceUSD.innerText = total.toFixed(2);
  renderTotalBs.detail.totalInUSD = total;
  UIElem.mainContainer.dispatchEvent(renderTotalBs);
});

UIElem.mainContainer.addEventListener("renderTotalBs", (e) => {
  // Exchange the product prices from USD to Bs
  let total = e.detail.totalInUSD;
  total *= parseFloat(State.exchangeRate);
  UIElem.totalPriceBs.innerText = total.toFixed(2);
});

// -----------------
// one time run code

if ("exchangeRate" in localStorage) {
  const exRate = localStorage.getItem("exchangeRate");
  State.exchangeRate = exRate;
  UIElem.exchangeRateEl.innerText = parseFloat(exRate).toFixed(2);
} else {
  alert("Tasa de cambio no configurada");
  UIElem.exchangeRateEl.innerText = 0;
}

UIElem.mainContainer.dispatchEvent(renderList);
