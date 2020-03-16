/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Given, When, Then, setDefaultTimeout} from 'cucumber';
import * as path from 'path';
import * as fs from 'fs-extra';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';

import {PackageHelper} from '../../helpers/PackageHelper';
import {Helper} from '../../helpers/Helper';
import {SmartContractPackage} from '../../../src';

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

setDefaultTimeout(60 * 1000);

Given(/a '(.*)' smart contract of type '(.*)'/, async function (language: string, type: string): Promise<void> {

    this.projectPath = path.join(Helper.TMP_DIR, 'fabric-samples', 'chaincode', 'fabcar', language);
    this.language = language;
    this.type = type;
    this.label = `fabcar-${language}`;

});

Given(/the package exists$/, async function (): Promise<void> {
    const packagedContractPath = path.join(Helper.PACKAGE_DIR, `${this.label}.tar.gz`);

    const exists: boolean = await fs.pathExists(packagedContractPath);

    if (!exists) {
        this.packagePath = await PackageHelper.packageContract(this.projectPath, this.label, this.type, this.language);
    } else {
        this.packagePath = packagedContractPath;
    }
});

When('I package the smart contract', async function (): Promise<void> {
    this.packagePath = await PackageHelper.packageContract(this.projectPath, this.label, this.type, this.language);
});

Then('a package should exist', async function (): Promise<void> {
    await fs.pathExists(this.packagePath).should.eventually.be.true;
});

When(/^I get the list of files$/, async function (): Promise<void> {
    const contractBuffer: Buffer = await fs.readFile(this.packagePath);
    const contractPackage: SmartContractPackage = new SmartContractPackage(contractBuffer);
    this.fileList = await contractPackage.getFileNames();
});

// tslint:disable-next-line:only-arrow-functions
Then(/^the file list is correct '(.*)'$/, function (expectedFileListString: string): void {
    const expectedFileList: string[] = expectedFileListString.split(' ');
    this.fileList.should.include.members(expectedFileList);
});
