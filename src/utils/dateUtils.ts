// Utility function to format dates in British English format (DD/MM/YYYY)
export const formatDateBritish = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
