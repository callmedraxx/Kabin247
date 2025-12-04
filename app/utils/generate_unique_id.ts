import { customAlphabet } from 'nanoid';
import Order from '#models/order';

export function generateNanoId(length: number = 6) {
  const nanoId = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', length);
  return nanoId();
}

/**
 * Generate unique order number in format: {PREFIX}{NUMBER}
 * Example: KA25534, KA25535, etc.
 * 
 * Format: 2-letter prefix + 5-digit sequential number (padded with zeros)
 * The number increments globally (not per day) to ensure uniqueness
 */
export async function generateUniqueOrderNumber(prefix: string = 'KA'): Promise<string> {
  // Ensure prefix is uppercase and exactly 2 characters
  const normalizedPrefix = prefix.toUpperCase().slice(0, 2).padEnd(2, 'A');
  
  // Get all existing order numbers that start with this prefix
  const existingOrders = await Order.query()
    .where('order_number', 'like', `${normalizedPrefix}%`)
    .orderBy('id', 'desc');
  
  let nextNumber = 1;
  
  if (existingOrders.length > 0) {
    // Extract the highest number from existing orders with this prefix
    const numbers = existingOrders
      .map((order) => {
        // Extract numeric part after prefix (e.g., "QE25534" -> 25534)
        const match = order.orderNumber.match(new RegExp(`^${normalizedPrefix}(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => num > 0);
    
    if (numbers.length > 0) {
      const maxNumber = Math.max(...numbers);
      nextNumber = maxNumber + 1;
    }
  }
  
  // Format number with leading zeros (5 digits minimum, but can grow)
  // If number exceeds 99999, it will use more digits automatically
  const formattedNumber = nextNumber.toString().padStart(5, '0');
  
  return `${normalizedPrefix}${formattedNumber}`;
}
