import {Wallet} from 'fabric-network';
import {Lifecycle, LifecycleChannel} from '../../src';

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class ApproveHelper {

    public static async approveSmartContract(lifecycle: Lifecycle, peerName: string, name: string, version: string, packageId: string, wallet: Wallet, identity: string): Promise<void> {
        const channel: LifecycleChannel = lifecycle.getChannel('mychannel', wallet, identity);

        await channel.approveSmartContractDefinition([peerName], 'orderer.example.com', {
            smartContractName: name,
            smartContractVersion: version,
            packageId: packageId,
            sequence: 1
        });
    }

    public static async checkCommitReadiness(lifecycle: Lifecycle, peerName: string, name: string, version: string, wallet: Wallet, identity: string): Promise<boolean> {
        try {
            const channel: LifecycleChannel = lifecycle.getChannel('mychannel', wallet, identity);

            const result: Map<string, boolean> = await channel.getCommitReadiness(peerName, {
                smartContractName: name,
                smartContractVersion: version,
                sequence: 1
            });

            return Array.from(result.values()).every((value) => value);
        } catch (error) {
            // no way to actually query approved so if its just the sequence number is wrong then assume we have already committed therefore approved
            if (error.message.includes('requested sequence is 1, but new definition must be sequence 2')) {
                return true;
            } else {
                throw error;
            }
        }
    }
}
