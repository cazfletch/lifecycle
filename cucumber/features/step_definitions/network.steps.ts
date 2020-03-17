import {Given} from 'cucumber'
import {Gateway} from 'fabric-network';
import {NetworkHelper} from '../../helpers/NetworkHelper';
import {Lifecycle} from '../../../src';

Given(/^the gateway is connected$/, async function (): Promise<void> {
    const gatewayOrg1: Gateway = await NetworkHelper.connectToGateway(1);

    this.org1Network = await gatewayOrg1.getNetwork('mychannel');

    const gatewayOrg2: Gateway = await NetworkHelper.connectToGateway(2);

    this.org2Network = await gatewayOrg2.getNetwork('mychannel')
});

// tslint:disable-next-line:only-arrow-functions
Given(/^the lifecycle is setup$/, function (): void {
    if (!this.lifecycle) {
        this.lifecycle = NetworkHelper.setupLifecycle();
    }
});
