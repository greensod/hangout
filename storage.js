// ============================================
// STORAGE — talks to kvdb.io so all 4 friends share state
// ============================================

const Storage = (() => {

  function baseUrl() {
    return `https://kvdb.io/${CONFIG.BUCKET_ID}/${CONFIG.STATE_KEY}`;
  }

  function defaultState() {
    return {
      proposals: {}, // name -> { date, activityId, activityLabel, submittedAt }
      votes: {}      // voterName -> proposalOwnerName
    };
  }

  let lastKnownGood = null;
  let offline = false;

  async function getState() {
    if (CONFIG.BUCKET_ID === "PASTE_YOUR_BUCKET_ID_HERE") {
      offline = true;
      return lastKnownGood || defaultState();
    }
    try {
      const res = await fetch(baseUrl(), { cache: "no-store" });
      if (res.status === 404) {
        offline = false;
        // Only treat as "nothing submitted yet" if we don't already have
        // a better local copy — otherwise a brief timing hiccup right
        // after a write could wipe out data we just saved.
        if (!lastKnownGood) lastKnownGood = defaultState();
        return lastKnownGood;
      }
      if (!res.ok) throw new Error("bad status " + res.status);
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : defaultState();
      // defensive merge in case of partial/old shape
      parsed.proposals = parsed.proposals || {};
      parsed.votes = parsed.votes || {};
      offline = false;
      lastKnownGood = parsed;
      return parsed;
    } catch (err) {
      console.warn("Storage.getState failed, using local fallback:", err);
      offline = true;
      return lastKnownGood || defaultState();
    }
  }

  async function setState(state) {
    lastKnownGood = state;
    if (CONFIG.BUCKET_ID === "PASTE_YOUR_BUCKET_ID_HERE") {
      offline = true;
      return false;
    }
    try {
      const res = await fetch(baseUrl(), {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error("bad status " + res.status);
      offline = false;
      return true;
    } catch (err) {
      console.warn("Storage.setState failed:", err);
      offline = true;
      return false;
    }
  }

  // read-modify-write helper to reduce (not eliminate) race conditions
  async function update(mutateFn) {
    const current = await getState();
    const next = mutateFn(current);
    await setState(next);
    return next;
  }

  function isOffline() {
    return offline;
  }

  return { getState, setState, update, isOffline, defaultState };
})();