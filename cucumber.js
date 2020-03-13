/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

var common = [
    `--format ${
        process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'
    }`,
    // '--format json:./reports/cucumber-json-reports/report.json',
    // '--format rerun:@rerun.txt',
    '--format usage:usage.txt',
    // '--parallel 20',
    '--require ./build/cucumber/features/steps_definitions/**/*.js',
    '--require ./build/cucumber/features/step_definitions/*.js',
].join(' ');

module.exports = {
    default: common,
};
