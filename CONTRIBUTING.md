#Contributing to jmHighlight

##1. Issues

If you are having a question, problem, feature request or found a bug 
please open an [issue](https://github.com/julmot/jmHighlight/issues/new).

###1.1 Questions, problems and bugs

For each issue please provide:
- What kind of browser and version you are using. If you are not sure visit 
  [WhatsMyBrowser](http://www.whatsmybrowser.org/)
- What kind of jmHighlight version you are using
- A detailed description
- The exact steps to reproduce (bugs and problems)
- A [fiddle](https://jsfiddle.net) that demonstrates your issue (if possible). Note that you can
  fork an existing [example](https://github.com/julmot/jmHighlight#4-usage-examples)
  
###1.2 Feature requests

Please provide the following informations:
- Your use case, why your enhancement is necessary
- How to solve it in your opinion

##2. Development

###2.1 General

The project is using Grunt as a base, Karma as a task runner
and Jasmine as testing framework.
Before you start developing, you should clone or download this repository and run:

```bash
bower install
npm install
```

Now you are ready to develop.

**Developer API**

| Grunt task | Description                                                                                                                      |
|------------|----------------------------------------------------------------------------------------------------------------------------------|
| dev        | Will create a server that you can open in your prefered browser. It will track file changes and re-run the test in your browser. |
| dist       | Will run a test and generate the .min.js file inside the "dist" folder                                                           |
| minify     | Will just generate the .min.js file inside "dist"                                                                                |
| test       | Will just run the test                                                                                                           |

_Note: Run the tasks with `$ grunt [task]` (Replace "[task]" with the actual task)._

###2.2 Pull Requests

Pull requests are very much appreciated!

Please note the following things when doing a pull request:
- Do not change any version
- Always include a test if possible
  - Add a fixture (test/fixtures/)
  - Add the test in `src/jmHighlight.spec.js`
- Reference related issues
- Describe your changes and why they are necessary
  (if not stated in referenced issues)


__Thank you for contributing!__