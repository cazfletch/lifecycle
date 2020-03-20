import {Client, Utils} from 'fabric-common';
import {LifecyclePeer, LifecyclePeerOptions} from './LifecyclePeer';
import {Wallet} from 'fabric-network';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The Lifecycle class lets you add details of peers that you want to perform lifecycle operations on.
 */
export class Lifecycle {

    private peers: Map<string, LifecyclePeer> = new Map<string, LifecyclePeer>();
    private fabricClient: Client;

    /**
     * Create a Lifecycle instance
     */
    constructor() {
        this.fabricClient = new Client('lifecycle client');

    }

    /**
     * Add details of a peer that you want to perform lifecycle options on
     * @param options LifecyclePeerOptions
     */
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

    /**
     * Get a previously added peer
     * @param name string, the name of the peer that was added
     * @param wallet Wallet, the wallet containing the identity to be used to interact with the peer
     * @param identity string, the name of the identity to be used to interact with the peer
     */
    public getPeer(name: string, wallet: Wallet, identity: string): LifecyclePeer {
        if (!name) {
            throw new Error('Missing parameter name');
        }

        if (!wallet) {
            throw new Error('Missing parameter wallet');
        }

        if (!identity) {
            throw new Error('Missing parameter identity');
        }

        logger.debug('getPeer: name: %s', name);

        const peer: LifecyclePeer | undefined = this.peers.get(name);
        if (!peer) {
            throw new Error(`Could not get peer ${name}, no peer with that name has been added`)
        }

        peer.setCredentials(wallet, identity);

        return peer;
    }
}
