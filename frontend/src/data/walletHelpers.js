// How one document a scheme asks for stands against the signed-in student's wallet.
//
//   reused  - a wallet document that is in the wallet and still valid: nothing to upload
//   expired - a wallet document that is in the wallet but has expired: renew it first
//   missing - a wallet document the scheme expects, but this student's wallet does not hold it yet
//   other   - not a wallet document (uploaded or fetched for this one scheme): show its own status
//
// `req` is one entry of scheme.requiredDocuments ({ id, name, reused, status }).
// `reused: true` there only says "this kind of document normally comes from the wallet".
// Whether it really is in THIS student's wallet is decided here, so Priya and Birsa each see their own.
export function walletState(req, walletDocs = []) {
  if (!req?.reused) return { state: 'other', wallet: null };
  const wallet = walletDocs.find((d) => d.id === req.id) || null;
  if (!wallet) return { state: 'missing', wallet: null };
  if (wallet.status === 'Expired') return { state: 'expired', wallet };
  return { state: 'reused', wallet };
}

// Documents that stop an application going through cleanly: expired or missing wallet documents,
// plus documents the scheme itself marks as still pending / needing confirmation.
export function docsNeedingAttention(requiredDocuments = [], walletDocs = []) {
  return requiredDocuments.filter((req) => {
    if (req.status === 'Needs Confirmation' || req.status === 'Pending') return true;
    const { state } = walletState(req, walletDocs);
    if (state === 'expired' || state === 'missing') return true;
    // A non-wallet entry can still match a wallet document by id (e.g. income proof): honour expiry.
    const match = walletDocs.find((d) => d.id === req.id);
    return !!match && match.status === 'Expired';
  });
}

// Every document the chosen schemes ask for, once each (used on the apply screens).
export function requiredDocsFor(schemesList = []) {
  const seen = new Set();
  const out = [];
  schemesList.forEach((s) => {
    (s?.requiredDocuments || []).forEach((req) => {
      if (!seen.has(req.id)) {
        seen.add(req.id);
        out.push(req);
      }
    });
  });
  return out;
}
