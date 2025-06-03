export const formatOrdinal = (num) => {
  const n = parseInt(num);
  return n + (['st','nd','rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th');
};

export const formatSection = (section) => {
  if (!section) return 'Not Assigned';
  return `Year ${section.year_level} - ${formatOrdinal(section.name)} Section`;
};