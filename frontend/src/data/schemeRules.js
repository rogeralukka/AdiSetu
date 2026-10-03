// Scheme rules + "AdiSetu Advisor" (rule-based, deterministic - no LLM).
//
// WHERE THE NUMBERS COME FROM
//   Every rupee figure below is the rate printed in that scheme's own guideline (checked 3 Oct 2026):
//   MoTA Pre-Matric / Post-Matric guidelines, Ministry of Education NMMSS guideline, etc.
//   Where a scheme pays by course group or by day-scholar / hosteller, the Advisor uses the rate that
//   matches the demo students (Class 9-12, day scholar). The full range is on each scheme's detail page.
//
// RULE MODEL
//   Per the problem statement, "a student can avail only one scholarship/fellowship scheme at a time".
//   Each scheme in this catalogue also says so in its own guideline (Pre-Matric: "should not be getting
//   any other scholarship"; NMMSS cl. 4.1: "only one Scholarship under any Central Government
//   Scholarship scheme"; Post-Matric 3.2.2; Top Class 2.1 Note 1; and so on). So any two schemes clash.
//
// ADVISOR SCOPE
//   The Advisor covers school-level students (Class 9-12). Higher-level schemes (Top Class, NFST,
//   NOS, college scholarships) are listed for browsing but not auto-recommended: that needs
//   admission / degree data this prototype does not hold.

// value      = annual amount in INR at the rate the demo students get (sum of components)
// components = how that amount is made up, so the Advisor can show a breakdown
// classes    = school classes the scheme covers (omit = higher level, never auto-recommended)
// state      = only for residents of that state (omit = open to every state)
// requires   = extra eligibility test on the student profile
const S = (components, extra = {}) => ({
  kind: 'scholarship',
  components,
  value: components.reduce((t, c) => t + c.value, 0),
  ...extra,
});
const HIGHER_LEVEL = (extra = {}) => ({ kind: 'scholarship', components: [], value: null, ...extra });

// NMMSS covers only these school types (private, Kendriya Vidyalaya, Navodaya and other residential
// schools are excluded in the guideline).
const NMMSS_SCHOOL_TYPES = ['Government', 'Government-aided', 'Local body'];

export const SCHEME_META = {
  // ---- School level (Class 9-12) ----
  pre: S(
    [
      { label: 'Scholarship (10 months × ₹225, day scholar)', value: 2250 },
      { label: 'Books & ad hoc grant (day scholar)', value: 750 },
    ],
    { classes: [9, 10] }
  ),
  nmmss: S([{ label: 'Annual scholarship', value: 12000 }], {
    classes: [9, 10, 11, 12],
    requires: (student) =>
      NMMSS_SCHOOL_TYPES.includes(student?.schoolType) && student?.nmmssSelected === true,
  }),
  pm: S([{ label: 'Maintenance allowance (Class 11–12, day scholar)', value: 2300 }], { classes: [11, 12] }),

  // ---- Higher level: browse only ----
  tc: HIGHER_LEVEL(),
  nfst: HIGHER_LEVEL(),
  nos: HIGHER_LEVEL(),
  csss: HIGHER_LEVEL(),
  pragati: HIGHER_LEVEL(),
  saksham: HIGHER_LEVEL(),
  'ishan-uday': HIGHER_LEVEL(),
  mgjsmoss: HIGHER_LEVEL({ state: 'Jharkhand' }),
};

export const RULES = {
  oneScholarship: {
    id: 'one-scholarship',
    label: 'One scholarship at a time',
    text: 'A student can avail only one scholarship/fellowship scheme at a time.',
  },
};

const meta = (id) => SCHEME_META[id] || { value: null, kind: 'scholarship', components: [] };
const byId = (schemes, id) => schemes.find((s) => s.id === id);

export const kindOf = (id) => meta(id).kind;
export const componentsOf = (id) => meta(id).components || [];
export const valueOf = (id) => meta(id).value || 0;
// True when we can state a full annual rupee amount for this scheme (school-level schemes only).
export const isQuantified = (id) => typeof meta(id).value === 'number' && meta(id).value > 0;

export function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Returns null if a and b can be held together, else { rule, message }.
export function findConflict(aId, bId, schemes) {
  if (aId === bId) return null;
  if (!byId(schemes, aId) || !byId(schemes, bId)) return null;
  return { rule: RULES.oneScholarship, message: RULES.oneScholarship.text };
}

// First already-selected scheme that blocks `candidateId`, or null.
export function conflictWith(selectedIds, candidateId, schemes) {
  for (const sid of selectedIds) {
    if (sid === candidateId) continue;
    const c = findConflict(sid, candidateId, schemes);
    if (c) return { blockerId: sid, ...c };
  }
  return null;
}

