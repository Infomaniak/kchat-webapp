// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
const json = require('./package.json');
const {exec} = require('child_process');

let cmd = 'npm i -g ';

/* eslint-disable no-console */
Object.entries(json.dependencies || {}).forEach((e) => {
    cmd += ' ' + e[0] + '@' + e[1] + ' ';
});
exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    }
});

cmd = 'npm i -g ';
Object.entries(json.devDependencies || {}).forEach((e) => {
    cmd += ' ' + e[0] + '@' + e[1] + ' ';
});
exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    }
});

/* eslint-enable no-console */
