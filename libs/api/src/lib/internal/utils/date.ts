const YEAR = /^\d{4}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Start of the year in UTC: fromYear('2020') → 2020-01-01T00:00:00.000Z */
export function fromYear(year: `${number}`): Date {
  if (!YEAR.test(year)) {
    throw new Error(`Invalid year: ${year}. Expected "YYYY".`);
  }
  return new Date(`${year}-01-01T00:00:00Z`);
}

/** Midnight in UTC: fromDate('2020-03-15') → 2020-03-15T00:00:00.000Z */
export function fromDate(date: `${number}-${number}-${number}`): Date {
  if (!DATE.test(date)) {
    throw new Error(`Invalid date: ${date}. Expected "YYYY-MM-DD".`);
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  // Date rolls 2021-02-30 over to March 2 and gives up on month 13: a real
  // day reads back as itself
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`Invalid date: ${date}. No such day.`);
  }
  return parsed;
}
