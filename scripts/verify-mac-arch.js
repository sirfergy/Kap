'use strict';
// An electron-builder afterPack hook that fails the build if any Mach-O binary in the
// packaged app lacks the architecture being built, so x86_64-only helpers can't silently
// ship in an arm64 build (they crash on Macs without Rosetta), or requires a newer macOS
// than the app's minimum (for example, a helper compiled for the build machine's macOS).
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const {Arch} = require('builder-util');

const lipoArchs = {x64: 'x86_64', arm64: 'arm64'};
// Thin 32/64-bit and fat 32/64-bit Mach-O headers, in both byte orders
const machOMagics = new Set([0xFE_ED_FA_CE, 0xFE_ED_FA_CF, 0xCE_FA_ED_FE, 0xCF_FA_ED_FE, 0xCA_FE_BA_BE, 0xBE_BA_FE_CA, 0xCA_FE_BA_BF, 0xBF_BA_FE_CA]);
// Java class files share the fat Mach-O magic number
const ambiguousMagic = 0xCA_FE_BA_BE;

const readMagic = filePath => {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(4);
    return fs.readSync(fd, buffer, 0, 4, 0) === 4 ? buffer.readUInt32BE(0) : undefined;
  } finally {
    fs.closeSync(fd);
  }
};

const getArchs = filePath => {
  try {
    return execFileSync('lipo', ['-archs', filePath], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim().split(' ');
  } catch {
    return undefined;
  }
};

// The minimum macOS a slice declares, from LC_BUILD_VERSION or the older LC_VERSION_MIN_MACOSX
const getMinimumOs = (filePath, arch) => {
  const output = execFileSync('vtool', ['-arch', arch, '-show-build', filePath], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
  const match = /\bminos (\S+)/.exec(output) ?? /LC_VERSION_MIN_MACOSX[\s\S]*?\bversion (\S+)/.exec(output);
  return match?.[1];
};

const isNewer = (version, than) => {
  const [a, b] = [version, than].map(value => value.split('.').map(part => Number(part)));
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) {
      return (a[i] ?? 0) > (b[i] ?? 0);
    }
  }

  return false;
};

function * walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      yield * walk(entryPath);
    } else if (entry.isFile()) {
      yield entryPath;
    }
  }
}

exports.default = async context => {
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const expected = lipoArchs[Arch[context.arch]];
  if (!expected) {
    return;
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  const minimumOs = execFileSync('plutil', ['-extract', 'LSMinimumSystemVersion', 'raw', path.join(appPath, 'Contents', 'Info.plist')], {encoding: 'utf8'}).trim();
  const mismatched = [];

  for (const filePath of walk(appPath)) {
    const magic = readMagic(filePath);
    if (!machOMagics.has(magic)) {
      continue;
    }

    const archs = getArchs(filePath);
    if (!archs) {
      if (magic !== ambiguousMagic) {
        mismatched.push(`  ${path.relative(appPath, filePath)} (unreadable by lipo)`);
      }
    } else if (archs.includes(expected)) {
      const binaryMinimumOs = getMinimumOs(filePath, expected);
      if (binaryMinimumOs && isNewer(binaryMinimumOs, minimumOs)) {
        mismatched.push(`  ${path.relative(appPath, filePath)} (requires macOS ${binaryMinimumOs})`);
      }
    } else {
      mismatched.push(`  ${path.relative(appPath, filePath)} (${archs.join(', ')})`);
    }
  }

  if (mismatched.length > 0) {
    throw new Error(`These binaries lack an ${expected} slice that runs on macOS ${minimumOs}. Rebuild helpers with \`node scripts/build-native-helpers.js\`, or reinstall the package that ships the binary:\n${mismatched.join('\n')}`);
  }
};
