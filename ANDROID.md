# Bible Explained — Android app

The Android app is the same web app wrapped in a native shell with
[Capacitor](https://capacitorjs.com/). The production web build (`dist/`) is
bundled into the app, so the whole Bible, the Gospel of John 1's study, audio
narration, bookmarks, notes and the quiz all work **fully offline** — no server
needed.

- **App name:** Bible Explained
- **Application ID:** `com.uzorka.bibleexplained`
- Native project lives in [`android/`](android/); config in
  [`capacitor.config.ts`](capacitor.config.ts).

## Prerequisites (on your machine)

1. **[Android Studio](https://developer.android.com/studio)** (latest stable).
   On first launch it installs the Android SDK and build tools.
2. **JDK 17** — Android Studio bundles one; no separate install needed.
3. **Node 20+** and this repo's dependencies: `npm install`.

The `android/app/src/main/assets/public` folder (the copied web build) is *not*
committed — it's regenerated. So after cloning, always run a sync before you
build (the npm scripts below do this for you).

## Build and run

```bash
# Build the web app, copy it into the Android project, and open Android Studio:
npm run android:open
```

Then in Android Studio press **Run ▶** to launch on an emulator or a connected
device (enable *USB debugging* on the phone first). That's the whole loop.

If you'd rather not open the IDE, these do the same first two steps:

```bash
npm run android:sync   # npm run build + cap sync android
npm run cap:sync       # cap sync android only (when dist/ is already built)
```

### Build an installable APK (sideload / testing)

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The
debug APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`. Copy it
to a phone and open it (allow "install from unknown sources") to try it without
the Play Store.

Command line (from `android/`): `./gradlew assembleDebug`.

### Build a release bundle (Google Play)

1. Create an upload keystore (once):
   ```bash
   keytool -genkey -v -keystore bible-explained.keystore \
     -alias bible-explained -keyalg RSA -keysize 2048 -validity 10000
   ```
   Keep this file and its passwords safe — you need the same key for every
   future update. Do **not** commit it.
2. In Android Studio: **Build → Generate Signed Bundle / APK → Android App
   Bundle**, point it at the keystore, and build a **release** `.aab`.
3. Upload the `.aab` at [play.google.com/console](https://play.google.com/console)
   (one-time $25 developer registration).

## Updating the app after web changes

Whenever you change the web app, rebuild and re-sync so the native app picks up
the new assets, then rebuild the APK/AAB:

```bash
npm run android:sync
```

### Option: track the live site instead of the bundled build

If you'd prefer the installed app to always load the **latest** deployed site
(so web updates reach users without a new Play Store release), set a `server.url`
in `capacitor.config.ts` to your Vercel URL and re-sync:

```ts
const config: CapacitorConfig = {
  appId: "com.uzorka.bibleexplained",
  appName: "Bible Explained",
  webDir: "dist",
  server: { url: "https://your-app.vercel.app", cleartext: false },
};
```

Trade-off: it then needs a network connection to load (the bundled-assets
default works offline). You can keep the bundled build as an offline fallback by
leaving `server.url` unset for release builds.

## Icons & splash

Launcher icons (legacy + adaptive) and the splash screen are generated from the
brand art in `public/` (navy `#16324F`, gold `#D9BF7F`). To regenerate them
after changing the art, re-run the icon script or use Android Studio's
**Image Asset** tool.
