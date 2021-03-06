/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {InstalledSmartContract, LifecyclePeer} from '../src';
import {Client, Endorsement, Endorser, IdentityContext} from 'fabric-common';
import * as protos from 'fabric-protos';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import {Wallet, Wallets, X509Identity} from 'fabric-network';
import * as sinon from 'sinon';

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

// tslint:disable:no-unused-expression
describe('LifecyclePeer', () => {

    describe(`constructor`, () => {
        it('should create a LifecyclePeer instance', () => {
            const fabricClient: Client = new Client('myClient');
            const peer: LifecyclePeer = new LifecyclePeer({
                url: 'grpcs://localhost:7051',
                mspid: 'myMSPID',
                name: 'myPeer',
                pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
            }, fabricClient);
            peer['url'].should.equal('grpcs://localhost:7051');
            peer['mspid'].should.equal('myMSPID');
            peer['name'].should.equal('myPeer');
            // @ts-ignore
            peer['pem'].should.equal('-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n');

            // check that the endorser reference is created and that the endpoint is set
            const endorser: Endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
            endorser.endpoint['url'].should.equal('grpcs://localhost:7051');
        });
    });

    describe('setCredentials', () => {
        it('should set the credentials for the peer', async () => {
            const fabricClient: Client = new Client('myClient');
            const peer: LifecyclePeer = new LifecyclePeer({
                url: 'grpcs://localhost:7051',
                mspid: 'myMSPID',
                name: 'myPeer',
                pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
            }, fabricClient);

            const wallet: Wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'tmp', 'wallet'));

            peer.setCredentials(wallet, 'myIdentity');

            should.exist(peer['wallet']);
            // @ts-ignore
            peer['identity'].should.equal('myIdentity');
        });
    });

    describe('fabricFunctions', () => {

        let peer: LifecyclePeer;
        let fabricClient: Client;
        let wallet: Wallet;

        before(async () => {
            fabricClient = new Client('myClient');
            peer = new LifecyclePeer({
                url: 'grpcs://localhost:7051',
                mspid: 'myMSPID',
                name: 'myPeer',
                pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
            }, fabricClient);

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
        });

        describe('installSmartContractPackage', () => {
            let mysandbox: sinon.SinonSandbox;

            let buildRequest: any;
            const packageBuffer: Buffer = Buffer.from('mySmartContract');
            let endorser: Endorser;

            let endorserConnectStub: sinon.SinonStub;
            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                peer.setCredentials(wallet, 'myIdentity');
                peer['requestTimeout'] = undefined;

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();

                const arg = new protos.lifecycle.InstallChaincodeArgs();
                arg.setChaincodeInstallPackage(packageBuffer);

                buildRequest = {
                    fcn: 'InstallChaincode',
                    args: [arg.toBuffer()]
                };
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should install the smart contract package', async () => {
                const encodedResult = protos.lifecycle.InstallChaincodeResult.encode({
                    package_id: 'myPackageId'
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: string | undefined = await peer.installSmartContractPackage(packageBuffer);
                result!.should.equal('myPackageId');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should install the smart contract package using the timeout passed in', async () => {
                peer['requestTimeout'] = 1234;
                const encodedResult = protos.lifecycle.InstallChaincodeResult.encode({
                    package_id: 'myPackageId'
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: string | undefined = await peer.installSmartContractPackage(packageBuffer, 4321);
                result!.should.equal('myPackageId');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 4321
                })
            });

            it('should install the smart contract package using the timeout', async () => {
                peer['requestTimeout'] = 1234;
                const encodedResult = protos.lifecycle.InstallChaincodeResult.encode({
                    package_id: 'myPackageId'
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: encodedResult
                        }
                    }]
                });

                const result: string | undefined = await peer.installSmartContractPackage(packageBuffer);
                result!.should.equal('myPackageId');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle buffer not being set', async () => {
                // @ts-ignore
                await peer.installSmartContractPackage().should.eventually.be.rejectedWith('parameter buffer missing');
            });

            it('should handle wallet or identity not being set', async () => {
                peer['wallet'] = undefined;
                peer['identity'] = undefined;
                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Wallet or identity property not set, call setCredentials first');
            });

            it('should handle identity not being in the wallet', async () => {
                peer['identity'] = 'otherIdentity';
                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Could not install smart contact received error: Identity otherIdentity does not exist in the wallet');
            });

            it('should handle errors in the response', async () => {
                endorsementSendStub.resolves({
                    errors: [new Error('some error')]
                });

                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Could not install smart contact received error: some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle a non 200 status code', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 400,
                            message: 'some error'
                        }
                    }]
                });

                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Could not install smart contact received error: failed with status:400 ::some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response details', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {}
                    }]
                });

                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Could not install smart contact received error: failure in response');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response', async () => {
                endorsementSendStub.resolves({});

                await peer.installSmartContractPackage(packageBuffer).should.eventually.be.rejectedWith('Could not install smart contact received error: No response returned');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });
        });

        describe('getAllInstalledSmartContracts', () => {
            let mysandbox: sinon.SinonSandbox;

            let buildRequest: any;
            let endorser: Endorser;

            let endorserConnectStub: sinon.SinonStub;
            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                peer.setCredentials(wallet, 'myIdentity');
                peer['requestTimeout'] = undefined;

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();

                const arg = new protos.lifecycle.QueryInstalledChaincodesArgs();

                buildRequest = {
                    fcn: 'QueryInstalledChaincodes',
                    args: [arg.toBuffer()]
                };
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get all the installed smart contracts', async () => {
                const queryInstalledChaincodeEncodedResult = protos.lifecycle.QueryInstalledChaincodesResult.encode([{
                    package_id: 'myPackageId',
                    label: 'myLabel'
                }, {
                    package_id: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryInstalledChaincodeEncodedResult
                        }
                    }]
                });

                const result: InstalledSmartContract[] = await peer.getAllInstalledSmartContracts();
                result.should.deep.equal([{packageId: 'myPackageId', label: 'myLabel'}, {
                    packageId: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should get installed the smart contract using the timeout passed in', async () => {
                peer['requestTimeout'] = 1234;
                const queryInstalledChaincodeEncodedResult = protos.lifecycle.QueryInstalledChaincodesResult.encode([{
                    package_id: 'myPackageId',
                    label: 'myLabel'
                }, {
                    package_id: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryInstalledChaincodeEncodedResult
                        }
                    }]
                });

                const result: InstalledSmartContract[] = await peer.getAllInstalledSmartContracts(4321);
                result.should.deep.equal([{packageId: 'myPackageId', label: 'myLabel'}, {
                    packageId: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 4321
                });
            });

            it('should get the installed smart contracts using the timeout', async () => {
                peer['requestTimeout'] = 1234;
                const queryInstalledChaincodeEncodedResult = protos.lifecycle.QueryInstalledChaincodesResult.encode([{
                    package_id: 'myPackageId',
                    label: 'myLabel'
                }, {
                    package_id: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryInstalledChaincodeEncodedResult
                        }
                    }]
                });

                const result: InstalledSmartContract[] = await peer.getAllInstalledSmartContracts();
                result.should.deep.equal([{packageId: 'myPackageId', label: 'myLabel'}, {
                    packageId: 'anotherPackageId',
                    label: 'anotherLabel'
                }]);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle wallet or identity not being set', async () => {
                peer['wallet'] = undefined;
                peer['identity'] = undefined;
                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Wallet or identity property not set, call setCredentials first');
            });

            it('should handle identity not being in the wallet', async () => {
                peer['identity'] = 'otherIdentity';
                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Could not get all the installed smart contract packages, received: Identity otherIdentity does not exist in the wallet');
            });

            it('should handle errors in the response', async () => {
                endorsementSendStub.resolves({
                    errors: [new Error('some error')]
                });

                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Could not get all the installed smart contract packages, received: some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle a non 200 status code', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 400,
                            message: 'some error'
                        }
                    }]
                });

                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Could not get all the installed smart contract packages, received: failed with status:400 ::some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response details', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {}
                    }]
                });

                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Could not get all the installed smart contract packages, received: failure in response');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response', async () => {
                endorsementSendStub.resolves({});

                await peer.getAllInstalledSmartContracts().should.eventually.be.rejectedWith('Could not get all the installed smart contract packages, received: No response returned');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });
        });

        describe('getInstalledSmartContractPackage', () => {
            let mysandbox: sinon.SinonSandbox;

            let buildRequest: any;
            let endorser: Endorser;

            let endorserConnectStub: sinon.SinonStub;
            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                peer.setCredentials(wallet, 'myIdentity');
                peer['requestTimeout'] = undefined;

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();

                const arg = new protos.lifecycle.GetInstalledChaincodePackageArgs();
                arg.setPackageId('myPackageId');

                buildRequest = {
                    fcn: 'GetInstalledChaincodePackage',
                    args: [arg.toBuffer()]
                };
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get the installed smart contract package', async () => {
                const pkgData = Buffer.from('myPackage');
                const getInstallPackageEncodedResult = protos.lifecycle.GetInstalledChaincodePackageResult.encode({
                    chaincode_install_package: pkgData
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: getInstallPackageEncodedResult
                        }
                    }]
                });

                const result: Buffer = await peer.getInstalledSmartContractPackage('myPackageId');
                result.compare(pkgData).should.equal(0);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should get installed the smart contract using the timeout passed in', async () => {
                peer['requestTimeout'] = 1234;
                const pkgData = Buffer.from('myPackage');
                const getInstallPackageEncodedResult = protos.lifecycle.GetInstalledChaincodePackageResult.encode({
                    chaincode_install_package: pkgData
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: getInstallPackageEncodedResult
                        }
                    }]
                });

                const result: Buffer = await peer.getInstalledSmartContractPackage('myPackageId', 4321);
                result.compare(pkgData).should.equal(0);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 4321
                });
            });

            it('should get the installed smart contracts using the timeout', async () => {
                peer['requestTimeout'] = 1234;
                const pkgData = Buffer.from('myPackage');
                const getInstallPackageEncodedResult = protos.lifecycle.GetInstalledChaincodePackageResult.encode({
                    chaincode_install_package: pkgData
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: getInstallPackageEncodedResult
                        }
                    }]
                });

                const result: Buffer = await peer.getInstalledSmartContractPackage('myPackageId');
                result.compare(pkgData).should.equal(0);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle packageId not being set', async () => {
                // @ts-ignore
                await peer.getInstalledSmartContractPackage().should.eventually.be.rejectedWith('parameter packageId missing');
            });

            it('should handle wallet or identity not being set', async () => {
                peer['wallet'] = undefined;
                peer['identity'] = undefined;
                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Wallet or identity property not set, call setCredentials first');
            });

            it('should handle identity not being in the wallet', async () => {
                peer['identity'] = 'otherIdentity';
                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Could not get the installed smart contract package, received: Identity otherIdentity does not exist in the wallet');
            });

            it('should handle errors in the response', async () => {
                endorsementSendStub.resolves({
                    errors: [new Error('some error')]
                });

                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Could not get the installed smart contract package, received: some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle a non 200 status code', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 400,
                            message: 'some error'
                        }
                    }]
                });

                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Could not get the installed smart contract package, received: failed with status:400 ::some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response details', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {}
                    }]
                });

                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Could not get the installed smart contract package, received: failure in response');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response', async () => {
                endorsementSendStub.resolves({});

                await peer.getInstalledSmartContractPackage('myPackageId').should.eventually.be.rejectedWith('Could not get the installed smart contract package, received: No response returned');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });
        });

        describe('getAllChannelNames', () => {
            let mysandbox: sinon.SinonSandbox;

            let buildRequest: any;
            let endorser: Endorser;

            let endorserConnectStub: sinon.SinonStub;
            let endorsementBuildSpy: sinon.SinonSpy;
            let endorsementSignSpy: sinon.SinonSpy;
            let endorsementSendStub: sinon.SinonStub;

            beforeEach(() => {
                mysandbox = sinon.createSandbox();

                peer.setCredentials(wallet, 'myIdentity');
                peer['requestTimeout'] = undefined;

                endorser = fabricClient.getEndorser('myPeer', 'myMSPID');
                endorserConnectStub = mysandbox.stub(endorser, 'connect').resolves();

                endorsementBuildSpy = mysandbox.spy(Endorsement.prototype, 'build');
                endorsementSignSpy = mysandbox.spy(Endorsement.prototype, 'sign');
                endorsementSendStub = mysandbox.stub(Endorsement.prototype, 'send');
                endorsementSendStub.resolves();

                buildRequest = {
                    fcn: 'GetChannels',
                    args: []
                };
            });

            afterEach(() => {
                mysandbox.restore();
            });

            it('should get all the channel names', async () => {
                const queryChannelResult = protos.protos.ChannelQueryResponse.encode({
                    channels: [{
                        channel_id: 'mychannel'
                    }, {
                        channel_id: 'anotherchannel'
                    }]
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryChannelResult
                        }
                    }]
                });

                const result: string[] = await peer.getAllChannelNames();
                result.should.deep.equal(['mychannel', 'anotherchannel']);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should all the channel names using the timeout passed in', async () => {
                peer['requestTimeout'] = 1234;
                const queryChannelResult = protos.protos.ChannelQueryResponse.encode({
                    channels: [{
                        channel_id: 'mychannel'
                    }, {
                        channel_id: 'anotherchannel'
                    }]
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryChannelResult
                        }
                    }]
                });

                const result: string[] = await peer.getAllChannelNames(4321);
                result.should.deep.equal(['mychannel', 'anotherchannel']);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 4321
                });
            });

            it('should get all the channel using the timeout', async () => {
                peer['requestTimeout'] = 1234;
                const queryChannelResult = protos.protos.ChannelQueryResponse.encode({
                    channels: [{
                        channel_id: 'mychannel'
                    }, {
                        channel_id: 'anotherchannel'
                    }]
                });

                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 200,
                            payload: queryChannelResult
                        }
                    }]
                });

                const result: string[] = await peer.getAllChannelNames();
                result.should.deep.equal(['mychannel', 'anotherchannel']);

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser],
                    requestTimeout: 1234
                });
            });

            it('should handle wallet or identity not being set', async () => {
                peer['wallet'] = undefined;
                peer['identity'] = undefined;
                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Wallet or identity property not set, call setCredentials first');
            });

            it('should handle identity not being in the wallet', async () => {
                peer['identity'] = 'otherIdentity';
                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Could not get all channel names, received: Identity otherIdentity does not exist in the wallet');
            });

            it('should handle errors in the response', async () => {
                endorsementSendStub.resolves({
                    errors: [new Error('some error')]
                });

                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Could not get all channel names, received: some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle a non 200 status code', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {
                            status: 400,
                            message: 'some error'
                        }
                    }]
                });

                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Could not get all channel names, received: failed with status:400 ::some error');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response details', async () => {
                endorsementSendStub.resolves({
                    responses: [{
                        response: {}
                    }]
                });

                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Could not get all channel names, received: failure in response');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });

            it('should handle no response', async () => {
                endorsementSendStub.resolves({});

                await peer.getAllChannelNames().should.eventually.be.rejectedWith('Could not get all channel names, received: No response returned');

                endorserConnectStub.should.have.been.called;
                endorsementBuildSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext), buildRequest);
                endorsementSignSpy.should.have.been.calledWith(sinon.match.instanceOf(IdentityContext));
                endorsementSendStub.should.have.been.calledWith({
                    targets: [endorser]
                });
            });
        });
    });
});
