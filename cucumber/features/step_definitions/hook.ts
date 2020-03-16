/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {After} from 'cucumber'

After(function (): void {
    if (this.org1Network) {
        this.org1Network.gateway.disconnect()
    }
    if (this.org2Network) {
        this.org2Network.gateway.disconnect();
    }
});
