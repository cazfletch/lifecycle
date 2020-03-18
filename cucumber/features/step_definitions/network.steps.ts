import {Given} from 'cucumber'
import {Gateway, Wallet, Wallets} from 'fabric-network';
import {NetworkHelper} from '../../helpers/NetworkHelper';
import {Lifecycle} from '../../../src';
import * as path from 'path';
import {Helper} from '../../helpers/Helper';

Given(/^the gateway is connected$/, async function (): Promise<void> {
    const gatewayOrg1: Gateway = await NetworkHelper.connectToGateway(1);

    this.org1Network = await gatewayOrg1.getNetwork('mychannel');

    const gatewayOrg2: Gateway = await NetworkHelper.connectToGateway(2);

    this.org2Network = await gatewayOrg2.getNetwork('mychannel')
});

// tslint:disable-next-line:only-arrow-functions
Given(/^the lifecycle is setup$/, async function (): Promise<void> {
    if (!this.lifecycle) {
        this.lifecycle = await NetworkHelper.setupLifecycle();

        // TODO once gateway not needed this can be changed
        const walletPath: string = path.join(Helper.TMP_DIR, 'wallet');
        this.wallet = await Wallets.newFileSystemWallet(walletPath);

        this.org1Identity = 'peerAdminOrg1';
        this.org2Identity = 'peerAdminOrg2';
    }
});
