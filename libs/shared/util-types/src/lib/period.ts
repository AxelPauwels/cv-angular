/** A date range, e.g. a job or a study. `end` is absent while it is ongoing. */
export interface Period {
  start: Date;
  end?: Date;
}

/** A period as it travels over the wire: ISO 8601 strings, `null` while ongoing */
export interface PeriodDto {
  start: string;
  end: string | null;
}

export function toPeriod({ start, end }: PeriodDto): Period {
  return end
    ? { start: new Date(start), end: new Date(end) }
    : { start: new Date(start) };
}

/**
 * Sorts periods by the most recent end first: ongoing ones (no `end`) lead, ties
 * go to the latest start
 */
export function byEndNewestFirst(
  a: Pick<Period, 'start'> & { end?: Date | null },
  b: Pick<Period, 'start'> & { end?: Date | null }
): number {
  const endA = a.end?.getTime() ?? Number.POSITIVE_INFINITY;
  const endB = b.end?.getTime() ?? Number.POSITIVE_INFINITY;
  if (endA !== endB) return endB > endA ? 1 : -1;
  return b.start.getTime() - a.start.getTime();
}
