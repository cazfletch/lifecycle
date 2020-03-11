/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {When, Then } from 'cucumber'
import {ApproveHelper} from "../../helpers/ApproveHelper";
import * as chai from "chai";
import * as sinonChai from "sinon-chai";
import * as chaiAsPromised from "chai-as-promised";
import {Helper} from "../../helpers/Helper";
import {Given} from 'cucumber'

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);


When(/^I approve the smart contract$/, async function () {
    await ApproveHelper.approveSmartContract(this.org1Network, Helper.org1Peer, this.label, '0.0.1', this.packageId);
    await ApproveHelper.approveSmartContract(this.org2Network, Helper.org2Peer, this.label, '0.0.1', this.packageId);
});

Then(/^the smart contract should be approved$/, async function () {
    await ApproveHelper.checkCommitReadiness(this.org1Network,Helper.org1Peer, this.label, '0.0.1').should.eventually.be.true;
});

Given(/^the contract is approved$/, async function () {
    const result: boolean = await ApproveHelper.checkCommitReadiness(this.org1Network,Helper.org1Peer, this.label, '0.0.1');

    if(!result) {
        await ApproveHelper.approveSmartContract(this.org1Network, Helper.org1Peer, this.label, '0.0.1', this.packageId);
        await ApproveHelper.approveSmartContract(this.org2Network, Helper.org2Peer, this.label, '0.0.1', this.packageId);
    }
});