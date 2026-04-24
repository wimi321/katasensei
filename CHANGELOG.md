# Changelog

All notable changes to KataSensei will be documented here.

This project follows semantic versioning once public releases begin.

## 0.2.0-beta.1 - P0 Beta Candidate

### Added

- Three-column desktop workbench with library, board, winrate graph, and teacher chat.
- Fox public game sync by nickname or UID.
- SGF upload and mainline parsing.
- KTrain/Lizzie-inspired board with coordinates, stone assets, last-move marker, and candidate marks.
- Automatic low-visit full-game winrate graph on game load.
- KataGo runtime resolver with bundled-runtime and local fallback paths.
- Official KataGo model presets in settings.
- OpenAI-compatible multimodal LLM settings.
- Current-move multimodal teacher analysis.
- Full-game and recent-10-game teacher quick actions.
- Local knowledge search and long-term student profile storage.
- Markdown and JSON report output.
- Cross-platform CI for macOS, Windows, and Linux.
- GitHub Release workflow for macOS, Windows, and Linux artifacts.
- P0 release readiness checks for automation, assets, installers, signing, Windows smoke, and visual QA.
- Local release evidence collection under `release-evidence/`.

### Fixed

- GPT/reasoning model response parsing when no plain `content` field is returned.
- Fox-style SGF komi values such as `KM[375]`.
- SGF parser incorrectly reading comments and variations as mainline moves.
- Board and winrate graph layout overlap in the center workspace.

### Known Issues

- Windows ARM64 is not supported in the P0 beta because the bundled KataGo manifest only supports Windows x64.
- macOS public distribution requires Developer ID signing and notarization before tagging.
- Windows public distribution should use an EV/OV certificate or Microsoft Trusted Signing; unsigned installers are internal beta only.
- Windows 11 x64 real-machine smoke and visual QA evidence are required before creating `v0.2.0-beta.1`.
