/**
 * Phone number formatting utilities
 * Ensures only numbers can be typed and formats as (xxx) xxx-xxxx
 */

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbersOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedNumbers = numbersOnly.slice(0, 10);
  
  // Format based on length
  if (limitedNumbers.length === 0) return '';
  if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
  if (limitedNumbers.length <= 6) return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
  return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Check if phone number has exactly 10 digits
  const numbersOnly = phoneNumber.replace(/\D/g, '');
  return numbersOnly.length === 10;
};

export const getPhoneNumberDigits = (phoneNumber: string): string => {
  // Extract only the digits from formatted phone number
  return phoneNumber.replace(/\D/g, '');
};

export const handlePhoneInputChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  callback: (formattedValue: string) => void
): void => {
  const { value } = event.target;
  const formatted = formatPhoneNumber(value);
  callback(formatted);
};