import * as path from 'path';
import * as fs from 'fs-extra';
import {Helper} from './Helper';
import {Gateway, Wallet, Wallets, X509Identity} from 'fabric-network';
import {Lifecycle, LifecyclePeer, LifecyclePeerOptions} from '../../src';

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class NetworkHelper {

    public static async connectToGateway(orgNumber: number): Promise<Gateway> {
        const peerOrgPath: string = path.join(Helper.NETWORK_DIR, 'organizations', 'peerOrganizations');

        const peerOrgNumberPath = path.join(peerOrgPath, `org${orgNumber}.example.com`);
        const org1CCPPath: string = path.join(peerOrgNumberPath, `connection-org${orgNumber}.json`);

        const org1CCP: any = await fs.readJSON(org1CCPPath);

        const wallet: Wallet = await NetworkHelper.importIdentity(orgNumber, peerOrgNumberPath);

        // Set connection options; identity and wallet
        const connectionOptions = {
            identity: `peerAdminOrg${orgNumber}`,
            wallet: wallet,
            discovery: {enabled: true, asLocalhost: true}
        };

        const gateway: Gateway = new Gateway();

        await gateway.connect(org1CCP, connectionOptions);

        return gateway;
    }

    private static async importIdentity(orgNumber: number, peerOrgPath: string): Promise<Wallet> {

        const peerOrg1Cert: string = await fs.readFile(path.join(peerOrgPath, 'users', `Admin@org${orgNumber}.example.com`, 'msp', 'signcerts', 'cert.pem'), 'utf8');

        const peerOrgKeyDir: string = path.join(peerOrgPath, 'users', `Admin@org${orgNumber}.example.com`, 'msp', 'keystore');
        const fileList: string[] = await fs.readdir(peerOrgKeyDir);
        const peerOrg1Key: string = await fs.readFile(path.join(peerOrgKeyDir, fileList[0]), 'utf8');

        const walletPath: string = path.join(Helper.TMP_DIR, 'wallet');

        const wallet: Wallet = await Wallets.newFileSystemWallet(walletPath);

        const peerOrg1Identity: X509Identity = {
            credentials: {
                certificate: peerOrg1Cert,
                privateKey: peerOrg1Key,
            },
            mspId: `Org${orgNumber}MSP`,
            type: 'X.509',
        };

        await wallet.put(`peerAdminOrg${orgNumber}`, peerOrg1Identity);
        return wallet;
    }

    public static async setupLifecycle(): Promise<Lifecycle> {
        const lifecycle = new Lifecycle();

        const org1PeerDetails = await this.getPeerDetails(1);
        const org2PeerDetails = await this.getPeerDetails(2);

        lifecycle.addPeer(org1PeerDetails);
        lifecycle.addPeer(org2PeerDetails);

        return lifecycle
    }

    public static getListOfChannels(lifecycle: Lifecycle, peerName: string, wallet: Wallet, identity: string): Promise<string[]> {
        const peer: LifecyclePeer = lifecycle.getPeer(peerName, wallet, identity);

        return peer.getAllChannelNames();
    }

    private static async getPeerDetails(orgNumber: number): Promise<LifecyclePeerOptions> {
        const peerOrgPath: string = path.join(Helper.NETWORK_DIR, 'organizations', 'peerOrganizations');

        const peerOrgNumberPath = path.join(peerOrgPath, `org${orgNumber}.example.com`);
        const orgCCPPath: string = path.join(peerOrgNumberPath, `connection-org${orgNumber}.json`);

        const org1CCP: any = await fs.readJSON(orgCCPPath);

        const peerInfo = org1CCP.peers[`peer0.org${orgNumber}.example.com`];

        return {
            name: `peer0.org${orgNumber}.example.com`,
            url: peerInfo.url,
            pem: peerInfo.tlsCACerts.pem,
            mspid: `Org${orgNumber}MSP`,
            sslTargetNameOverride: peerInfo.grpcOptions['ssl-target-name-override']
        };


    }
}
