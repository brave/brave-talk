# Brave Talk

## Working with the code

The website is built using [webpack 5](https://webpack.js.org).

To work with it locally:

    $ npm install
    $ npm start

Source code is all in [`src`](./src). Contents of [`public`](./public) are deployed to target without further modification.

Currently the page uses a html template [`index.html`](./src/index.html) styled using global class names in [`css/welcome.css`](./src/css/welcome/css). Logic is contained within [`index.ts`](./src/index.ts).

By convention, the javsascript this interacts with elements in the html template by id and the css relies solely on class names.

Before you commit, you most likely want to ensure the continuous integration build will not
fail. To run the most likely-to-fail checks, use:

    $ npm run check

To build for production:

    $ npm ci
    $ npm run build

which creates a `./html` directory containing compiled assets.

# Branching Strategy

- `prod` => releases to [talk.brave.com](http://talk.brave.com) (production)
- `main` => releases to staging
- `dev` => releases to development

1. production releases should only be made after we have been able to test exactly what we're going to release on stage. So these should always be a PR from `main` to `prod` that's basically "make production === stage". These are the only PRs that should go to `prod`.
2. therefore a merge to `main` should only happen when we think the feature is ready to release.
3. when starting a piece of work, create a branch off `main` and keep adding commits there until it's ready to release.
4. to test the code in a real environment, either:
   a. merge that branch to `dev` - but don't delete the feature branch. Repeatedly merge the feature that feature branch to `dev` as work progresses. Merges to `dev` do not require PRs.
   OR
   b. manually initiate the "Deploy to Development" github action selecting that branch - this will deploy just those changes to development.
5. In-development QA of this feature should happen on the development environment.
6. when it's good to go merge the feature branch to `main` - with a PR and security review if required. Do not merge until all reviews are completed.
7. then, after checking on the staging environment (including QA regression testing if needed) PR a production release as per step 1.
8. now and again we will reset `dev` to match `main` just to keep the history tidy.

# `index.html` Updating Strategy

Japanese language support is available for brave-talk. So whenever we are adding new content in `index.html`, we have to make the following changes:

1. add `i18n-element-text` class to the new tag
2. add appropriate `id` to the new tag which is used as a key for translation
3. add the appropriate content translation in the `src > locales`. The format is {key: `tag id`, value: `transated version`}

# Prettier

This codebase uses [prettier](https://prettier.io/) to keep the code formatted nicely and avoid needless changes in diff. It's recommended
that you [configure your editor](https://prettier.io/docs/en/editors.html) to reformat as you go. There's also a pre-commit hook configured that should
reformat on commit, or you can run `npm run format`.
