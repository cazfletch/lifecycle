import {Client, Endorser, Endpoint, Utils} from 'fabric-common';
import {Wallet} from 'fabric-network';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LifecyclePeerOptions {
    name: string,
    url: string,
    mspid: string,
    sslTargetNameOverride?: string,
    pem?: string,
    clientCertKey?: string;
    clientKey?: string;
    requestTimeout?: number;
}

export class LifecyclePeer {

    private name!: string;
    private url!: string;
    private mspid!: string;
    private sslTargetNameOverride?: string;
    private pem?: string;
    private clientCertKey?: string;
    private clientKey?: string;
    private requestTimeout?: number;

    private wallet: Wallet | undefined;
    private identity: string | undefined;

    private fabricClient: Client;

    /**
     * internal use only
     * @param options: LifecyclePeerOptions
     * @param fabricClient: Client
     */
    constructor(options: LifecyclePeerOptions, fabricClient: Client) {
        Object.assign(this, options);

        this.fabricClient = fabricClient;

        this.initialize();
    }

    public setCredentials(wallet: Wallet, identity: string): void {
        this.wallet = wallet;
        this.identity = identity;
    }

    private initialize(): void {
        // this will add the peer to the list of endorsers
        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);
        const endpoint: Endpoint = new Endpoint({
            url: this.url,
            pem: this.pem,
            'ssl-target-name-override': this.sslTargetNameOverride,
            clientCert: this.clientCertKey,
            clientKey: this.clientKey,
            requestTimeout: this.requestTimeout
        });
        endorser['setEndpoint'](endpoint);
    }
}
