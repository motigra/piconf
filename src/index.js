#!/usr/bin/env node

const util = require('util');
const path = require('path');
const fs = require('fs').promises;
const inquirer = require('inquirer');

// Load the local piconfrc settings file
const configFilePath = path.join(process.cwd(), '.piconfrc');
const config = require(configFilePath);

/**
 * Prompts the user with a question set from the defined settings
 * @param {object} settings The `settings` property from the `.piconfrc` file
 */
const ask = async (settings = []) => {
    // Generate an `inquirer` question set
    const questions = settings.map((element) => {
        return {
            type: 'input',
            name: element.name,
            message: element.prompt,
            validate: (value) => {
                const pass = element.format ? element.format.test(value) : true;
                if (pass) {
                    return true;
                }
                return 'Please enter a valid input';
            }
        };
    });
    // Prompt user using `inquierer`
    const answers = await inquirer.prompt(questions);
    // Merge the values into the settings object
    return settings.map((element) => {
        element.value = answers[element.name];
        return element;
    });
};

/**
 * Replaces all instances of matching strings in a file
 * @param {string} file Path of file to manipulate
 * @param {RegExp} rx A regex to search for
 * @param {string} pattern A `util.format()` compatible string to replace matches with
 * @param {string} value The string value to apply to `pattern`
 */
const replace = async (file, rx, pattern, value) => {
    let fileContents;
    let matches;
    // Read the file
    try {
        fileContents = await fs.readFile(file, { encoding: 'utf8' });
    } catch (e) {
        throw `Could not read file ${file}`;
    }
    // Find matches
    try {
        matches = fileContents.match(rx);
    } catch (e) {
        throw `Could not execute expression ${rx} - Regex might be invalid`;
    }
    if (!matches.length) {
        throw `No matches found for expression ${rx} in file ${file}`;
    }
    // Generate updated file contents
    const newString = util.format(pattern, value);
    const newContent = fileContents.replace(rx, newString);
    // Write to file
    try {
        await fs.writeFile(file, newContent);
    } catch (e) {
        throw `Could not write to file ${file}`;
    }
    // Return a description of swaps performed
    return {
        file,
        origins: matches,
        replacement: newString
    };
};

/**
 * Main (async) execution flow
 */
const main = async () => {
    // Prompt user to get required information
    const settings = await ask(config.settings);
    // Show intro message if there is one
    if (config.intro && config.intro.length) {
        console.log(config.intro);
    }
    // Iterate over required settings with the values received
    for (const task of settings) {
        for (const target of task.targets) {
            // Update each file
            const result = await replace(
                target.file,
                target.expression,
                target.pattern,
                task.value
            );
            // Log the swaps done
            console.log(
                `in file "${result.file}" replaced strings ${JSON.stringify(
                    result.origins
                )} with "${result.replacement}"`
            );
        }
    }
};

main()
    .then(() => {
        console.log('Done!');
    })
    .catch((e) => {
        console.error('Failed!');
        console.error(e);
    });
