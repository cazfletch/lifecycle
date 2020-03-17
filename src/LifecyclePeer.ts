import {Client, Endorser, Endpoint, Utils} from 'fabric-common';

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
