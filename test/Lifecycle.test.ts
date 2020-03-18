/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {Lifecycle, LifecyclePeer} from '../src';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import {Wallet, Wallets} from 'fabric-network';
import * as path from 'path';

const should = chai.should();
chai.use(sinonChai);

describe('Lifecycle', () => {

    describe(`constructor`, () => {
        it('should create an lifecycle instance', () => {
            const lifecycle: Lifecycle = new Lifecycle();
            should.exist(lifecycle['fabricClient']);
        });
    });

    describe('addPeer', () => {
        it('should add a peer', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            lifecycle.addPeer({
                name: 'myPeer',
                url: 'grpcs://localhost:7051',
                mspid: 'myMSPID',
                pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
            });
            lifecycle['peers'].size.should.equal(1);
        });

        it('should handle no options', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            (() => {
                // @ts-ignore
                lifecycle.addPeer()
            }).should.throw('Missing options parameter');

            lifecycle['peers'].size.should.equal(0);
        });

        it('should handle no name option', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            (() => {
                // @ts-ignore
                lifecycle.addPeer({
                    url: 'grpcs://localhost:7051',
                    mspid: 'myMSPID',
                    pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
                })
            }).should.throw('Missing option name');

            lifecycle['peers'].size.should.equal(0);
        });

        it('should handle no url option', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            (() => {
                // @ts-ignore
                lifecycle.addPeer({
                    name: 'myPeer',
                    mspid: 'myMSPID',
                    pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
                })
            }).should.throw('Missing option url');

            lifecycle['peers'].size.should.equal(0);
        });

        it('should handle no mspid option', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            (() => {
                // @ts-ignore
                lifecycle.addPeer({
                    name: 'myPeer',
                    url: 'grpcs://localhost:7051',
                    pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
                })
            }).should.throw('Missing option mspid');

            lifecycle['peers'].size.should.equal(0);
        });

        it('should handle error from adding peer', () => {
            const lifecycle: Lifecycle = new Lifecycle();

            lifecycle['peers'].size.should.equal(0);

            (() => {
                lifecycle.addPeer({
                    name: 'myPeer',
                    url: 'grpcs://localhost:7051',
                    mspid: 'myMSPID'
                })
            }).should.throw('Could not add the peer myPeer, received error PEM encoded certificate is required.');

            lifecycle['peers'].size.should.equal(0);
        });
    });

    describe('getPeer', () => {

        let lifecycle: Lifecycle;
        let wallet: Wallet;

        before(async () => {
            lifecycle = new Lifecycle();

            lifecycle.addPeer({
                name: 'myPeer',
                url: 'grpcs://localhost:7051',
                mspid: 'myMSPID',
                pem: '-----BEGIN CERTIFICATE-----\\nMIICJjCCAc2gAwIBAgIURY9F2Rt0JqOtiHbNJ6rRgfiDy2EwCgYIKoZIzj0EAwIw\\ncDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMQ8wDQYDVQQH\\nEwZEdXJoYW0xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjAwMzE2MTQ1MDAwWhcNMzUwMzEzMTQ1MDAw\\nWjBwMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGggQ2Fyb2xpbmExDzANBgNV\\nBAcTBkR1cmhhbTEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UEAxMT\\nY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHic\\nzHXBRqfe7elvQ8zuxIwigOFCuk/49bjChQxf19fL/qHBLYLOXgd3Ox5jTVyyLuO/\\nf9x19piTv7gVgv8h7BijRTBDMA4GA1UdDwEB/wQEAwIBBjASBgNVHRMBAf8ECDAG\\nAQH/AgEBMB0GA1UdDgQWBBRGw4tXsbZSI45NZNTsDT7rssJpzjAKBggqhkjOPQQD\\nAgNHADBEAiBWNIFkaageeAiEMmhauY3bTHoG45Wgjk99CjHZ6KJoTgIgMfKc9mBL\\na5JHbGNB/gsBhxIm8/akE6g+SikIz/JGty4=\\n-----END CERTIFICATE-----\\n"\n'
            });

            wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'tmp', 'wallet'));
        });

        it('should get the peer and set the credentials', () => {

            const peer: LifecyclePeer = lifecycle.getPeer('myPeer', wallet, 'myIdentity');

            should.exist(peer['wallet']);
            // @ts-ignore
            peer['identity'].should.equal('myIdentity');
        });

        it('should handle no name set', async () => {
            (() => {
                // @ts-ignore
                lifecycle.getPeer(undefined, wallet, 'myIdentity')
            }).should.throw('Missing parameter name');
        });

        it('should handle no wallet set', async () => {
            (() => {
                // @ts-ignore
                lifecycle.getPeer('myPeer', undefined, 'myIdentity')
            }).should.throw('Missing parameter wallet');
        });

        it('should handle no identity set', async () => {
            (() => {
                // @ts-ignore
                lifecycle.getPeer('myPeer', wallet, undefined)
            }).should.throw('Missing parameter identity');
        });

        it('should handle peer not existing', async () => {
            (() => {
                lifecycle.getPeer('randomPeer', wallet, 'myIdentity')
            }).should.throw('Could not get peer randomPeer, no peer with that name has been added');
        });
    });
});
