/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Channel, Client, Committer, Endorser} from 'fabric-common';
import * as protos from 'fabric-protos';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import {Gateway, Wallet, Wallets, X509Identity} from 'fabric-network';
import * as sinon from 'sinon';
import {LifecycleChannel} from '../src/LifecycleChannel';
import {Lifecycle} from '../src/Lifecycle';
import * as Long from 'long';

// this is horrible but needed as the transaction constructor isn't exported so can't stub it without stubbing the world
// tslint:disable-next-line:no-var-requires
const Transaction = require('fabric-network/lib/transaction');

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

// tslint:disable:no - unused - expression
describe('LifecycleChannel', () => {

    let wallet: Wallet;
    let channel: LifecycleChannel;
    let fabricClient: Client;

    before(async () => {
        wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'tmp', 'wallet'));

        const peerOrg1Identity: X509Identity = {
            credentials: {
                certificate: '-----BEGIN CERTIFICATE-----\n' +
                    'MIICujCCAmGgAwIBAgIUUOge6hz++rKSbrV1Ya2t/kcC3s0wCgYIKoZIzj0EAwIw\n' +
                    'cDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\n' +
                    'EwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\n' +
                    'Lm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE3MTU0NzAwWhcNMjEwMzE3MTU1MjAw\n' +
                    'WjBgMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExFDASBgNV\n' +
                    'BAoTC0h5cGVybGVkZ2VyMQ4wDAYDVQQLEwVhZG1pbjESMBAGA1UEAxMJb3JnMWFk\n' +
                    'bWluMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEoELj0ASt7TpEAUNJjPkG7zNY\n' +
                    'wLMP3LDsFc38rWKm6ZRGtJIQ5k7jcoXXScuhS1YuRop/xKAvOhiLbd1hyo7fAqOB\n' +
                    '6DCB5TAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUEKQz\n' +
                    'qJPP/lPsRO7BizDnjJptylswHwYDVR0jBBgwFoAUSS9NU/qBB+Wx0R7PispddLmZ\n' +
                    'fd0wKAYDVR0RBCEwH4IdQ2Fyb2xpbmVzLU1hY0Jvb2stUHJvLTMubG9jYWwwWwYI\n' +
                    'KgMEBQYHCAEET3siYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiIiLCJoZi5FbnJv\n' +
                    'bGxtZW50SUQiOiJvcmcxYWRtaW4iLCJoZi5UeXBlIjoiYWRtaW4ifX0wCgYIKoZI\n' +
                    'zj0EAwIDRwAwRAIgHhpQYEAtQ9rPhvh4Wer3hKtuq7FChoqJWkj9rNdnbIkCIC4I\n' +
                    'GzjjS7hZRKsETRvIT3LRFTZJLJq6AcGOtepFso/n\n' +
                    '-----END CERTIFICATE-----',
                privateKey: '-----BEGIN PRIVATE KEY-----\n' +
                    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgvprUzTpK7GBMXVvI\n' +
                    'NOlGgxyqqi1TM6CA63qNK8PTwfihRANCAASgQuPQBK3tOkQBQ0mM+QbvM1jAsw/c\n' +
                    'sOwVzfytYqbplEa0khDmTuNyhddJy6FLVi5Gin/EoC86GItt3WHKjt8C\n' +
                    '-----END PRIVATE KEY-----',
            },
            mspId: `myMSPID`,
            type: 'X.509',
        };

        await wallet.put('myIdentity', peerOrg1Identity);

        const lifecycle: Lifecycle = new Lifecycle();

        lifecycle.addPeer({
            url: 'grpcs://localhost:7051',
            mspid: 'myMSPID',
            name: 'myPeer',
            pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
        });

        lifecycle.addOrderer({
            name: 'myOrderer',
            url: 'grpcs://localhost:7050',
            mspid: 'osmsp',
            pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
        });

        fabricClient = lifecycle['fabricClient'];

        channel = new LifecycleChannel(fabricClient, 'mychannel', wallet, 'myIdentity');
    });

    describe(`constructor`, () => {
        it('should create a LifecycleChannel instance', () => {

            channel['fabricClient'].should.deep.equal(fabricClient);
            channel['channelName'].should.equal('mychannel');
            channel['wallet'].should.deep.equal(wallet);
            channel['identity'].should.equal('myIdentity');
        });
    });

    describe('fabric functions', () => {

        describe('approveSmartContractDefinition', () => {

            let mysandbox: sinon.SinonSandbox;
            let endorserConnectStub: sinon.SinonStub;
            let committerConnectStub: sinon.SinonStub;

            let gatewayConnectSpy: sinon.SinonSpy;

            let transactionSetEndorsingPeersSpy: sinon.SinonSpy;
            let transactionSubmitStub: sinon.SinonStub;

            let addEndorserStub: sinon.SinonStub;
            let addCommitterStub: sinon.SinonStub;

            let endorser: Endorser;
            let committer: Committer;
            let arg: any;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                committer = fabricClient.getCommitter('myOrderer', 'osmps');
                committerConnectStub = mysandbox.stub(committer, 'connect').resolves();

                arg = new protos.lifecycle.ApproveChaincodeDefinitionForMyOrgArgs();
                arg.setName('myContract');
                arg.setVersion('0.0.1');
                arg.setSequence(Long.fromValue(1));

                const local = new protos.lifecycle.ChaincodeSource.Local();
                local.setPackageId('myPackageId');

                const source = new protos.lifecycle.ChaincodeSource();
                source.setLocalPackage(local);
                arg.setSource(source);

                addEndorserStub = mysandbox.stub(Channel.prototype, 'addEndorser');
                addCommitterStub = mysandbox.stub(Channel.prototype, 'addCommitter');

                gatewayConnectSpy = mysandbox.spy(Gateway.prototype, 'connect');

                transactionSetEndorsingPeersSpy = mysandbox.spy(Transaction.prototype, 'setEndorsingPeers');
                transactionSubmitStub = mysandbox.stub(Transaction.prototype, 'submit');

            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should approve a smart contract definition', async () => {
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                });

                addEndorserStub.should.have.been.calledWith(endorser);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorser]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should approve a smart contract definition with timeout set', async () => {
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                }, 1234);

                addEndorserStub.should.have.been.calledWith(endorser);
                addCommitterStub.should.have.been.calledWith(committer);

                const call: sinon.SinonSpyCall = gatewayConnectSpy.getCall(0);
                call.args[1].eventHandlerOptions.should.deep.equal({
                    commitTimeout: 1234,
                    endorseTimeout: 1234
                });

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorser]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should approve a smart contract definition and set initRequired if set', async () => {

                arg.setInitRequired(true);

                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    initRequired: true
                });

                addEndorserStub.should.have.been.calledWith(endorser);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorser]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should approve a smart contract definition handle no packageId', async () => {

                const unavailable = new protos.lifecycle.ChaincodeSource.Unavailable();

                const source = new protos.lifecycle.ChaincodeSource();
                source.setUnavailable(unavailable);

                arg.setSource(source);

                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                });

                addEndorserStub.should.have.been.calledWith(endorser);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorser]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should handle no peerNames set', async () => {
                await channel.approveSmartContractDefinition([], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('parameter peers was missing or empty array');
            });

            it('should handle no orderer set', async () => {
                // @ts-ignore
                await channel.approveSmartContractDefinition(['myPeer'], undefined, {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('parameter ordererName is missing');
            });

            it('should handle no options set', async () => {
                // @ts-ignore
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', undefined).should.eventually.be.rejectedWith('parameter options is missing');
            });

            it('should handle no sequence set', async () => {
                // @ts-ignore
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('missing option sequence');
            });

            it('should handle no smartContractName set', async () => {
                // @ts-ignore
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('missing option smartContractName');
            });

            it('should handle no smartContractVersion set', async () => {
                // @ts-ignore
                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                }).should.eventually.be.rejectedWith('missing option smartContractVersion');
            });

            it('should handle error from submit', async () => {
                transactionSubmitStub.rejects({message: 'some error'});

                await channel.approveSmartContractDefinition(['myPeer'], 'myOrderer', {
                    packageId: 'myPackageId',
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                }).should.eventually.be.rejectedWith('Could not approve smart contract definition, received error: some error');

                addEndorserStub.should.have.been.calledWith(endorser);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorser]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });
        });

        describe('commitSmartContractDefinition', () => {

            let mysandbox: sinon.SinonSandbox;
            let endorserConnectStub: sinon.SinonStub;
            let committerConnectStub: sinon.SinonStub;

            let gatewayConnectSpy: sinon.SinonSpy;

            let transactionSetEndorsingPeersSpy: sinon.SinonSpy;
            let transactionSubmitStub: sinon.SinonStub;

            let addEndorserStub: sinon.SinonStub;
            let addCommitterStub: sinon.SinonStub;

            let endorserOne: Endorser;
            let endorserTwo: Endorser;
            let committer: Committer;
            let arg: any;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                endorserOne = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserTwo = fabricClient.getEndorser('myPeer2', 'myMSPID2');
                endorserConnectStub = mysandbox.stub(Endorser.prototype, 'connect').resolves();

                committer = fabricClient.getCommitter('myOrderer', 'osmps');
                committerConnectStub = mysandbox.stub(committer, 'connect').resolves();

                arg = new protos.lifecycle.ApproveChaincodeDefinitionForMyOrgArgs();
                arg.setName('myContract');
                arg.setVersion('0.0.1');
                arg.setSequence(Long.fromValue(1));

                addEndorserStub = mysandbox.stub(Channel.prototype, 'addEndorser');
                addCommitterStub = mysandbox.stub(Channel.prototype, 'addCommitter');

                gatewayConnectSpy = mysandbox.spy(Gateway.prototype, 'connect');

                transactionSetEndorsingPeersSpy = mysandbox.spy(Transaction.prototype, 'setEndorsingPeers');
                transactionSubmitStub = mysandbox.stub(Transaction.prototype, 'submit');
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should commit a smart contract definition', async () => {
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                });

                addEndorserStub.firstCall.should.have.been.calledWith(endorserOne);
                addEndorserStub.secondCall.should.have.been.calledWith(endorserTwo);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorserOne, endorserTwo]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should commit a smart contract definition with timeout set', async () => {
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                }, 1234);

                addEndorserStub.firstCall.should.have.been.calledWith(endorserOne);
                addEndorserStub.secondCall.should.have.been.calledWith(endorserTwo);
                addCommitterStub.should.have.been.calledWith(committer);

                const call: sinon.SinonSpyCall = gatewayConnectSpy.getCall(0);
                call.args[1].eventHandlerOptions.should.deep.equal({
                    commitTimeout: 1234,
                    endorseTimeout: 1234
                });

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorserOne, endorserTwo]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should commit a smart contract definition and set initRequired if set', async () => {

                arg.setInitRequired(true);

                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    initRequired: true
                });

                addEndorserStub.firstCall.should.have.been.calledWith(endorserOne);
                addEndorserStub.secondCall.should.have.been.calledWith(endorserTwo);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorserOne, endorserTwo]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });

            it('should handle no peerNames set', async () => {
                await channel.commitSmartContractDefinition([], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('parameter peers was missing or empty array');
            });

            it('should handle no orderer set', async () => {
                // @ts-ignore
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], undefined, {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('parameter ordererName is missing');
            });

            it('should handle no options set', async () => {
                // @ts-ignore
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', undefined).should.eventually.be.rejectedWith('parameter options is missing');
            });

            it('should handle no sequence set', async () => {
                // @ts-ignore
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('missing option sequence');
            });

            it('should handle no smartContractName set', async () => {
                // @ts-ignore
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractVersion: '0.0.1',
                }).should.eventually.be.rejectedWith('missing option smartContractName');
            });

            it('should handle no smartContractVersion set', async () => {
                // @ts-ignore
                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                }).should.eventually.be.rejectedWith('missing option smartContractVersion');
            });

            it('should handle error from submit', async () => {
                transactionSubmitStub.rejects({message: 'some error'});

                await channel.commitSmartContractDefinition(['myPeer', 'myPeer2'], 'myOrderer', {
                    sequence: 1,
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1'
                }).should.eventually.be.rejectedWith('Could not commit smart contract definition, received error: some error');

                addEndorserStub.firstCall.should.have.been.calledWith(endorserOne);
                addEndorserStub.secondCall.should.have.been.calledWith(endorserTwo);
                addCommitterStub.should.have.been.calledWith(committer);

                transactionSetEndorsingPeersSpy.should.have.been.calledWith([endorserOne, endorserTwo]);
                transactionSubmitStub.should.have.been.calledWith(arg.toBuffer());
            });
        });
    });
});
