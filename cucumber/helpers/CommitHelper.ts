import {Lifecycle} from "../../src/lifecycle";
import {Network} from "fabric-network";

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class CommitHelper {

    public static async commitSmartContract(network: Network, peerNames: string[], name: string, version: string, packageId: string) {
        const approvedChaincode: Lifecycle.ApprovedChaincode = await Lifecycle.newApprovedChaincode({
            chaincodeName: name,
            chaincodeVersion: version,
            label: name,
            packageId: packageId,
            sequence: 1
        });

        await approvedChaincode.commit({network: network, peerNames: peerNames});
    }

    public static async getCommittedSmartContracts(network: Network, peerName: string, name: string, version: string): Promise<string[]> {
        const result: Lifecycle.DefinedChaincodeAttributes[] = await Lifecycle.queryDefinedChaincodes({
            network: network,
            peerName: peerName
        });

        return result.map(data => {
            return data.chaincodeName;
        });
    }
}
