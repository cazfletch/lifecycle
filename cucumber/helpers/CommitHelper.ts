import {Lifecycle as oldLifecycle} from '../../src/old-code/lifecycle';
import {Network, Wallet} from 'fabric-network';
import {Lifecycle, LifecycleChannel} from '../../src';

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

    public static async getCommittedSmartContracts(network: Network, peerName: string, name: string, version: string): Promise<string[]> {
        const result: oldLifecycle.DefinedChaincodeAttributes[] = await oldLifecycle.queryDefinedChaincodes({
            network: network,
            peerName: peerName
        });

        return result.map(data => {
            return data.chaincodeName;
        });
    }
}
