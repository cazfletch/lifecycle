/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Given, When, Then, setDefaultTimeout} from 'cucumber';
import * as path from 'path';
import * as fs from 'fs-extra';

import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';

import { PackageHelper } from '../../helpers/PackageHelper';
import {Helper} from "../../helpers/Helper";

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

setDefaultTimeout(60 * 1000);

Given(/a '(.*)' smart contract of type '(.*)'/, async function (language: string, type: string) {
    this.projectPath = path.join(Helper.TMP_DIR, 'fabric-samples', 'chaincode', 'fabcar', language);
    this.language = language;
    this.type = type;
    this.label = `fabcar-${language}`;

});

Given(/the package exists$/, async function () {
    const packagedContractPath = path.join(Helper.PACKAGE_DIR, `${this.label}.tar.gz`);

    const exists: boolean = await fs.pathExists(packagedContractPath);

    if(!exists) {
        this.packagePath = await PackageHelper.packageContract(this.projectPath, this.label, this.type);
    } else {
        this.packagePath = packagedContractPath;
    }
});

When("I package the smart contract", async function () {
    this.packagePath = await PackageHelper.packageContract(this.projectPath, this.label, this.type);
});

Then("a package should exist", async function () {
    await fs.pathExists(this.packagePath).should.eventually.be.true;
});

