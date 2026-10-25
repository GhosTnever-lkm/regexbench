# Changelog

## 0.1.4 - 2026-10-25

- Report the 1,000-match cap only when a 1,001st match exists; cover both sides of the limit.

## 0.1.3 - 2026-10-13

- Cancel obsolete regex work when editing or clearing fields so an older result cannot repopulate the cleared workspace.
- Clear the execution timeout when a Worker fails, avoiding a false timeout message.
- Return HTTP 400 for malformed encoded request paths instead of letting a bad URL crash the local server.

## 0.1.2 - 2026-10-11

- Add a real screenshot of the app to the README.

## 0.1.1 - 2026-10-11

- Complete the standard MIT license text, restoring the full warranty and liability disclaimer.

## 0.1.0 - 2026-10-11

- Initial release of the local-first JavaScript regular-expression workbench.
- Added match/capture inspection, replacement preview, local text import/export, and a bounded Web Worker.
