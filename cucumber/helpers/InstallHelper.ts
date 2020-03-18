/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Lifecycle as OldLifecycle} from '../../src/old-code/lifecycle';

import * as fs from 'fs-extra';
import {Network, Wallet} from 'fabric-network';
import {Lifecycle, LifecyclePeer} from '../../src';

export class InstallHelper {

    public static async installPackage(lifecycle: Lifecycle, peerName: string, packagePath: string, wallet: Wallet, identity: string): Promise<string | undefined> {
        const packageFile: Buffer = await fs.readFile(packagePath);

        const peer: LifecyclePeer = lifecycle.getPeer(peerName, wallet, identity);

        return peer.installSmartContractPackage(packageFile, 60000);
    }

    public static async getInstalledPackages(network: Network, peerName: string): Promise<{ label: string, packageId: string }[]> {
        const result: OldLifecycle.InstalledChannelChaincodeAttributes[] = await OldLifecycle.queryAllInstalledChaincodes({
            network: network,
            peerName: peerName
        });

        return result.map((data) => {
            return {label: data.label, packageId: data.packageId};
        });
    }
}
