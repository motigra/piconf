# PIConf - Post Install Configuration

___
**This project is a WIP and has known issues. Sorry!**
___

A utility for `npmjs` projects to customize files with values from a user prompt after running `npm install`.

> For example, a project using a REST API may require a token to be set in some `.json` file, which needs to be set. Using PIConf, when someone clones and installs your package they will be prompted for their token and it will be automatically updated in all relevant locations in code/configuration files.

## Setting up

1. Create a file called `.piconfrc` in your project's root directory (See [Configuration](#configuration))
1. Add the script `"postinstall": "piconfig"` to your `package.json`'s `scripts` array
1. Install this project as a DevDependency: `npm install --save-dev motigra/piconf#wip`

Now when `npm install` is done on any subsequent run, the user will be prompted with questions based on your configuration, the files will be updated and a report will be presented via the console.

*Note:* The utility can also be invoked directly, without `npm install`, using `npm run postinstall`.

## Configuration

Each project will have a different configuration based on the prompts required and files that need to be updated. This configuration is stored in the `.piconfrc` file, which must be a valid CommonJS module:

``` js
module.exports = {
    "intro": "hi, thanks for installing my module!",
    "settings": [
        // ...
    ]
}
```

**Properties**

| Name       | Type       | Required | Description               |
|------------|------------|----------|---------------------------|
| `intro`    | `string`   | No       | Text to display on start  |
| `settings` | `object[]` | **Yes**  | See [Settings](#settings) |


### Settings

Each value in this array represents a prompt for the user which generates a value to be inserted into one or more files. The same prompt input may be used in multiple files and to replace multiple patterns/expressions.

**Properties**

| Name      | Type       | Required | Description                  |
|-----------|------------|----------|------------------------------|
| `name`    | `string`   | **Yes**  | A unique name for the prompt |
| `prompt`  | `string`   | **Yes**  | The prompt message           |
| `format`  | `RegExp`   | No       | Validation Regex             |
| `targets` | `object[]` | **Yes**  | See [Targets](#targets)      |

### Targets

Each item in this array describes a required swap - while file, what expression to look for and the pattern to replace it with.

All instances (matches) of the expression in the file will be replaced.

**Properties**

| Name         | Type     | Required | Description                                                                                      |
|--------------|----------|----------|--------------------------------------------------------------------------------------------------|
| `file`       | `string` | **Yes**  | File path                                                                                        |
| `expression` | `RegExp` | **Yes**  | Regular expression used with `string.match` and `string.replace`. Use the `gm` flags.            |
| `pattern`    | `string` | **Yes**  | A `util.format()` compatible string, where the token `%s` represents the value input by the user |

## Example

For example, lets say you have 2 places where a URL of a file called `/js/someLib.js` is required, but the server's URL changes depending on the user; One is a `<script>` tag within an HTML file, and one is a value in a JSON config file.

In the HTML file, we'll look for the pattern `<script src="[some base URL]/js/someLib.js">`, and in the JSON file we'll search for simply `[some base URL]/js/someLib.js`. In both cases we'll want to replace only the base URL part, and keep `/js/someLib.js`.

These are the settings you could use:

``` js
module.exports = {
    "intro": "Hi and thanks for using my module! Before you get started, we need to configure a few things:",
    "settings": [
        {
            "name": "server-uri",
            "prompt": "Please input your server's URI, including the protocol and port. For example: 'https://localhost:3000'",
            "format": /^https?:\/\/([\w-]+\.?)+(\:\d{1,5})?$/i,
            "targets": [
                {
                    "file": "./test.html",
                    "expression": /<script\s+src="https?:\/\/\S+\/js\/someLib\.js"\s*>/igm,
                    "pattern": "<script src=\"%s/js/someLib.js\">"
                },
                {
                    "file": "./test.json",
                    "expression": /https?:\/\/\S+\/js\/someLib\.js/igm,
                    "pattern": "%s/js/someLib.js"
                }
            ]
        }
    ]
};
```

## TODO

 - [x] Prepare for use as an NPM CLI utility
 - [ ] Improve error handling
 - [ ] Add testing
 - [x] Add validation pattern support
 - [ ] Prevent Node.js experimental API warning
 - [ ] Add contribution guidelines
 - [x] Add support for intro message
 - [ ] Upload to NPMJS

## Nice-to-haves

 - [ ] Add regex examples to readme
 - [ ] Make prompts sexy