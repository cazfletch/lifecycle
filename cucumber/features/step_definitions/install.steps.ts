/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Given, When, Then} from 'cucumber';

import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import {InstallHelper} from '../../helpers/InstallHelper';
import {Helper} from '../../helpers/Helper';
import * as path from 'path';
import {Wallet, Wallets} from 'fabric-network';

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

When('I install the smart contract', {timeout: 70 * 1000}, async function (): Promise<void> {
    this.packageId = await InstallHelper.installPackage(this.lifecycle, Helper.org1Peer, this.packagePath, this.wallet, this.org1Identity);
    this.packageId = await InstallHelper.installPackage(this.lifecycle, Helper.org2Peer, this.packagePath, this.wallet, this.org2Identity);
});


Then(/^the package should be installed on the peer$/, async function (): Promise<void> {
    const resultOrg1 = await InstallHelper.getInstalledPackages(this.org1Network, Helper.oldOrg1Peer);
    let exists = resultOrg1.find((data) => {
        return data.label === this.label;
    });

    should.exist(exists);

    const resultOrg2 = await InstallHelper.getInstalledPackages(this.org2Network, Helper.oldOrg2Peer);
    exists = resultOrg2.find((data) => {
        return data.label === this.label;
    });

    should.exist(exists);
});

Given(/^the package is installed$/, {timeout: 70 * 1000}, async function (): Promise<void> {
    const resultOrg1 = await InstallHelper.getInstalledPackages(this.org1Network, Helper.oldOrg1Peer);
    let result = resultOrg1.find((data) => data.label === this.label);
    if (!result) {
        this.packageId = await InstallHelper.installPackage(this.lifecycle, Helper.org1Peer, this.packagePath, this.wallet, this.org1Identity);
    } else {
        this.packageId = result.packageId;
    }

    const resultOrg2 = await InstallHelper.getInstalledPackages(this.org2Network, Helper.oldOrg2Peer);
    result = resultOrg2.find((data) => data.label === this.label);
    if (!result) {
        this.packageId = await InstallHelper.installPackage(this.lifecycle, Helper.org2Peer, this.packagePath, this.wallet, this.org2Identity);
    } else {
        this.packageId = result.packageId;
    }

    if (!this.packageId) {
        throw new Error('package was not installed');
    }
});
