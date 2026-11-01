/**
 * Generate a unique human-friendly Order Number
 * e.g. BB-20261031-8492
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `BB-${dateStr}-${randomDigits}`;
};

module.exports = {
  generateOrderNumber
};
