import type { SpeechLogFilter } from "@/lib/types/speech";

export function buildSpeechFilter(
  searchParams: URLSearchParams
): SpeechLogFilter {
  const filter: SpeechLogFilter = {};

  const from = searchParams.get("from");
  const to = searchParams.get("to");

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

    if (
      filter.timestamp &&
      !filter.timestamp.$gte &&
      !filter.timestamp.$lte
    ) {
      delete filter.timestamp;
    }
  }

  const q = searchParams.get("q");
  if (q && q.trim().length > 0) {
    filter.text = {
      $regex: q.trim(),
      $options: "i",
    };
  }

  return filter;
}
