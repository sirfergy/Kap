'use strict';
// Several dependencies ship prebuilt x86_64-only helper executables, which crash on
// Apple silicon Macs without Rosetta. This rebuilds them for arm64 from the sources
// vendored in `native/`, and makes sure ffmpeg is an arm64 build as well.
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');

const ARCH = 'arm64';
const root = path.join(__dirname, '..');
const nodeModules = path.join(root, 'node_modules');

const swiftHelpers = [
  {source: 'open-with', product: 'open-with', destination: 'mac-open-with/open-with'},
  {source: 'mac-windows', product: 'mac-windows', destination: 'mac-windows/scripts/MacWindows'},
  {source: 'activate-window', product: 'activate-window', destination: 'mac-windows/scripts/ActivateWindow'},
  {source: 'audio-devices', product: 'audio-devices', destination: 'macos-audio-devices/audio-devices'},
  {source: 'get-app-icon', product: 'GetAppIcon', destination: 'node-mac-app-icon/run'}
];

const run = (command, args, options = {}) => execFileSync(command, args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options}).trim();

const hasArch = filePath => {
  try {
    return run('lipo', ['-archs', filePath]).split(' ').includes(ARCH);
  } catch {
    return false;
  }
};

const assertArch = filePath => {
  if (!hasArch(filePath)) {
    throw new Error(`${path.relative(root, filePath)} does not contain an ${ARCH} slice`);
  }
};

const buildSwiftHelpers = () => {
  for (const {source, product, destination} of swiftHelpers) {
    const packagePath = path.join(root, 'native', source);
    const target = path.join(nodeModules, destination);

    console.log(`Building ${source} for ${ARCH}…`);
    const swiftArgs = ['build', '--configuration', 'release', '--arch', ARCH, '--package-path', packagePath];
    execFileSync('swift', swiftArgs, {stdio: 'inherit'});
    const binPath = run('swift', [...swiftArgs, '--show-bin-path']);

    // Unlink rather than overwrite, so the kernel can't reuse a cached code signature for the old inode
    fs.rmSync(target, {force: true});
    fs.copyFileSync(path.join(binPath, product), target);
    fs.chmodSync(target, 0o755);
    assertArch(target);
  }
};

const ensureFfmpeg = () => {
  const ffmpegPackage = path.join(nodeModules, 'ffmpeg-static');
  const ffmpeg = path.join(ffmpegPackage, 'ffmpeg');

  if (hasArch(ffmpeg)) {
    return;
  }

  console.log(`Downloading ${ARCH} ffmpeg…`);
  fs.rmSync(ffmpeg, {force: true});
  execFileSync(process.execPath, ['install.js'], {
    cwd: ffmpegPackage,
    stdio: 'inherit',
    env: {...process.env, npm_config_arch: ARCH, npm_config_platform: 'darwin'} // eslint-disable-line camelcase
  });
  assertArch(ffmpeg);
};

if (process.platform === 'darwin') {
  buildSwiftHelpers();
  ensureFfmpeg();
} else {
  console.log('Skipping native helper build: not running on macOS');
}
