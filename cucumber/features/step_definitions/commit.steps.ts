/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {When} from 'cucumber'
import {Then} from 'cucumber'
import {CommitHelper} from '../../helpers/CommitHelper';
import {Helper} from '../../helpers/Helper';

When(/^I commit the contract$/, async function (): Promise<void> {
    await CommitHelper.commitSmartContract(this.org1Network, [Helper.org1Peer, Helper.org2Peer], this.label, '0.0.1', this.packageId);
});

Then(/^the smart contract should committed$/, async function (): Promise<void> {
    const result: string[] = await CommitHelper.getCommittedSmartContracts(this.org1Network, Helper.org1Peer, this.label, '0.0.1');

    result.should.include(this.label);
});
