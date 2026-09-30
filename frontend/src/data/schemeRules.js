// Scheme rules + "AdiSetu Advisor" benefit optimizer (rule-based, deterministic - no LLM).
//
// RULE MODEL (prototype - Super Admin configurable, to be confirmed against current MoTA guidelines):
//   kind: 'scholarship' -> the main award. Per the problem statement, a student can avail only ONE
//                          scholarship/fellowship scheme at a time, so two scholarships always conflict.
//   kind: 'addon'       -> a supplementary grant tied to a circumstance (EMRS residency, PVTG status).
//                          It is not a scholarship in its own right, so it may be held alongside one
//                          scholarship of the same level.
// A "package" is therefore: one scholarship + every add-on the student qualifies for.
// The Advisor builds every valid package and picks the one with the highest total annual benefit.
//
// All rupee figures are INDICATIVE SAMPLE FIGURES used to rank options in the prototype - not official
// amounts. Components mirror how real scholarships are paid (maintenance allowance, fees, book grant).

// value        = indicative annual benefit in INR (sum of components)
// components   = how that benefit is made up, so the Advisor can show a breakdown
// state        = only for residents of that state (omit = central scheme)
// requiresInstitution / requiresTribeGroup = extra eligibility conditions
const S = (components, extra = {}) => ({
  kind: 'scholarship',
  components,
  value: components.reduce((t, c) => t + c.value, 0),
  ...extra,
});
const A = (components, extra = {}) => ({
  kind: 'addon',
  components,
  value: components.reduce((t, c) => t + c.value, 0),
  ...extra,
});

export const SCHEME_META = {
  // ---- Pre-Matric (Class 9-10) ----
  pre: S([
    { label: 'Maintenance allowance', value: 5000 },
    { label: 'Book & stationery grant', value: 3000 },
  ]),
  'pre-odisha': S([{ label: 'Merit award', value: 5000 }], { state: 'Odisha' }),
  'pre-jharkhand': S([
    { label: 'Maintenance stipend', value: 3000 },
    { label: 'Uniform & stationery', value: 1500 },
  ], { state: 'Jharkhand' }),
  'pre-mp': S([{ label: 'Education incentive', value: 4000 }], { state: 'Madhya Pradesh' }),
  // add-ons: held alongside one Pre-Matric scholarship
  'pre-emrs': A([
    { label: 'Residential learning support', value: 4000 },
    { label: 'Exam & coaching support', value: 2000 },
  ], { requiresInstitution: 'Eklavya' }),
  'pre-pvtg': A([
    { label: 'PVTG secondary grant', value: 7500 },
    { label: 'Travel & home-visit support', value: 3000 },
  ], { requiresTribeGroup: 'PVTG' }),

  // ---- Post-Matric (Class 11-12) ----
  pm: S([
    { label: 'Maintenance allowance', value: 27000 },
    { label: 'Course fees', value: 15000 },
    { label: 'Study tour charges', value: 3000 },
  ]),
  'pm-ekalyan': S([
    { label: 'Maintenance allowance', value: 26000 },
    { label: 'Tuition & admission fees', value: 16000 },
  ], { state: 'Jharkhand' }),
  'pm-prerana': S([
    { label: 'Maintenance allowance', value: 28400 },
    { label: 'Boarding & tuition', value: 16000 },
  ], { state: 'Odisha' }),
  'pm-iti': S([
    { label: 'Training stipend', value: 15000 },
    { label: 'Tool kit & fees', value: 8000 },
  ]),
  'pm-nec': S([{ label: 'Higher education stipend', value: 22000 }], { state: 'North East' }),
  'pm-cg': S([{ label: 'Degree assistance', value: 17000 }], { state: 'Chhattisgarh' }),

  // ---- Higher levels (not auto-recommended: admission/degree data is beyond this prototype) ----
  tc: S([
    { label: 'Tuition fees', value: 250000 },
    { label: 'Living allowance', value: 40000 },
    { label: 'Books & computer', value: 10000 },
  ]),
  'tc-law': S([{ label: 'Full course support', value: 400000 }]),
  'tc-aviation': S([{ label: 'Flight training & licensing', value: 3500000 }]),
  'tc-design': S([{ label: 'Full course support', value: 380000 }]),
  'tc-management': S([{ label: 'Full course support', value: 1200000 }]),
  nfst: S([{ label: 'Fellowship (annual)', value: 444000 }]),
  'nfst-humanities': S([{ label: 'Fellowship (annual)', value: 444000 }]),
  'nfst-climate': S([{ label: 'Fellowship (annual)', value: 480000 }]),
  'nfst-health': S([{ label: 'Fellowship (annual)', value: 540000 }]),
  nos: S([{ label: 'Overseas study support (annual)', value: 2500000 }]),
  'nos-stem': S([{ label: 'Overseas study support (annual)', value: 2600000 }]),
  'nos-medicine': S([{ label: 'Overseas study support (annual)', value: 2400000 }]),
  'nos-renewables': S([{ label: 'Overseas study support (annual)', value: 2500000 }]),
};

