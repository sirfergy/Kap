import CoreGraphics

// mac-screen-capture-permissions@1.1.0 expects exactly "true" or "false" on stdout.
// Its original CGDisplayStream probe (unavailable in the macOS 15+ SDK) also triggered the
// system permission prompt the first time, which Kap relies on, so request access when missing.
print(CGPreflightScreenCaptureAccess() || CGRequestScreenCaptureAccess())
