// utils/getMonthLabel.js
export function getMonthLabel(monthStr) {
  // monthStr expected format: "YYYY-MM"
  const [year, monthNum] = monthStr.split("-").map(Number);

  // Start of the month
  const startDate = new Date(year, monthNum - 1, 1);

  // Determine end of month
  const now = new Date();
  let endDate;
  if (year === now.getFullYear() && monthNum === now.getMonth() + 1) {
    // Current month → use today
    endDate = now;
  } else {
    // Last day of the month
    endDate = new Date(year, monthNum, 0);
  }

  // Format as "DD MMM YYYY"
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}