export const RULES = {
  oneScholarship: {
    id: 'one-scholarship',
    label: 'One scholarship at a time',
    text: 'A student can avail only one scholarship/fellowship scheme at a time.',
  },
  oneLevel: {
    id: 'one-level',
    label: 'One education level at a time',
    text: 'Schemes for a different education level cannot be held together.',
  },
};

const meta = (id) => SCHEME_META[id] || { value: 0, kind: 'scholarship', components: [] };
const byId = (schemes, id) => schemes.find((s) => s.id === id);

export const kindOf = (id) => meta(id).kind;
export const componentsOf = (id) => meta(id).components || [];
export const valueOf = (id) => meta(id).value;

export function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// Returns null if a and b can be held together, else { rule, message }.
export function findConflict(aId, bId, schemes) {
  if (aId === bId) return null;
  const a = byId(schemes, aId);
  const b = byId(schemes, bId);
  if (!a || !b) return null;
  if (a.category !== b.category) {
    return { rule: RULES.oneLevel, message: RULES.oneLevel.text };
  }
  // same level: two scholarships clash; an add-on sits alongside a scholarship
  if (kindOf(aId) === 'scholarship' && kindOf(bId) === 'scholarship') {
    return { rule: RULES.oneScholarship, message: RULES.oneScholarship.text };
  }
  return null;
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
  return ids.reduce((sum, id) => sum + meta(id).value, 0);
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
  if (m.requiresInstitution && !(student.institution || '').includes(m.requiresInstitution)) return false;
  if (m.requiresTribeGroup && !(student.tribeGroup || '').includes(m.requiresTribeGroup)) return false;
  return true;
}

/**
 * Sequential one-at-a-time advisor. Finds the single best scheme the student should apply for
 * RIGHT NOW — the highest-value eligible scheme that doesn't conflict with anything already applied.
 *
 * Call it, apply the recommendation, call it again → it gives the NEXT best, and so on until
 * the student has maximized their total benefit.
 *
 * Returns null if there's nothing left to recommend.
 * Otherwise returns { pick, runnerUp, gain, alreadyClaimed, afterThis, remaining, ... }.
 */
export function recommendNext(student, schemes, appliedIds = []) {
  const category = levelCategory(student);
  if (!category) return null;
  const state = studentState(student);

  // All schemes this student is eligible for at their education level
  const eligible = schemes.filter((s) => s.category === category && qualifies(s.id, student, state));

  // What's already applied and how much it's worth
  const alreadyAppliedEligible = eligible.filter((s) => appliedIds.includes(s.id));
  const alreadyClaimed = bundleValue(appliedIds.filter((id) => eligible.some((s) => s.id === id)));

  // Which eligible schemes haven't been applied to yet AND don't conflict with anything applied?
  const available = eligible.filter((s) => {
    if (appliedIds.includes(s.id)) return false;
    const conflict = conflictWith(appliedIds, s.id, schemes);
    return !conflict;
  });

  if (available.length === 0) {
    // Nothing left to recommend — either all applied or all blocked
    const totalEligible = eligible.length;
    const totalApplied = alreadyAppliedEligible.length;
    return {
      done: true,
      pick: null,
      alreadyClaimed,
      totalApplied,
      totalEligible,
      category,
    };
  }

  // Sort by value descending — pick the best one
  const ranked = available
    .map((s) => ({ id: s.id, value: valueOf(s.id), kind: kindOf(s.id) }))
    .sort((a, b) => b.value - a.value);

  const pick = ranked[0];
  const runnerUp = ranked[1] || null;
  const gain = runnerUp ? pick.value - runnerUp.value : null;

  // What would get blocked if the student applies to this pick?
  const wouldBlock = available.filter((s) => {
    if (s.id === pick.id) return false;
    const conflict = findConflict(pick.id, s.id, schemes);
    return !!conflict;
  }).map((s) => s.id);

  // How many more could still be applied after this one?
  const hypotheticalApplied = [...appliedIds, pick.id];
  const afterThis = available.filter((s) => {
    if (s.id === pick.id) return false;
    const conflict = conflictWith(hypotheticalApplied, s.id, schemes);
    return !conflict;
  });

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
