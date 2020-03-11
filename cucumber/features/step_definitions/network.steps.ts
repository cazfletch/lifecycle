import {Given} from 'cucumber'
import {Gateway} from "fabric-network";
import {NetworkHelper} from "../../helpers/NetworkHelper";

Given(/^the gateway is connected$/, async function () {
        const gatewayOrg1: Gateway = await NetworkHelper.connectToGateway(1);

        this.org1Network = await gatewayOrg1.getNetwork('mychannel');

        const gatewayOrg2: Gateway = await NetworkHelper.connectToGateway(2);

        this.org2Network = await gatewayOrg2.getNetwork('mychannel')
});
