import {Lifecycle} from "../../src/lifecycle";
import * as path from "path";
import * as fs from "fs-extra";
import {Helper} from "./Helper";
import PackagedChaincode = Lifecycle.PackagedChaincode;

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class PackageHelper {

    public static async packageContract(projectPath:string, label: string, type: string): Promise<string> {
        // TODO: the name and version is never actually used maybe you should just do Lifecycle.packageSmartContract(options)
        const chaincodeSource: Lifecycle.ChaincodeSource = Lifecycle.newChaincodeSource({
            chaincodeName: label,
            chaincodeVersion: '0.0.1'
        });

        // TODO: this returns a thing to then be able to install but i think it should just return the package buffer
        const packagedChaincode: PackagedChaincode = await chaincodeSource.package({chaincodePath: projectPath, chaincodeType: type, label: label});

        await fs.ensureDir(Helper.PACKAGE_DIR);

        // TODO: change this to the actual buffer
        const packagePath: string = path.join(Helper.PACKAGE_DIR, `${label}.tar.gz`);
        await fs.writeFile(packagePath, packagedChaincode.packageFile);
        return packagePath;
    }
}
