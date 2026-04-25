# Packaging

GoMentor uses `electron-builder` for desktop packaging.

## Local Commands

```bash
pnpm dist:mac
pnpm dist:win
pnpm dist:linux
```

Artifacts are written to:

```text
release/<version>/
```

## GitHub Release

The release workflow runs on semver tags:

```bash
git tag v0.2.0-beta.1
git push origin v0.2.0-beta.1
```

The workflow builds on native runners:

- macOS: DMG and ZIP.
- Windows: x64 NSIS installer and x64 portable EXE for P0 beta.
- Linux: AppImage, DEB, and tar.gz.

Windows ARM64 is not supported in `v0.2.0-beta.1`.

## KataGo Runtime

Large KataGo binaries and models are not committed to Git. Packagers can place runtime files under:

```text
data/katago/
  bin/<platform>-<arch>/katago
  models/<model>.bin.gz
```

The application also falls back to a locally installed `katago` binary and `~/.katago/models/latest-kata1.bin.gz` in development.

## Signing

The public workflow currently disables automatic code-signing discovery. Before distributing widely:

- Configure Apple Developer ID signing and notarization.
- Configure Windows code signing.
- Complete Windows 11 x64 smoke testing.
- Complete visual QA evidence.
- Decide the update channel and release cadence.
- Verify downloaded KataGo models with checksums.
