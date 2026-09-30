<p align="center">
  <img src="https://getkap.co/static/favicon/kap.svg" height="64">
  <h3 align="center">Kap</h3>
  <p align="center">An open-source screen recorder built with web technology<p>
  <p align="center"><a href="https://github.com/sirfergy/Kap/actions/workflows/ci.yml"><img src="https://github.com/sirfergy/Kap/actions/workflows/ci.yml/badge.svg" alt="Build Status"></a> <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="XO code style"></a></p>
</p>

[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

> [!NOTE]
> This fork builds an Apple silicon–only Kap (macOS 12 or later) that runs without Rosetta. The upstream 3.6.0 arm64 build (linked below) still bundles `x86_64`-only helpers (ffmpeg, gifsicle, and several Swift tools), which crash on macOS versions without Rosetta. See [`native/`](native/README.md) for details. Auto-updates check this fork's releases instead of upstream's. Build it with Node.js 16 and Xcode (plus `autoconf`/`automake` only if gifsicle's prebuilt binary fails to download and it falls back to building from source):
>
> ```sh
> yarn install --frozen-lockfile
> yarn dist
> ```
>
> Signed, notarized builds are on this fork's [Releases](https://github.com/sirfergy/Kap/releases) page. CI runs on a self-hosted Apple silicon runner for branches pushed to this repository (Node.js is installed by the workflow; the runner needs Xcode). Every pull request merged to `main` ships in a release with the next patch version, or with `package.json`'s version if that's higher (bump it for a minor or major release). Merges that land close together can share one release. The `release` environment needs the `MACOS_DEVELOPER_ID_P12_BASE64`, `MACOS_DEVELOPER_ID_P12_PASSWORD`, `APPLE_NOTARY_KEY_P8_BASE64`, `APPLE_NOTARY_KEY_ID`, and `APPLE_NOTARY_ISSUER_ID` secrets.

## Get Kap

Download the latest release:

- [Apple silicon](https://getkap.co/api/download/arm64)
- [Intel](https://getkap.co/api/download/x64)

Or install with [Homebrew-Cask](https://caskroom.github.io):

```sh
brew install --cask kap
```

## How To Use Kap

Click the menu bar icon to bring up the screen recorder. After selecting what portion of the screen you'd like to record, hit the record button to start recording. Click the menu bar icon again to stop the recording.

> Tip: While recording, Option-click the menu bar icon to pause or right-click for more options.

## Contribute

Read the [contribution guide](contributing.md).

## Plugins

For more info on how to create plugins, read the [plugins docs](docs/plugins.md).

## Dev builds

Download [`main`](https://kap-artifacts.now.sh/main) or builds for any other branch using: `https://kap-artifacts.now.sh/<branch>`. Note that these builds are unsupported and may have issues.

## Related Repositories

- [Website](https://github.com/wulkano/kap-website)
- [Aperture](https://github.com/wulkano/aperture)

## Newsletter

[Subscribe](http://eepurl.com/ch90_1)

## Thanks

- [▲ Vercel](https://vercel.com/) for fast deployments served from the edge, hosting our website, downloads, and updates.
- [● CircleCI](https://circleci.com/) for supporting the open source community and making our builds fast and reliable.
- [△ Sentry](https://sentry.io/) for letting us know when Kap isn't behaving and helping us eradicate said behaviour.
- Our [contributors](https://github.com/wulkano/kap/contributors) who help maintain Kap and make screen recording and sharing easy.
