// ============================================
// CONFIG — edit this before deploying!
// ============================================
//
// BUCKET_ID connects everyone's browser to the SAME shared little
// database, so all 4 of you can see each other's picks & votes.
//
// HOW TO GET ONE (takes 10 seconds, only needs to be done ONCE):
//   1. Open setup.html (double-click it, or visit yoursite.vercel.app/setup.html
//      after deploying)
//   2. Click "Generate our bucket"
//   3. Copy the ID it gives you and paste it below, replacing the placeholder
//   4. Save this file and (re)deploy to Vercel
//
// That's it — no accounts, no servers, no API keys needed.
// Buckets on kvdb.io auto-expire after ~30 days of no activity, which is
// perfect for a one-time hangout planning session.

const CONFIG = {
  FIREBASE_URL: "https://hangout-planner-936a5-default-rtdb.firebaseio.com/",
  STATE_KEY: "plan-state",
  POLL_INTERVAL_MS: 4000
};