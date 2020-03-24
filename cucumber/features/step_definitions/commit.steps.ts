/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {When} from 'cucumber'
import {Then} from 'cucumber'
import {CommitHelper} from '../../helpers/CommitHelper';
import {Helper} from '../../helpers/Helper';
import {DefinedSmartContract} from '../../../src';

When(/^I commit the contract$/, async function (): Promise<void> {
    await CommitHelper.commitSmartContract(this.lifecycle, [Helper.org1Peer, Helper.org2Peer], this.label, '0.0.1', this.packageId, this.wallet, this.org1Identity);
});

Then(/^the smart contract should committed$/, async function (): Promise<void> {
    const result: string[] = await CommitHelper.getCommittedSmartContracts(this.lifecycle, Helper.org1Peer, this.wallet, this.org1Identity);

    result.should.include(this.label);

    const definedContract: DefinedSmartContract = await CommitHelper.getCommittedSmartContract(this.lifecycle, Helper.org1Peer, this.label, this.wallet, this.org1Identity);

    definedContract.smartContractName.should.equal(this.label);
    definedContract.smartContractVersion.should.equal('0.0.1');
    definedContract.sequence.should.equal(1);

    definedContract.approvals!.size.should.equal(2);
    definedContract.approvals!.get('Org1MSP')!.should.equal(true);
    definedContract.approvals!.get('Org2MSP')!.should.equal(true);
});
