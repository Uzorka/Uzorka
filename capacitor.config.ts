import type { CapacitorConfig } from "@capacitor/cli";

// Native Android shell for Bible Explained. The web build in `dist/` is
// bundled into the app, so the whole Bible, John 1's study, audio, bookmarks,
// notes and the quiz all work fully offline — no server required.
//
// To point the app at the live Vercel site instead of the bundled build
// (so users get updates without a Play Store release), set `server.url` to
// your deployment URL. Left unset here for a self-contained, offline app.
const config: CapacitorConfig = {
  appId: "com.uzorka.bibleexplained",
  appName: "Bible Explained",
  webDir: "dist",
  backgroundColor: "#f6f4ef",
  android: {
    // Allow the WebView to keep audio (Web Speech narration) responsive.
    allowMixedContent: false,
  },
};

export default config;
