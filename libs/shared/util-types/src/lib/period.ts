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
