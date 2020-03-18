/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs-extra';
import {Wallet} from 'fabric-network';
import {Lifecycle, LifecyclePeer} from '../../src';

export class InstallHelper {

    public static async installPackage(lifecycle: Lifecycle, peerName: string, packagePath: string, wallet: Wallet, identity: string): Promise<string | undefined> {
        const packageFile: Buffer = await fs.readFile(packagePath);

        const peer: LifecyclePeer = lifecycle.getPeer(peerName, wallet, identity);

        return peer.installSmartContractPackage(packageFile, 60000);
    }

    public static async getInstalledPackages(lifecycle: Lifecycle, peerName: string, wallet: Wallet, identity: string): Promise<{ label: string, packageId: string }[]> {
        const peer: LifecyclePeer = lifecycle.getPeer(peerName, wallet, identity);

        return peer.getAllInstalledSmartContracts();
    }
}
