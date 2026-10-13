# RegexBench

RegexBench is a local-first JavaScript regular-expression workbench. Test a pattern against sample text, inspect matches and capture groups, and preview or export replacements without sending the text to a service.

![RegexBench: regular expression workbench with match explorer](docs/screenshot.png)

## Features

- JavaScript regex syntax and flags, including named capture groups.
- Match list with line and column; click a row to select its source text.
- Replacement preview with `$1` and `$<name>` support.
- Import a plain text file up to 200 KB; export the replacement preview.
- Input limits, a 1,000-match cap, and a dedicated Web Worker terminated after 300 ms.
- Editing or clearing the workspace cancels obsolete worker jobs so stale results cannot replace newer input.
- Last-used pattern, flags, replacement and sample text saved in browser local storage.
- Responsive layout and keyboard-accessible controls.

## Run

Requires Node.js 20 or newer. From the project directory:

```sh
npm start
```

Open `http://127.0.0.1:4173`. A local HTTP server is required for ES modules and Web Workers. No install step or third-party runtime package is needed.

## Checks

```sh
npm run check
```

## Limits

The application follows the browser's JavaScript RegExp implementation, which may differ from PCRE, Python, .NET, or other regex engines. It does not provide a formal guarantee against every browser-engine stall: the worker is terminated after 300 ms, but the underlying browser remains responsible for scheduling that termination. Text can be stored in local storage on the device until cleared. RegexBench is not a parser for HTML or other structured languages.

## Privacy

Imported content and patterns remain in the browser. No analytics or application API calls are made. Optional Google Fonts are loaded from Google Fonts; use a network blocker or remove the font import in `styles.css` for a fully disconnected session.

## License

MIT.
