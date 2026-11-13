#!/usr/bin/env bash
# Plenio VST3 for macOS: a .pkg that puts Plenio.vst3 into /Library/Audio/Plug-Ins/VST3 (where every DAW looks), and
# a zip of the bundle for those who copy it themselves. Run on a Mac (the release workflow does):
#
#   installer/macos/build_pkg.sh <Plenio.vst3> <version> <out folder>
#
# The bundle is signed ad hoc (Apple silicon loads no unsigned code). It is not notarized: the .pkg needs a right-click >
# Open the first time; what a .pkg installs carries no quarantine, so the DAW loads the plug-in without asking.
set -euo pipefail

BUNDLE=${1:?the Plenio.vst3 bundle}
VERSION=${2:?the version, e.g. 2.0.0}
OUT=${3:?the folder for the packages}
HERE=$(cd "$(dirname "$0")" && pwd)
NAME="Plenio-VST3-${VERSION}-macos-universal"

mkdir -p "$OUT"
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

# the payload: /Library/Audio/Plug-Ins/VST3/Plenio.vst3
mkdir -p "$STAGE/root/Library/Audio/Plug-Ins/VST3"
cp -R "$BUNDLE" "$STAGE/root/Library/Audio/Plug-Ins/VST3/Plenio.vst3"
codesign --force --deep --sign - "$STAGE/root/Library/Audio/Plug-Ins/VST3/Plenio.vst3"
codesign --verify --verbose=1 "$STAGE/root/Library/Audio/Plug-Ins/VST3/Plenio.vst3"

# a component package (pkgbuild wants numbers only), wrapped with a welcome text and the licence
pkgbuild --root "$STAGE/root" --identifier io.github.jplenio.plenio-vst3 --version "${VERSION%%-*}" \
  --install-location / "$STAGE/plenio-vst3.pkg"
mkdir -p "$STAGE/resources"
cp "$HERE/welcome.html" "$STAGE/resources/welcome.html"
cp "$HERE/../../../LICENSE" "$STAGE/resources/LICENSE.txt"
sed "s/@VERSION@/${VERSION}/g" "$HERE/distribution.xml" > "$STAGE/distribution.xml"
productbuild --distribution "$STAGE/distribution.xml" --resources "$STAGE/resources" --package-path "$STAGE" "$OUT/$NAME.pkg"

# the bundle alone
ditto -c -k --keepParent "$STAGE/root/Library/Audio/Plug-Ins/VST3/Plenio.vst3" "$OUT/$NAME.zip"

( cd "$OUT" && shasum -a 256 "$NAME.pkg" "$NAME.zip" > SHA256SUMS-macos.txt )
echo "built $OUT/$NAME.pkg and $OUT/$NAME.zip"
