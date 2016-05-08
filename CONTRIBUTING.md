# Contributing

These are the contributing guidelines for the website of mark.js. If you are
interested in contributing to mark.js itself, please head over to the
[mark.js contributing guidelines][markjs-contributing].

## 1. Issues

### 1.1 Questions, Problems and Bugs

For each issue please provide:

- What kind of browser and version you are using
- A detailed description
- The exact steps to reproduce (bugs and problems)

### 1.2 Feature Requests

Please provide the following information:

- The use case, why your enhancement is necessary
- How to solve it in your opinion

## 2. Development

### 2.1 General

_Requirements: [node.js][node-js] (including npm), [Bower][bower] and
[Compass][compass] installed._

Before you start developing, you should clone or download this repository and
run:

```
bower install
npm install
```

To compile, compress and optimize the website, [wabp][wabp] is used as a
boilerplate. Please see the grunt tasks and project structure there.  
Additionally a build to generate HTML files from the docs (written in Markdown)
was implemented. This build can be started using:

```
node generate-html.js
```

Docs are located in `./src/docs/`, handlebars templates in `./src/templates/`.

The website is __not__ hosted with GitHub pages. The reasons can be found
[here][why-to-avoid-gh-pages]. Instead, the website will be deployed to a own
server using Travis CI. If your pull request is merged successfully the changes
will be automatically online.

### 2.2 Pull Requests

Pull requests are very much appreciated!  :thumbsup:

Please note the following things when doing a pull request:

- Do not change any version
- Reference related issues in the pull request description
- Describe your changes and why they are necessary (if not stated in referenced
  issues)
- Make sure that you format code to fit the [code style][code-style]

### 2.3 Contribution and License Agreement

If you contribute to this project, you are implicitly allowing your code to be
distributed under [this license][license]. You are also implicitly verifying
that all code is your original work.

[markjs-contributing]: https://github.com/julmot/mark.js/blob/master/CONTRIBUTING.md
[node-js]: https://nodejs.org/en/
[bower]: http://bower.io/
[compass]: http://compass-style.org/install/
[wabp]: https://github.com/julmot/wabp/
[code-style]: https://github.com/julmot/mark.js/blob/website/.jsbeautifyrc
[why-to-avoid-gh-pages]: https://gist.github.com/julmot/7150101962e2645731b54547ffa00268
[license]: https://github.com/julmot/mark.js/blob/website/LICENSE
