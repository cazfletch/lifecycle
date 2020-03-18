import {Client, Endorsement, Endorser, Endpoint, IdentityContext, User, Utils} from 'fabric-common';
import * as protos from 'fabric-protos';
import {Identity, Wallet} from 'fabric-network';
import {format} from 'util';

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

export interface InstalledSmartContract {
    label: string;
    packageId: string;
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

    public async installSmartContractPackage(buffer: Buffer, requestTimeout?: number): Promise<string | undefined> {
        const method = 'installPackage';
        logger.debug(method);

        let packageId: string | undefined;

        if (!this.wallet || !this.identity) {
            throw new Error('Wallet or identity property not set, call setCredentials first');
        }

        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);

        try {
            // @ts-ignore
            await endorser.connect();
            const channel = this.fabricClient.newChannel('noname');
            // this will tell the peer it is a system wide request
            // not for a specific channel
            // @ts-ignore
            channel['name'] = '';

            logger.debug('%s - build the install smart contract request', method);
            const arg = new protos.lifecycle.InstallChaincodeArgs();
            arg.setChaincodeInstallPackage(buffer);

            const buildRequest = {
                fcn: 'InstallChaincode',
                args: [arg.toBuffer()]
            };

            //  we are going to talk to lifecycle which is really just a smart contract
            const endorsement: Endorsement = channel.newEndorsement('_lifecycle');

            const identity: Identity | undefined = await this.wallet.get(this.identity);
            if (!identity) {
                throw new Error(`Identity ${this.identity} does not exist in the wallet`);
            }

            const provider = this.wallet.getProviderRegistry().getProvider(identity.type);
            const user: User = await provider.getUserContext(identity, this.identity);
            const identityContext: IdentityContext = this.fabricClient.newIdentityContext(user);
            endorsement.build(identityContext, buildRequest);

            logger.debug('%s - sign the install smart contract request', method);
            endorsement.sign(identityContext);

            const endorseRequest: any = {
                targets: [endorser]
            };

            if (requestTimeout || this.requestTimeout) {
                // use the one set in the params if set otherwise use the one set when the peer was added
                endorseRequest.requestTimeout = requestTimeout ? requestTimeout : this.requestTimeout;
            }

            logger.debug('%s - send the install smart contract request', method);
            const responses = await endorsement.send(endorseRequest);

            if (responses.errors && responses.errors.length > 0) {
                for (const error of responses.errors) {
                    logger.error('Problem with the smart contract install ::' + error);
                    throw error;
                }
            } else if (responses.responses && responses.responses.length > 0) {
                logger.debug('%s - check the install chaincode response', method);
                for (const response of responses.responses) {
                    if (response.response && response.response.status) {
                        if (response.response.status === 200) {
                            logger.debug('%s - peer response %j', method, response);
                            const installChaincodeResult = protos.lifecycle.InstallChaincodeResult.decode(response.response.payload);

                            packageId = installChaincodeResult.getPackageId();

                        } else {
                            throw new Error(format('Smart contract install failed with status:%s ::%s', response.response.status, response.response.message));
                        }
                    } else {
                        throw new Error('Smart contract install has failed');
                    }
                }
            } else {
                throw new Error('No response returned for install of smart contract');
            }
            logger.debug('%s - return %s', method, packageId);

            return packageId;
        } catch (error) {
            logger.error('Problem building the lifecycle install request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not install smart contact received error: ${error.message}`);
        } finally {
            endorser.disconnect();
        }
    }

    public async getAllInstalledSmartContracts(requestTimeout?: number): Promise<InstalledSmartContract[]> {
        const method = 'getAllInstalledSmartContracts';
        logger.debug(method);

        const results: InstalledSmartContract[] = [];

        if (!this.wallet || !this.identity) {
            throw new Error('Wallet or identity property not set, call setCredentials first');
        }

        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);

