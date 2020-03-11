
/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from "path";

export class Helper {
    public static TMP_DIR = path.join(__dirname, '..', '..', '..', 'cucumber', 'tmp');

    public static NETWORK_DIR = path.join(Helper.TMP_DIR, 'fabric-samples', 'test-network');

    public static PACKAGE_DIR: string = path.join(Helper.TMP_DIR, 'packages');

    public static org1Peer: string = 'peer0.org1.example.com:7051';

    public static org2Peer: string = 'peer0.org2.example.com:9051';
}
