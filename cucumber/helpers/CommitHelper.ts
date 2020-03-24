import {Wallet} from 'fabric-network';
import {DefinedSmartContract, Lifecycle, LifecycleChannel} from '../../src';

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class CommitHelper {

    public static async commitSmartContract(lifecycle: Lifecycle, peerNames: string[], name: string, version: string, packageId: string, wallet: Wallet, identity: string): Promise<void> {

        const channel: LifecycleChannel = lifecycle.getChannel('mychannel', wallet, identity);

        await channel.commitSmartContractDefinition(peerNames, 'orderer.example.com', {
            smartContractName: name,
            smartContractVersion: version,
            sequence: 1
        });
    }

    public static async getCommittedSmartContracts(lifecycle: Lifecycle, peerName: string, wallet: Wallet, identity: string): Promise<string[]> {
        const channel: LifecycleChannel = lifecycle.getChannel('mychannel', wallet, identity);

        const result: DefinedSmartContract[] = await channel.getAllCommittedSmartContracts(peerName);

        return result.map(data => {
            return data.smartContractName;
        });
    }
}
