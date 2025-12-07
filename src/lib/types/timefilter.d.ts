export interface TimestampFilter {
  $gte?: Date;
  $lte?: Date;
}

export interface TimeRangeFilter {
  timestamp?: TimestampFilter;
}
