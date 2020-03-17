import {Client, Utils} from 'fabric-common';
import {LifecyclePeer, LifecyclePeerOptions} from './LifecyclePeer';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */


export class Lifecycle {

    private peers: Map<string, LifecyclePeer> = new Map<string, LifecyclePeer>();
    private fabricClient: Client;

    constructor() {
        this.fabricClient = new Client('lifecycle client');

    }

    public addPeer(options: LifecyclePeerOptions): void {
        if (!options) {
            throw new Error('Missing options parameter');
        }

        logger.debug('addPeer: name: %s, url: %s, mspid: %s, sslTargetNameOverride: %s pem: %s clientCertKey: %s clientKey %s requestTimout: %s',
            options.name, options.url, options.mspid, options.sslTargetNameOverride, options.pem, options.clientCertKey, options.clientKey, options.requestTimeout);

        if (!options.name) {
            throw new Error('Missing option name');
        }

        if (!options.url) {
            throw new Error('Missing option url');
        }

        if (!options.mspid) {
            throw new Error('Missing option mspid');
        }

        try {
            const peer: LifecyclePeer = new LifecyclePeer(options, this.fabricClient);
            this.peers.set(options.name, peer);
        } catch (error) {
            throw new Error(`Could not add the peer ${options.name}, received error ${error.message}`);
        }
    }
}
