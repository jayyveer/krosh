/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a price value with the ₹ symbol
 * @param price - The price value to format
 * @returns Formatted price string with ₹ symbol
 */
export const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined) return '₹0.00';
  
  // Convert to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format with ₹ symbol and 2 decimal places
  return `₹${numericPrice.toFixed(2)}`;
};
