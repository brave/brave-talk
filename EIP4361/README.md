# EIP4361 parser

The goal is to build a parser using [apg-js](https://github.com/ldthomas/apg-js). This could be done with:

    const apgApi = require("apg-js/src/apg-api/api");

    const GRAMMAR = ` ... `;
    const api = new apgAPI(GRAMMAR);
    api.generate();

    const grammarObj = api.toObject();

Unfortunately, `apgApi` requires `Buffer` which isn't in the browser.

So, we build the grammar from scratch:

    cd node_modules/apg-js
    npm run apg -- -i ../../EIP4361/grammar.abnf -o ../../src/web3/eip4361-grammar.js

and then use

    const grammar = new (require('./eip4361-grammar.js'))();

Sadly, `apgLib.parser().parse()` also requires `Buffer`.

Regardless, we're continuing to use the generated `eip4361-grammar.js` file.
