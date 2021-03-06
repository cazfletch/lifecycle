import {Client, Committer, Endpoint, Utils} from 'fabric-common';
import {LifecyclePeer, LifecyclePeerOptions} from './LifecyclePeer';
import {Wallet} from 'fabric-network';
import {LifecycleChannel} from './LifecycleChannel';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OrdererOptions {
    name: string,
    url: string,
    mspid: string,
    pem?: string
    sslTargetNameOverride?: string,
    requestTimeout?: number;
}

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
     * @returns LifecyclePeer, an instance of a LifecyclePeer
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

    /**
     * Get a channel
     * @param channelName string, the name of the channel
     * @param wallet Wallet, the wallet to use with the channel
     * @param identity string, the identity to use with the channel
     * @returns LifecycleChannel, an instance of a LifecycleChannel
     */
    public getChannel(channelName: string, wallet: Wallet, identity: string): LifecycleChannel {
        if (!channelName) {
            throw new Error('parameter channelName is missing');
        }

        if (!wallet) {
            throw new Error('parameter wallet is missing');
        }

        if (!identity) {
            throw new Error('parameter identity is missing');
        }

        return new LifecycleChannel(this.fabricClient, channelName, wallet, identity);
    }

    /**
     * Add an orderer
     * @param options OrdererOptions, the details about the orderer that is to be used
     */
    public addOrderer(options: OrdererOptions): void {
        if (!options) {
            throw new Error('parameter options is missing');
        }

        if (!options.name) {
            throw new Error('missing option name');
        }

        if (!options.mspid) {
            throw new Error('missing option mspid');
        }

        if (!options.url) {
            throw new Error('missing option url');
        }

        const endpoint: Endpoint = this.fabricClient.newEndpoint({
            url: options.url,
            'ssl-target-name-override': options.sslTargetNameOverride,
            requestTimeout: options.requestTimeout,
            pem: options.pem
        });

        const committer: Committer = this.fabricClient.getCommitter(options.name, options.mspid);
        committer.setEndpoint(endpoint);
    }
}
