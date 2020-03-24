import {Given} from 'cucumber'
import {Wallet} from 'fabric-network';
import {NetworkHelper} from '../../helpers/NetworkHelper';
import {Lifecycle} from '../../../src';
import {Helper} from '../../helpers/Helper';

// tslint:disable-next-line:only-arrow-functions
Given(/^the lifecycle is setup$/, async function (): Promise<void> {
    if (!this.lifecycle) {

        const result: { lifecycle: Lifecycle, wallet: Wallet} = await NetworkHelper.setupLifecycle();
        this.lifecycle = result.lifecycle;
        this.wallet = result.wallet;

        this.org1Identity = 'peerAdminOrg1';
        this.org2Identity = 'peerAdminOrg2';

        const channelNames: string[] = await NetworkHelper.getListOfChannels(this.lifecycle, Helper.org1Peer, this.wallet, this.org1Identity);
        channelNames.should.deep.equal(['mychannel']);
        this.channelName = channelNames[0];
    }
});
