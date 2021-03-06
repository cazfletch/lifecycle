/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Channel, Client, Committer, Endorsement, Endorser, IdentityContext} from 'fabric-common';
import * as protos from 'fabric-protos';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import {Gateway, Wallet, Wallets, X509Identity} from 'fabric-network';
import * as sinon from 'sinon';
import {DefinedSmartContract, LifecycleChannel} from '../src/LifecycleChannel';
import {Lifecycle} from '../src/Lifecycle';
import * as Long from 'long';

// this is horrible but needed as the transaction constructor isn't exported so can't stub it without stubbing the world
// tslint:disable-next-line:no-var-requires
const Transaction = require('fabric-network/lib/transaction');

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

// tslint:disable:no-unused-expression
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

        describe('getCommitReadiness', () => {

            let mysandbox: sinon.SinonSandbox;
            let endorserConnectStub: sinon.SinonStub;

            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            let endorser: Endorser;
            let arg: any;
            let buildRequest: any;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                arg = new protos.lifecycle.CheckCommitReadinessArgs();
                arg.setName('myContract');
                arg.setVersion('0.0.1');
                arg.setSequence(Long.fromValue(1));

                buildRequest = {
                    fcn: 'CheckCommitReadiness',
                    args: [arg.toBuffer()]
                };

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get the commit readiness of a smart contract definition', async () => {

                const encodedResult = protos.lifecycle.CheckCommitReadinessResult.encode({
                    approvals: {
                        org1: true, org2: false
                    }
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: Map<string, boolean> = await channel.getCommitReadiness('myPeer', {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    sequence: 1
                });

                result.size.should.equal(2);
                // @ts-ignore
                result.get('org1').should.equal(true);
                // @ts-ignore
                result.get('org2').should.equal(false);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should get the commit readiness of a smart contract definition with a timeout', async () => {

                const encodedResult = protos.lifecycle.CheckCommitReadinessResult.encode({
                    approvals: {
                        org1: true, org2: false
                    }
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: Map<string, boolean> = await channel.getCommitReadiness('myPeer', {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    sequence: 1
                }, 1234);

                result.size.should.equal(2);
                // @ts-ignore
                result.get('org1').should.equal(true);
                // @ts-ignore
                result.get('org2').should.equal(false);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should get the commit readiness of a smart contract definition with init required', async () => {

                arg.setInitRequired(true);

                buildRequest = {
                    fcn: 'CheckCommitReadiness',
                    args: [arg.toBuffer()]
                };

                const encodedResult = protos.lifecycle.CheckCommitReadinessResult.encode({
                    approvals: {
                        org1: true, org2: false
                    }
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: Map<string, boolean> = await channel.getCommitReadiness('myPeer', {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    sequence: 1,
                    initRequired: true
                });

                result.size.should.equal(2);
                // @ts-ignore
                result.get('org1').should.equal(true);
                // @ts-ignore
                result.get('org2').should.equal(false);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no peerName set', async () => {
                // @ts-ignore
                await channel.getCommitReadiness(undefined, {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    sequence: 1,
                }).should.eventually.be.rejectedWith('parameter peerName is missing');
            });

            it('should handle no options set', async () => {
                // @ts-ignore
                await channel.getCommitReadiness('myPeer', undefined).should.eventually.be.rejectedWith('parameter options is missing');
            });

            it('should handle no smartContractName set', async () => {
                // @ts-ignore
                await channel.getCommitReadiness('myPeer', {
                    smartContractVersion: '0.0.1',
                    sequence: 1,
                }).should.eventually.be.rejectedWith('missing option smartContractName');
            });

            it('should handle no smartContractVersion set', async () => {
                // @ts-ignore
                await channel.getCommitReadiness('myPeer', {
                    smartContractName: 'myContract',
                    sequence: 1,
                }).should.eventually.be.rejectedWith('missing option smartContractVersion');
            });

            it('should handle error with sending request', async () => {

                const encodedResult = protos.lifecycle.CheckCommitReadinessResult.encode({
                    approvals: {
                        org1: true, org2: false
                    }
                });

                endorsementSendStub.rejects({message: 'some error'});

                await channel.getCommitReadiness('myPeer', {
                    smartContractName: 'myContract',
                    smartContractVersion: '0.0.1',
                    sequence: 1
                }).should.eventually.be.rejectedWith('Could not get commit readiness, received error: some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });
        });

        describe('getAllCommittedSmartContracts', () => {

            let mysandbox: sinon.SinonSandbox;
            let endorserConnectStub: sinon.SinonStub;

            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            let endorser: Endorser;
            let arg: any;
            let buildRequest: any;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                arg = new protos.lifecycle.QueryChaincodeDefinitionsArgs();

                buildRequest = {
                    fcn: 'QueryChaincodeDefinitions',
                    args: [arg.toBuffer()]
                };

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get all the committed smart contracts', async () => {

                const encodedResult = protos.lifecycle.QueryChaincodeDefinitionsResult.encode({
                    chaincode_definitions: [{
                        name: 'myContract',
                        sequence: 1,
                        version: '0.0.1',
                        init_required: false,
                        endorsement_plugin: 'escc',
                        validation_plugin: 'vscc',
                        validation_parameter: Buffer.from(JSON.stringify({})),
                        collections: {}
                    }, {
                        name: 'myContract2',
                        sequence: 4,
                        version: '0.0.7',
                        init_required: false,
                        endorsement_plugin: 'escc',
                        validation_plugin: 'vscc',
                        validation_parameter: Buffer.from(JSON.stringify({})),
                        collections: {}
                    }]
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });


                const result: DefinedSmartContract[] = await channel.getAllCommittedSmartContracts('myPeer');

                result.length.should.equal(2);

                result[0].smartContractName.should.equal('myContract');
                result[0].smartContractVersion.should.equal('0.0.1');
                result[0].sequence.should.equal(1);
                // @ts-ignore
                result[0].initRequired.should.equal(false);

                result[1].smartContractName.should.equal('myContract2');
                result[1].smartContractVersion.should.equal('0.0.7');
                result[1].sequence.should.equal(4);
                // @ts-ignore
                result[1].initRequired.should.equal(false);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should get all the committed smart contracts with timeout', async () => {

                const encodedResult = protos.lifecycle.QueryChaincodeDefinitionsResult.encode({
                    chaincode_definitions: [{
                        name: 'myContract',
                        sequence: 1,
                        version: '0.0.1',
                        init_required: false,
                        endorsement_plugin: 'escc',
                        validation_plugin: 'vscc',
                        validation_parameter: Buffer.from(JSON.stringify({})),
                        collections: {}
                    }, {
                        name: 'myContract2',
                        sequence: 4,
                        version: '0.0.7',
                        init_required: false,
                        endorsement_plugin: 'escc',
                        validation_plugin: 'vscc',
                        validation_parameter: Buffer.from(JSON.stringify({})),
                        collections: {}
                    }]
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });


                const result: DefinedSmartContract[] = await channel.getAllCommittedSmartContracts('myPeer', 1234);

                result.length.should.equal(2);

                result[0].smartContractName.should.equal('myContract');
                result[0].smartContractVersion.should.equal('0.0.1');
                result[0].sequence.should.equal(1);
                // @ts-ignore
                result[0].initRequired.should.equal(false);

                result[1].smartContractName.should.equal('myContract2');
                result[1].smartContractVersion.should.equal('0.0.7');
                result[1].sequence.should.equal(4);
                // @ts-ignore
                result[1].initRequired.should.equal(false);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle no peerName', async () => {
                // @ts-ignore
                await channel.getAllCommittedSmartContracts(undefined).should.eventually.be.rejectedWith('parameter peerName is missing');
            });

            it('should handle error from send', async () => {
                endorsementSendStub.rejects({message: 'some error'});

                await channel.getAllCommittedSmartContracts('myPeer').should.eventually.be.rejectedWith('Could not get smart contract definitions, received error: some error');
            });
        });

        describe('getCommittedSmartContract', () => {

            let mysandbox: sinon.SinonSandbox;
            let endorserConnectStub: sinon.SinonStub;

            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            let endorser: Endorser;
            let arg: any;
            let buildRequest: any;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                arg = new protos.lifecycle.QueryChaincodeDefinitionArgs();

                arg.setName('myContract');

                buildRequest = {
                    fcn: 'QueryChaincodeDefinition',
                    args: [arg.toBuffer()]
                };

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get the committed smart contract', async () => {
                const encodedResult = protos.lifecycle.QueryChaincodeDefinitionResult.encode({
                    sequence: 1,
                    version: '0.0.1',
                    init_required: false,
                    endorsement_plugin: 'escc',
                    validation_plugin: 'vscc',
                    validation_parameter: Buffer.from(JSON.stringify({})),
                    collections: {},
                    approvals: {'Org1MSP': true, 'Org2MSP': true}
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: DefinedSmartContract = await channel.getCommittedSmartContract('myPeer', 'myContract');

                result.smartContractName.should.equal('myContract');
                result.smartContractVersion.should.equal('0.0.1');
                result.sequence.should.equal(1);
                // @ts-ignore
                result.initRequired.should.equal(false);

                result.approvals!.size.should.equal(2);
                result.approvals!.get('Org1MSP')!.should.equal(true);
                result.approvals!.get('Org2MSP')!.should.equal(true);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should get all the committed smart contracts with timeout', async () => {

                const encodedResult = protos.lifecycle.QueryChaincodeDefinitionResult.encode({
                    sequence: 1,
                    version: '0.0.1',
                    init_required: false,
                    endorsement_plugin: 'escc',
                    validation_plugin: 'vscc',
                    validation_parameter: Buffer.from(JSON.stringify({})),
                    collections: {},
                    approvals: {'Org1MSP': true, 'Org2MSP': true}
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: DefinedSmartContract = await channel.getCommittedSmartContract('myPeer', 'myContract', 1234);

                result.smartContractName.should.equal('myContract');
                result.smartContractVersion.should.equal('0.0.1');
                result.sequence.should.equal(1);
                // @ts-ignore
                result.initRequired.should.equal(false);

                result.approvals!.size.should.equal(2);
                result.approvals!.get('Org1MSP')!.should.equal(true);
                result.approvals!.get('Org2MSP')!.should.equal(true);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle no peerName', async () => {
                // @ts-ignore
                await channel.getCommittedSmartContract(undefined).should.eventually.be.rejectedWith('parameter peerName is missing');
            });

            it('should handle no smartContractName', async () => {
                // @ts-ignore
                await channel.getCommittedSmartContract('myPeer', undefined).should.eventually.be.rejectedWith('parameter smartContractName is missing');
            });

            it('should handle error from send', async () => {
                endorsementSendStub.rejects({message: 'some error'});

                await channel.getCommittedSmartContract('myPeer', 'mySmartContract').should.eventually.be.rejectedWith('Could not get smart contract definition, received error: some error');
            });
        });
    });
});
