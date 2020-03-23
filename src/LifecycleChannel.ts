import {
    Channel,
    Client, Committer,
    Endorser,
    Utils
} from 'fabric-common';
import * as protos from 'fabric-protos';
import {Contract, Gateway, GatewayOptions, Network, Transaction, Wallet} from 'fabric-network';
import * as Long from 'long';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SmartContractDefinitionOptions {
    sequence: number;
    smartContractName: string;
    smartContractVersion: string;
    packageId?: string;
    // endorsementPlugin?: string;
    // validationPlugin?: string;
    // endorsementPolicy?: string | object | Buffer;
    // collectionConfig?: object | Buffer;
    initRequired?: boolean;
}

export class LifecycleChannel {

    private channelName: string;
    private wallet: Wallet;
    private identity: string;

    private fabricClient: Client;

    /**
     * internal use only
     * @param fabricClient
     * @param channelName
     * @param wallet
     * @param identity
     */
    constructor(fabricClient: Client, channelName: string, wallet: Wallet, identity: string) {
        this.fabricClient = fabricClient;
        this.channelName = channelName;
        this.wallet = wallet;
        this.identity = identity;
    }

    public async approveSmartContractDefinition(peerNames: string[], ordererName: string, options: SmartContractDefinitionOptions, requestTimeout?: number): Promise<void> {
        const method = 'approvePackage';
        logger.debug('%s - start', method);

        if (!peerNames || peerNames.length === 0) {
            throw new Error('parameter peers was missing or empty array');
        }

        if (!ordererName) {
            throw new Error('parameter ordererName is missing');
        }

        if (!options) {
            throw new Error('parameter options is missing')
        }

        if (!options.sequence) {
            throw new Error('missing option sequence');
        }

        if (!options.smartContractName) {
            throw new Error('missing option smartContractName');
        }

        if (!options.smartContractVersion) {
            throw new Error('missing option smartContractVersion');
        }

        const endorsers: Endorser[] = [];
        let committer: Committer;

        const gateway: Gateway = new Gateway();

        try {

            const gatewayOptions: GatewayOptions = {
                wallet: this.wallet,
                identity: this.identity,
                discovery: {enabled: false}
            };

            if (requestTimeout) {
                gatewayOptions.eventHandlerOptions = {
                    commitTimeout: requestTimeout,
                    endorseTimeout: requestTimeout
                };
            }

            logger.debug('%s - connect to the network', method);
            await gateway.connect(this.fabricClient, gatewayOptions);
            const network: Network = await gateway.getNetwork(this.channelName);

            logger.debug('%s - add the endorsers to the channel', method);
            const channel: Channel = network.getChannel();

            for (const peerName of peerNames) {
                const endorser: Endorser = this.fabricClient.getEndorser(peerName);
                // @ts-ignore
                await endorser.connect();
                channel.addEndorser(endorser, true);
                endorsers.push(endorser);
            }

            committer = this.fabricClient.getCommitter(ordererName);
            // @ts-ignore
            await committer.connect();
            channel.addCommitter(committer, true);

            logger.debug('%s - build the approve smart contract argument', method);
            const arg = new protos.lifecycle.ApproveChaincodeDefinitionForMyOrgArgs();
            arg.setName(options.smartContractName);
            arg.setVersion(options.smartContractVersion);
            arg.setSequence(Long.fromValue(options.sequence));

            if (typeof options.initRequired === 'boolean') {
                arg.setInitRequired(options.initRequired);
            }

            // TODO add this back in when done policies epic
            // if (options.endorsementPlugin) {
            //     arg.setEndorsementPlugin(options.endorsementPlugin);
            // }
            // if (options.validationPlugin) {
            //     arg.setValidationPlugin(options.validationPlugin);
            // }

            // if (options.endorsementPolicy) {
            //     arg.setValidationParameter(getEndorsementPolicyBytes(options.endorsementPolicy));
            // }
            // if (options.collectionConfig) {
            //     arg.setCollections(getCollectionConfig(options.collectionConfig));
            // }


            const source = new protos.lifecycle.ChaincodeSource();
            if (options.packageId) {
                const local = new protos.lifecycle.ChaincodeSource.Local();
                local.setPackageId(options.packageId);
                source.setLocalPackage(local);
            } else {
                const unavailable = new protos.lifecycle.ChaincodeSource.Unavailable();
                source.setUnavailable(unavailable);
            }

            arg.setSource(source);

            const contract: Contract = network.getContract('_lifecycle');
            const transaction: Transaction = contract.createTransaction('ApproveChaincodeDefinitionForMyOrg');

            transaction.setEndorsingPeers(endorsers);

            await transaction.submit(arg.toBuffer());
            logger.debug('%s - submitted successfully', method);
        } catch (error) {
            logger.error('Problem with the lifecycle approval :: %s', error);
            logger.error(' problem at ::' + error.stack);
            throw new Error(`Could not approve smart contract definition, received error: ${error.message}`);
        } finally {
            // this will disconnect the endorsers and committer
            gateway.disconnect();
        }
    }
}
