export const State = (function () {
  return {
    exchangeRate: 0,
    savedItems: [],

    /**
     * Delete an element from the savedList array
     *
     * @param { string } id Identifier of the element to be deleted
     */
    deleteItem(id) {
      this.savedItems = this.savedItems.filter((item) => item.id !== id);
    },
  };
})();
