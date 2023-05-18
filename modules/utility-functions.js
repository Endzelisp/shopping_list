export function generateId(product) {
  const randomStart = Math.random().toString().slice(-3);
  const randomEnd = Math.random().toString().slice(-3);
  const word = product.split(" ")[0];
  return randomStart + word + randomEnd;
}

export const isValidProduct = (product) =>
  product !== "" && typeof product === "string";

export const isValidNumber = (num) => !isNaN(num) && num > 0;

/**
 * Limit decimal places to two
 *
 * @param {number} floatNum Floating-point number to be limited
 */
export const roundToTwo = (floatNum) => Math.round(floatNum * 100) / 100;

//limitDecimal
