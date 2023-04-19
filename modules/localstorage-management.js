// localstorage management module
import { State } from "./state.js";

export function saveList() {
  localStorage.setItem("savedItems", JSON.stringify(State.savedItems));
}

export function readList() {
  if (!("savedItems" in localStorage)) {
    return [];
  }
  const savedItems = JSON.parse(localStorage.savedItems);
  if (!Array.isArray(savedItems)) {
    delete localStorage.savedItems;
    return [];
  }
  return savedItems;
}

export function saveExRate() {
  localStorage.setItem("exchangeRate", State.exchangeRate);
}
