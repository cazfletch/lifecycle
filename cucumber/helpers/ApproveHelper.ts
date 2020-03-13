import {Lifecycle} from '../../src/old-code/lifecycle';
import {Network} from 'fabric-network';

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class ApproveHelper {

    public static async approveSmartContract(network: Network, peerName: string, name: string, version: string, packageId: string): Promise<void> {
        const installedChaincode: Lifecycle.InstalledChaincode = Lifecycle.newInstalledChaincode({
            chaincodeName: name,
            chaincodeVersion: version,
            label: name,
            packageId: packageId
        });

        await installedChaincode.approve({sequence: 1, network: network, peerNames: [peerName]});
    }

    public static async checkCommitReadiness(network: Network, peerName: string, name: string, version: string): Promise<boolean> {
        try {
            const result = await Lifecycle.queryCommitReadiness({
                chaincodeName: name,
                chaincodeVersion: version,
                sequence: 1,
                network: network,
                peerName: peerName
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
