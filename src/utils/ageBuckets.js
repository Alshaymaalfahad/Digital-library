// The 40 seed stories have messy, overlapping age_range strings (e.g. "5-9
// سنوات", "6-10 سنوات"). The library UI wants exactly 3 clean, non-overlapping
// buckets: "٤-٦ سنوات", "٧-٩ سنوات", "١٠-١٢ سنة". This picks whichever bucket
// shares the most years with a story's raw range (ties go to the younger bucket).

export const AGE_BUCKETS = [
  { id: "4-6", label: "٤-٦ سنوات", min: 4, max: 6 },
  { id: "7-9", label: "٧-٩ سنوات", min: 7, max: 9 },
  { id: "10-12", label: "١٠-١٢ سنة", min: 10, max: 12 },
];

function parseRange(raw) {
  if (!raw) return null;
  const nums = raw.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const min = Number(nums[0]);
  const max = nums[1] ? Number(nums[1]) : min;
  return { min, max };
}

export function bucketForAgeRange(raw) {
  const range = parseRange(raw);
  if (!range) return null;

  let best = null;
  let bestOverlap = -1;
  for (const bucket of AGE_BUCKETS) {
    const overlap = Math.max(0, Math.min(range.max, bucket.max) - Math.max(range.min, bucket.min) + 1);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = bucket;
    }
  }
  return best;
}
