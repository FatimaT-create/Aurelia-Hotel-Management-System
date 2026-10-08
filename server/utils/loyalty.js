// Loyalty tiers based on accumulated points.
// Points are earned at a fixed rate per PKR spent (kept simple & transparent).
const POINTS_PER_PKR = 0.01; // 1 point per Rs 100 spent

const TIERS = [
  { name: "Platinum", min: 5000 },
  { name: "Gold", min: 2000 },
  { name: "Silver", min: 500 },
  { name: "Bronze", min: 0 },
];

function tierForPoints(points) {
  return TIERS.find((t) => points >= t.min).name;
}

function nextTierInfo(points) {
  const sorted = [...TIERS].sort((a, b) => a.min - b.min);
  const next = sorted.find((t) => t.min > points);
  if (!next) return { nextTier: null, pointsToNext: 0 };
  return { nextTier: next.name, pointsToNext: next.min - points };
}

function pointsEarned(amountPKR) {
  return Math.round(amountPKR * POINTS_PER_PKR);
}

module.exports = { tierForPoints, nextTierInfo, pointsEarned, TIERS };