        try {
            // @ts-ignore
            await endorser.connect();
            const channel = this.fabricClient.newChannel('noname');
            // this will tell the peer it is a system wide request
            // not for a specific channel
            // @ts-ignore
            channel['name'] = '';

            logger.debug('%s - build the get all installed smart contracts request', method);
            const arg = new protos.lifecycle.QueryInstalledChaincodesArgs();

            const buildRequest = {
                fcn: 'QueryInstalledChaincodes',
                args: [arg.toBuffer()]
            };

            //  we are going to talk to lifecycle which is really just a smart contract
            const endorsement: Endorsement = channel.newEndorsement('_lifecycle');

            const identity: Identity | undefined = await this.wallet.get(this.identity);
            if (!identity) {
                throw new Error(`Identity ${this.identity} does not exist in the wallet`);
            }

            const provider = this.wallet.getProviderRegistry().getProvider(identity.type);
            const user: User = await provider.getUserContext(identity, this.identity);
            const identityContext: IdentityContext = this.fabricClient.newIdentityContext(user);
            endorsement.build(identityContext, buildRequest);

            logger.debug('%s - sign the get all install smart contract request', method);
            endorsement.sign(identityContext);

            const endorseRequest: any = {
                targets: [endorser]
            };

            if (requestTimeout || this.requestTimeout) {
                // use the one set in the params if set otherwise use the one set when the peer was added
                endorseRequest.requestTimeout = requestTimeout ? requestTimeout : this.requestTimeout;
            }

            logger.debug('%s - send the query request', method);
            const responses = await endorsement.send(endorseRequest);

            if (responses.errors && responses.errors.length > 0) {
                for (const error of responses.errors) {
                    logger.error('Problem with query ::' + error);
                    throw error;
                }
            } else if (responses.responses && responses.responses.length > 0) {
                logger.debug('%s - checking the query response', method);
                for (const response of responses.responses) {
                    if (response.response && response.response.status) {
                        if (response.response.status === 200) {
                            logger.debug('%s - peer response %j', method, response);
                            const queryAllResults = protos.lifecycle.QueryInstalledChaincodesResult.decode(response.response.payload);
                            for (const queryResults of queryAllResults.getInstalledChaincodes()) {
                                const packageId = queryResults.getPackageId();
                                const label = queryResults.getLabel();

                                const result: InstalledSmartContract = {
                                    packageId: packageId,
                                    label: label
                                };

                                results.push(result);
                            }
                        } else {
                            throw new Error(format('query failed with status:%s ::%s', response.response.status, response.response.message));
                        }
                    } else {
                        throw new Error('Query has failed');
                    }
                }
            } else {
                throw new Error('No response returned for query');
            }

            logger.debug('%s - end', method);
            return results;
        } catch (error) {
            logger.error('Problem building the query request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not get all the installed smart contract packages, received: ${error.message}`);
        } finally {
            endorser.disconnect();
        }
    }

    public async getAllChannelNames(requestTimeout?: number): Promise<string[]> {
        const method = 'getAllChannelNames';
        logger.debug(method);

        const results: string[] = [];

        if (!this.wallet || !this.identity) {
            throw new Error('Wallet or identity property not set, call setCredentials first');
        }

        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);

        try {
            // @ts-ignore
            await endorser.connect();
            const channel = this.fabricClient.newChannel('noname');
            // this will tell the peer it is a system wide request
            // not for a specific channel
            // @ts-ignore
            channel['name'] = '';

            logger.debug('%s - build the get all installed smart contracts request', method);

            const buildRequest = {
                fcn: 'GetChannels',
                args: []
            };

            //  we are going to talk to cscc which is really just a smart contract
            const endorsement: Endorsement = channel.newEndorsement('cscc');

            const identity: Identity | undefined = await this.wallet.get(this.identity);
            if (!identity) {
                throw new Error(`Identity ${this.identity} does not exist in the wallet`);
            }

            const provider = this.wallet.getProviderRegistry().getProvider(identity.type);
            const user: User = await provider.getUserContext(identity, this.identity);
            const identityContext: IdentityContext = this.fabricClient.newIdentityContext(user);
            endorsement.build(identityContext, buildRequest);

            logger.debug('%s - sign the get all install smart contract request', method);
            endorsement.sign(identityContext);

            const endorseRequest: any = {
                targets: [endorser]
            };

            if (requestTimeout || this.requestTimeout) {
                // use the one set in the params if set otherwise use the one set when the peer was added
                endorseRequest.requestTimeout = requestTimeout ? requestTimeout : this.requestTimeout;
            }

            logger.debug('%s - send the query request', method);
            const responses = await endorsement.send(endorseRequest);

            if (responses.errors && responses.errors.length > 0) {
                for (const error of responses.errors) {
                    logger.error('Problem with query ::' + error);
                    throw error;
                }
            } else if (responses.responses && responses.responses.length > 0) {
                logger.debug('%s - checking the query response', method);
                for (const response of responses.responses) {
                    if (response.response && response.response.status) {
                        if (response.response.status === 200) {
                            logger.debug('%s - peer response %j', method, response);
                            const queryTrans = protos.protos.ChannelQueryResponse.decode(response.response.payload);
                            logger.debug('queryChannels - ProcessedTransaction.channelInfo.length :: %s', queryTrans.channels.length);
                            for (const channelInfo of queryTrans.channels) {
                                logger.debug('>>> channel id %s ', channelInfo.channel_id);
                                results.push(channelInfo.channel_id);
                            }
                        } else {
                            throw new Error(format('query failed with status:%s ::%s', response.response.status, response.response.message));
                        }
                    } else {
                        throw new Error('Query has failed');
                    }
                }
            } else {
                throw new Error('No response returned for query');
            }

            logger.debug('%s - end', method);
            return results;
        } catch (error) {
            logger.error('Problem building the query request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not get all channel names, received: ${error.message}`);
        } finally {
            endorser.disconnect();
        }
    }

    private initialize(): void {
        this.fabricClient.setTlsClientCertAndKey(this.clientCertKey!, this.clientKey!);
        // this will add the peer to the list of endorsers
        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);
        const endpoint: Endpoint = this.fabricClient.newEndpoint({
            url: this.url,
            pem: this.pem,
            'ssl-target-name-override': this.sslTargetNameOverride,
            requestTimeout: this.requestTimeout
        });
        endorser['setEndpoint'](endpoint);
    }
}
