import {
    Client,
    Endorsement,
    Endorser,
    Endpoint,
    IdentityContext,
    ProposalResponse,
    User,
    Utils
} from 'fabric-common';
import * as protos from 'fabric-protos';
import {Identity, Wallet} from 'fabric-network';
import {LifecycleCommon} from './LifecycleCommon';

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

    /**
     * Set the wallet and identity that you want to use when doing lifecycle operations
     * @param wallet Wallet, the wallet containing the identity to be used to interact with the peer
     * @param identity string, the name of the identity to be used to interact with the peer
     */
    public setCredentials(wallet: Wallet, identity: string): void {
        this.wallet = wallet;
        this.identity = identity;
    }

    /**
     * Install a smart contract package onto a peer
     * @param buffer Buffer, the smart contract package buffer
     * @param requestTimeout number, [optional] the timeout used when performing the install operation
     * @return Promise<string>, the packageId of the installed smart contract
     */
    public async installSmartContractPackage(buffer: Buffer, requestTimeout?: number): Promise<string | undefined> {
        const method = 'installPackage';
        logger.debug(method);

        let packageId: string | undefined;

        if (!buffer) {
            throw new Error('parameter buffer missing');
        }

        try {
            logger.debug('%s - build the install smart contract request', method);
            const arg = new protos.lifecycle.InstallChaincodeArgs();
            arg.setChaincodeInstallPackage(buffer);

            const buildRequest = {
                fcn: 'InstallChaincode',
                args: [arg.toBuffer()]
            };

            const responses: ProposalResponse = await this.sendRequest(buildRequest, '_lifecycle', requestTimeout);

            const payloads: Buffer[] = await LifecycleCommon.processResponse(responses);

            const installChaincodeResult = protos.lifecycle.InstallChaincodeResult.decode(payloads[0]);

            packageId = installChaincodeResult.getPackageId();

            logger.debug('%s - return %s', method, packageId);

            return packageId;
        } catch (error) {
            logger.error('Problem with the request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not install smart contact received error: ${error.message}`);
        }
    }

    /**
     * Get all the smart contracts installed on a peer
     * @param requestTimeout number [optional, [optional] the timeout used when performing the install operation
     * @return Promise<InstalledSmartContract>, the label and packageId of each installed smart contract
     */
    public async getAllInstalledSmartContracts(requestTimeout?: number): Promise<InstalledSmartContract[]> {
        const method = 'getAllInstalledSmartContracts';
        logger.debug(method);

        const results: InstalledSmartContract[] = [];

        try {
            logger.debug('%s - build the get all installed smart contracts request', method);
            const arg = new protos.lifecycle.QueryInstalledChaincodesArgs();

            const buildRequest = {
                fcn: 'QueryInstalledChaincodes',
                args: [arg.toBuffer()]
            };

            const responses: ProposalResponse = await this.sendRequest(buildRequest, '_lifecycle', requestTimeout);

            const payloads: Buffer[] = await LifecycleCommon.processResponse(responses);

            // only sent to one peer so should only be one payload
            const queryAllResults = protos.lifecycle.QueryInstalledChaincodesResult.decode(payloads[0]);
            for (const queryResults of queryAllResults.getInstalledChaincodes()) {
                const packageId = queryResults.getPackageId();
                const label = queryResults.getLabel();

                const result: InstalledSmartContract = {
                    packageId: packageId,
                    label: label
                };

                results.push(result);
            }

            logger.debug('%s - end', method);
            return results;
        } catch (error) {
            logger.error('Problem with the request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not get all the installed smart contract packages, received: ${error.message}`);
        }
    }

    /**
     * Get the buffer containing a smart contract package that has been installed on the peer
     * @param packageId string, the packageId of the installed smart contract package to be retrieved
     * @param requestTimeout number, [optional] the timeout used when performing the install operation
     * @return Promise<Buffer>, the buffer containing the smart contract package
     */
    public async getInstalledSmartContractPackage(packageId: string, requestTimeout?: number): Promise<Buffer> {
        const method = 'getInstalledSmartContractPackage';
        logger.debug(method);

        if (!packageId) {
            throw new Error('parameter packageId missing');
        }

        let result: Buffer;

        try {
            logger.debug('%s - build the get package chaincode request', method);
            const arg = new protos.lifecycle.GetInstalledChaincodePackageArgs();
            arg.setPackageId(packageId);

            const buildRequest = {
                fcn: 'GetInstalledChaincodePackage',
                args: [arg.toBuffer()]
            };

            const responses: ProposalResponse = await this.sendRequest(buildRequest, '_lifecycle', requestTimeout);

            const payloads: Buffer[] = await LifecycleCommon.processResponse(responses);

            // only sent to one peer so can only be one payload
            const results = protos.lifecycle.GetInstalledChaincodePackageResult.decode(payloads[0]);
            const packageBytes = results.getChaincodeInstallPackage(); // the package bytes
            result = packageBytes.toBuffer();

            logger.debug('%s - end', method);
            return result
        } catch (error) {
            logger.error('Problem with the request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not get the installed smart contract package, received: ${error.message}`);
        }
    }

    /**
     * Get a list of all the channel names that the peer has joined
     * @param requestTimeout number, [optional] the timeout used when performing the install operation
     * @return Promise<string[]>, An array of the names of the channels
     */
    public async getAllChannelNames(requestTimeout?: number): Promise<string[]> {
        const method = 'getAllChannelNames';
        logger.debug(method);

        const results: string[] = [];

        try {
            logger.debug('%s - build the get all installed smart contracts request', method);

            const buildRequest = {
                fcn: 'GetChannels',
                args: []
            };

            const responses = await this.sendRequest(buildRequest, 'cscc', requestTimeout);

            const payloads: Buffer[] = await LifecycleCommon.processResponse(responses);

            // only sent to one peer so only one payload
            const queryTrans = protos.protos.ChannelQueryResponse.decode(payloads[0]);
            logger.debug('queryChannels - ProcessedTransaction.channelInfo.length :: %s', queryTrans.channels.length);
            for (const channelInfo of queryTrans.channels) {
                logger.debug('>>> channel id %s ', channelInfo.channel_id);
                results.push(channelInfo.channel_id);
            }

            logger.debug('%s - end', method);
            return results;
        } catch (error) {
            logger.error('Problem with the request :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not get all channel names, received: ${error.message}`);
        }
    }

    private initialize(): void {
        this.fabricClient.setTlsClientCertAndKey(this.clientCertKey!, this.clientKey!);

        const endpoint: Endpoint = this.fabricClient.newEndpoint({
            url: this.url,
            pem: this.pem,
            'ssl-target-name-override': this.sslTargetNameOverride,
            requestTimeout: this.requestTimeout
        });

        // this will add the peer to the list of endorsers
        const endorser: Endorser = this.fabricClient.getEndorser(this.name, this.mspid);
        endorser['setEndpoint'](endpoint);
    }

    private async sendRequest(buildRequest: { fcn: string, args: Buffer[] }, smartContractName: string, requestTimeout ?: number): Promise<ProposalResponse> {
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

            const endorsement: Endorsement = channel.newEndorsement(smartContractName);

            const identity: Identity | undefined = await this.wallet.get(this.identity);
            if (!identity) {
                throw new Error(`Identity ${this.identity} does not exist in the wallet`);
            }

            const provider = this.wallet.getProviderRegistry().getProvider(identity.type);
            const user: User = await provider.getUserContext(identity, this.identity);
            const identityContext: IdentityContext = this.fabricClient.newIdentityContext(user);
            endorsement.build(identityContext, buildRequest);

            logger.debug('%s - sign the get all install smart contract request');
            endorsement.sign(identityContext);

            const endorseRequest: any = {
                targets: [endorser]
            };

            if (requestTimeout || this.requestTimeout) {
                // use the one set in the params if set otherwise use the one set when the peer was added
                endorseRequest.requestTimeout = requestTimeout ? requestTimeout : this.requestTimeout;
            }

            logger.debug('%s - send the query request');
            return endorsement.send(endorseRequest);
        } finally {
            endorser.disconnect();
        }
    }
}
