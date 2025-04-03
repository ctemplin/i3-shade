#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the help text
const { usage, helpText } = require('../src/help');

// Read the README
const readmePath = path.join(__dirname, '..', 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

const usageSection = '## Usage\n'
const endToken = '\n~~~'

// Find the Usage section
var usageStart = readme.indexOf(usageSection);
usageStart = readme.indexOf('~~~', usageStart)
if (usageStart === -1) {
    console.error('Could not find Usage section in README.md');
    process.exit(1);
}

// Find the next section after Usage to determine where to stop replacing
var nextSectionStart = readme.indexOf(endToken, usageStart + usageSection.length);

// Create the new usage content
const newUsageContent = `~~~
${usage.trim()}
~~~`;

// Replace the old Usage section with the new one
var newReadme = readme.substring(0, usageStart) + 
                 newUsageContent + 
                 (nextSectionStart !== -1 ? readme.substring(nextSectionStart + endToken.length) : '');


// Define the section we want to replace
const optionsSection = '## Options\n';

// Find the Options section
var optionsStart = newReadme.indexOf(optionsSection);
optionsStart = newReadme.indexOf('~~~', optionsStart)
if (optionsStart === -1) {
    console.error('Could not find Options section in README.md');
    process.exit(1);
}

// Find the next section after Options to determine where to stop replacing
nextSectionStart = newReadme.indexOf(endToken, optionsStart + optionsSection.length);

// Create the new options content
const newOptionsContent = `~~~
${helpText.trim()}
~~~`;

// Replace the old options section with the new one
newReadme = newReadme.substring(0, optionsStart) + 
                 newOptionsContent + 
                 (nextSectionStart !== -1 ? newReadme.substring(nextSectionStart + endToken.length) : '');

// Write the updated README
fs.writeFileSync(readmePath, newReadme);

console.log('Successfully updated README.md with latest text from src/help.js');
