# Brave Talk

## Working with the code

The website is built using [webpack 5](https:://webpack.js.org).

To work with it locally:

    $ cd .
    $ npm install
    $ npm start

Source code is all in [`src`](./src). Contents of [`public`](./public) are deployed to target without further modification.

Currently the page uses a html template [`index.html`](./src/index.html) styled using global class names in [`css/welcome.css`](./src/css/welcome/css). Logic is contained within [`index.js`](./src/index.js).

By convention, the javsascript this interacts with elements in the html template by id and the css relies solely on class names.

To build for production:

    $ npm ci
    $ npm run build

which creates a `./html` directory containing compiled assets.

# Prettier

This codebase uses [prettier](https://prettier.io/) to keep the code formatted nicely and avoid needless changes in diff. It's recommended
that you [configure your editor](https://prettier.io/docs/en/editors.html) to reformat as you go. There's also a pre-commit hook configured that should
reformat on commit, or you can run `npm run format`.
