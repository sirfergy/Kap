# Native helpers

Several of Kap's dependencies shell out to small prebuilt helper executables that are only published as `x86_64` binaries. On Apple silicon Macs without Rosetta they fail with `Bad CPU type in executable`, which breaks recording, audio device selection, window selection, and exporting.

This directory vendors the Swift sources for those helpers. `scripts/build-native-helpers.js` runs on `postinstall` and:

- Builds each helper below for `arm64` and replaces the prebuilt binary in `node_modules`.
- Re-downloads the `arm64` build of `ffmpeg-static` if the installed binary lacks an `arm64` slice.
- Builds `gifsicle` for `arm64` from its bundled source, targeting the app's `minimumSystemVersion`.

`scripts/verify-mac-arch.js` runs as an electron-builder `afterPack` hook and fails the build if any Mach-O file in the packaged app is missing the target architecture.

| Directory | npm package | Replaces | Source |
| --- | --- | --- | --- |
| `open-with` | `mac-open-with@1.2.3` | `open-with` | [karaggeorge/mac-open-with@f698f19](https://github.com/karaggeorge/mac-open-with/tree/f698f1948ce8745d5ac42dabdf9cd61d3e730d96) |
| `screen-capture-permissions` | `mac-screen-capture-permissions@1.1.0` | `screen-capture-permissions` | Port of [karaggeorge/mac-screen-capture-permissions@950c95d](https://github.com/karaggeorge/mac-screen-capture-permissions/tree/950c95df5bdad35243476f5e4113921de92f3626) using `CGPreflightScreenCaptureAccess()` and `CGRequestScreenCaptureAccess()` (which keeps the original first-run system prompt), since `CGDisplayStream` is unavailable in the macOS 15+ SDK |
| `mac-windows` | `mac-windows@1.0.0` | `scripts/MacWindows` | [karaggeorge/mac-windows@3a48eef](https://github.com/karaggeorge/mac-windows/tree/3a48eef64e1a99f136c03942923b8768eed6b01c/swift/MacWindows) |
| `activate-window` | `mac-windows@1.0.0` | `scripts/ActivateWindow` | [karaggeorge/mac-windows@3a48eef](https://github.com/karaggeorge/mac-windows/tree/3a48eef64e1a99f136c03942923b8768eed6b01c/swift/ActivateWindow) |
| `audio-devices` | `macos-audio-devices@1.4.0` | `audio-devices` | [karaggeorge/macos-audio-devices@5b5db17](https://github.com/karaggeorge/macos-audio-devices/tree/5b5db178bc01a019fb4865bae083a0b9b4fdb0d4) |
| `get-app-icon` | `node-mac-app-icon@1.4.0` | `run` | [sallar/GetAppIcon@d68dd0b](https://github.com/sallar/GetAppIcon/tree/d68dd0bb2e4f3794dc013a1f3657d1dba23fc48d) |

All of these packages are MIT licensed. `mac-open-with`, `mac-screen-capture-permissions`, `mac-windows`, and `macos-audio-devices` are © George Karagkiaouris; `GetAppIcon` is © Sallar Kaboli. Licenses shipped with the upstream sources are kept alongside them.

Building requires Xcode (or the Command Line Tools) plus `autoconf` and `automake` for `gifsicle`.
