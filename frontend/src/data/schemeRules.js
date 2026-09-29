// Scheme rules + "AdiSetu Advisor" (rule-based, deterministic).
//
// PROTOTYPE RULE: the problem statement notes that a student can avail only ONE scholarship/fellowship
// scheme at a time, so every pair of schemes conflicts by default. The rule set is meant to be configured by
// the Super Admin (Eligibility Criteria tab) and confirmed against current MoTA guidelines before production.
// Values are INDICATIVE sample figures used only to rank options in the prototype - not official amounts.

// value      = indicative annual benefit in INR (sample data)
// state      = only for residents of that state (omit = central scheme)
// requiresInstitution / requiresTribeGroup = extra eligibility conditions
export const SCHEME_META = {
  // Pre-Matric
  pre: { value: 8000 },
  'pre-odisha': { value: 5000, state: 'Odisha' },
  'pre-jharkhand': { value: 4500, state: 'Jharkhand' },
  'pre-emrs': { value: 6000, requiresInstitution: 'Eklavya' },
  'pre-pvtg': { value: 10500, requiresTribeGroup: 'PVTG' },
  'pre-mp': { value: 4000, state: 'Madhya Pradesh' },
  // Post-Matric
  pm: { value: 45000 },
  'pm-ekalyan': { value: 42000, state: 'Jharkhand' },
  'pm-prerana': { value: 44400, state: 'Odisha' },
  'pm-iti': { value: 23000 },
  'pm-nec': { value: 22000, state: 'North East' },
  'pm-cg': { value: 17000, state: 'Chhattisgarh' },
  // Top Class
  tc: { value: 300000 },
  'tc-law': { value: 400000 },
  'tc-aviation': { value: 3500000 },
  'tc-design': { value: 380000 },
  'tc-management': { value: 1200000 },
  // NFST
  nfst: { value: 444000 },
  'nfst-humanities': { value: 444000 },
  'nfst-climate': { value: 480000 },
  'nfst-health': { value: 540000 },
  // NOS
  nos: { value: 2500000 },
  'nos-stem': { value: 2600000 },
  'nos-medicine': { value: 2400000 },
  'nos-renewables': { value: 2500000 },
};

export const RULES = {
  sameLevel: {
    id: 'one-at-a-time',
    label: 'One scheme at a time',
    text: 'A student can avail only one scholarship/fellowship scheme at a time.',
  },
  crossLevel: {
    id: 'one-at-a-time',
    label: 'One scheme at a time',
    text: 'A student can avail only one scholarship/fellowship scheme at a time.',
  },
};

const meta = (id) => SCHEME_META[id] || { value: 0 };
const byId = (schemes, id) => schemes.find((s) => s.id === id);

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
    return { rule: RULES.crossLevel, message: RULES.crossLevel.text };
  }
  return { rule: RULES.sameLevel, message: RULES.sameLevel.text };
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

// Best valid combination (max indicative annual value) among schemes the student can
// plausibly take (schemes already applied to are included, so the advisor can confirm a good choice). Exhaustive search over a tiny candidate set - deterministic, no LLM.
export function recommendBundle(student, schemes, appliedIds = []) {
  const category = levelCategory(student);
  if (!category) return null;
  const state = studentState(student);

  const candidates = schemes.filter((s) => {
    if (s.category !== category) return false;
    const m = meta(s.id);
    if (m.state && m.state !== state) return false;
    if (m.requiresInstitution && !(student.institution || '').includes(m.requiresInstitution)) return false;
    if (m.requiresTribeGroup && !(student.tribeGroup || '').includes(m.requiresTribeGroup)) return false;
    return true;
  });
  if (candidates.length === 0 || candidates.length > 12) return null;

  let best = { ids: [], value: 0 };
  const n = candidates.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    const ids = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) ids.push(candidates[i].id);
    if (!isValidBundle(ids, schemes)) continue;
    const value = bundleValue(ids);
    if (value > best.value) best = { ids, value };
  }
  if (best.ids.length === 0) return null;
  const ranked = candidates
    .map((c) => ({ id: c.id, value: meta(c.id).value }))
    .sort((a, b) => b.value - a.value);
  const runnerUp = ranked.find((r) => !best.ids.includes(r.id)) || null;
  const margin = runnerUp ? best.value - runnerUp.value : null;
  const newIds = best.ids.filter((id) => !appliedIds.includes(id));
  const appliedIn = best.ids.filter((id) => appliedIds.includes(id));
  return { ...best, newIds, appliedIn, category, considered: candidates.length, ranked, runnerUp, margin };
}
