# README

You may be wondering why this directory is here and why there's a script called `i18n-compare.js`.

All I wanted was a script to indicate whether translations were missing from one of the localization files. Every single
`i18next*` package either didn't do this, or claimed to do it but had "fatal" (non-fixable `npm audit` issues) or just didn't
work.

Enough.

This is a utility script, it does not run on the site or in the browser.
It is run only by a developer, periodically.
It does not run in production, and doesn't modify any files.
An authorized developer may choose to update a file based on it's output.