export function isValidBundle(ids, schemes) {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (findConflict(ids[i], ids[j], schemes)) return false;
    }
  }
  return true;
}

export function bundleValue(ids) {
  return ids.reduce((sum, id) => sum + valueOf(id), 0);
}

const STATES = ['Jharkhand', 'Odisha', 'Madhya Pradesh', 'Chhattisgarh', 'Maharashtra', 'Assam'];
function studentState(student) {
  const addr = student?.address || '';
  return STATES.find((s) => addr.includes(s)) || null;
}

function levelCategory(student) {
  const cls = Number(student?.class);
  if (!cls) return null;
  if (cls <= 10) return 'Pre-Matric';
  if (cls <= 12) return 'Post-Matric';
  return null; // higher levels need admission/degree data beyond this prototype
}

function qualifies(id, student, state) {
  const m = meta(id);
  if (m.state && m.state !== state) return false;
  if (m.requires && !m.requires(student)) return false;
  return true;
}

/**
 * Sequential one-at-a-time advisor. Finds the single best scheme the student should apply for
 * RIGHT NOW: the highest-paying eligible scheme that doesn't conflict with anything already applied.
 *
 * Returns null if the student is outside the Advisor's scope or qualifies for nothing.
 * When there is nothing left to apply for, returns { done: true, ... } and says whether a
 * higher-paying scheme exists that the student is currently blocked from (`better`).
 */
export function recommendNext(student, schemes, appliedIds = []) {
  const category = levelCategory(student);
  if (!category) return null;
  const cls = Number(student.class);
  const state = studentState(student);

  // Every scheme this student qualifies for at their class
  const eligible = schemes.filter(
    (s) => (meta(s.id).classes || []).includes(cls) && qualifies(s.id, student, state)
  );
  if (eligible.length === 0) return null;

  const alreadyAppliedEligible = eligible.filter((s) => appliedIds.includes(s.id));
  const alreadyClaimed = bundleValue(alreadyAppliedEligible.map((s) => s.id));

  // Not applied yet AND not blocked by anything already applied
  const available = eligible.filter(
    (s) => !appliedIds.includes(s.id) && !conflictWith(appliedIds, s.id, schemes)
  );

  if (available.length === 0) {
    const topApplied = [...alreadyAppliedEligible].sort((a, b) => valueOf(b.id) - valueOf(a.id))[0];
    // Eligible schemes the student is NOT holding: every one of them is blocked by what they hold.
    const blocked = eligible
      .filter((s) => !appliedIds.includes(s.id))
      .map((s) => ({ id: s.id, value: valueOf(s.id), kind: kindOf(s.id) }))
      .sort((a, b) => b.value - a.value);
    const currentBest = topApplied
      ? { id: topApplied.id, value: valueOf(topApplied.id), kind: kindOf(topApplied.id) }
      : null;
    const runnerUp = blocked[0] || null;
    const better = currentBest && runnerUp && runnerUp.value > currentBest.value ? runnerUp : null;
    const gain =
      currentBest && runnerUp && currentBest.value > runnerUp.value ? currentBest.value - runnerUp.value : null;

    return {
      done: true,
      pick: null,
      currentBest,
      runnerUp,
      better,
      betterGain: better ? better.value - currentBest.value : null,
      gain,
      alreadyClaimed,
      totalApplied: alreadyAppliedEligible.length,
      totalEligible: eligible.length,
      category,
    };
  }

  const ranked = available
    .map((s) => ({ id: s.id, value: valueOf(s.id), kind: kindOf(s.id) }))
    .sort((a, b) => b.value - a.value);

  const pick = ranked[0];
  const runnerUp = ranked[1] || null;
  const gain = runnerUp ? pick.value - runnerUp.value : null;

  // What would get blocked if the student applies to this pick?
  const wouldBlock = available
    .filter((s) => s.id !== pick.id && findConflict(pick.id, s.id, schemes))
    .map((s) => s.id);

  // How many more could still be applied after this one?
  const hypotheticalApplied = [...appliedIds, pick.id];
  const afterThis = available.filter(
    (s) => s.id !== pick.id && !conflictWith(hypotheticalApplied, s.id, schemes)
  );

  return {
    done: false,
    pick,
    runnerUp,
    gain,
    alreadyClaimed,
    afterThisTotal: alreadyClaimed + pick.value,
    afterThisRemaining: afterThis.length,
    wouldBlock,
    category,
    totalEligible: eligible.length,
    totalApplied: alreadyAppliedEligible.length,
    totalAvailable: available.length,
  };
}

// Keep the old function name as an alias so nothing breaks during transition
export const recommendPackages = recommendNext;
