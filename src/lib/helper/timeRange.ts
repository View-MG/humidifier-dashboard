// src/lib/helper/timeRange.ts

export type TimestampFilter = {
  $gte?: Date;
  $lte?: Date;
};

export type TimeRangeFilter = {
  timestamp?: TimestampFilter;
};

export function buildTimeFilter(
  searchParams: URLSearchParams
): TimeRangeFilter {
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: TimeRangeFilter = {};

  if (from || to) {
    filter.timestamp = {};

    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) {
        filter.timestamp.$gte = d;
      }
    }

    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) {
        filter.timestamp.$lte = d;
      }
    }

    // ถ้าไม่มีทั้ง $gte และ $lte ให้ลบ timestamp ทิ้ง
    if (
      filter.timestamp &&
      !filter.timestamp.$gte &&
      !filter.timestamp.$lte
    ) {
      delete filter.timestamp;
    }
  }

  return filter;
}
