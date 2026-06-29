// ============================================
// STORAGE — talks to Firebase Realtime Database
// so all 4 friends share the same state
// ============================================

const Storage = (() => {

  function url() {
    return `${CONFIG.FIREBASE_URL}/${CONFIG.STATE_KEY}.json`;
  }

  function defaultState() {
    return {
      proposals: {},
      votes: {}
    };
  }

  let lastKnownGood = null;
  let offline = false;

  function notConfigured() {
    return !CONFIG.FIREBASE_URL || CONFIG.FIREBASE_URL.includes("PASTE_YOUR");
  }

  async function getState() {
    if (notConfigured()) {
      offline = true;
      return lastKnownGood || defaultState();
    }
    try {
      const res = await fetch(url(), { cache: "no-store" });
      if (!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      const parsed = data || defaultState();
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
    if (notConfigured()) {
      offline = true;
      return false;
    }
    try {
      const res = await fetch(url(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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