/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Lifecycle} from "../../src/lifecycle";
import * as fs from "fs-extra";
import {Network} from "fabric-network";

export class InstallHelper {

    public static async installPackage(network: Network, peerName: string, packagePath: string, name: string, version: string): Promise<string> {
        const packageFile: Buffer = await fs.readFile(packagePath);

        const packagedChaincode: Lifecycle.PackagedChaincode = Lifecycle.newPackagedChaincode({packageFile: packageFile, chaincodeName: name, chaincodeVersion: version, label: name});

        const result: Lifecycle.InstalledChaincode = await packagedChaincode.install({network: network, peerNames: [peerName], timeout: 40000});
        return result.packageId;
    }

    public static async getInstalledPackages(network: Network, peerName: string) {
        const result: Lifecycle.InstalledChannelChaincodeAttributes[] = await Lifecycle.queryAllInstalledChaincodes({network: network, peerName: peerName});

        return result.map((data) => {
            return { label: data.label, packageId: data.packageId };
        });
    }
}
