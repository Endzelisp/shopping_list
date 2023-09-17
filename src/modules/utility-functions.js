/**
 * Generates a unique ID for a given product.
 *
 * @param {string} product - The name of the product to generate an ID for.
 * @returns {string} Returns a unique ID string for the product.
 *
 */
export function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}

/**
 * Checks if the input is a valid product
 *
 * @param {string} product The product string to validate
 * @returns {boolean} Returns true if the input is a non-empty string, and false otherwise
 *
 */
export const isValidProduct = (product) =>
  product !== "" && typeof product === "string";

/**
 * Check if the data-type is a number and if it is greater than zero
 *
 * @param {number} num The input number to check
 * @returns {boolean} Returns true if the input is a positive number, and false otherwise
 */
export const isValidNumber = (num) => !isNaN(num) && num > 0;

/**
 * Limit decimal places to two
 *
 * @param {number} floatNum Floating-point number to be limited
 */
export const roundToTwo = (floatNum) => Math.round(floatNum * 100) / 100;
