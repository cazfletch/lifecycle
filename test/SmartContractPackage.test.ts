/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {SmartContractPackage, SmartContractType} from '../src';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import {NodePackager} from '../src/packager/Node';

const should = chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

const contractTypes: string[] = ['node', 'java', 'golang'];

describe('SmartContractPackage', () => {

    describe(`createPackage`, () => {

        let mysandbox: sinon.SinonSandbox;

        beforeEach(() => {
            mysandbox = sinon.createSandbox();
        });

        afterEach(() => {
            mysandbox.restore();
        });

        for (const contractType of contractTypes) {
            it(`should package the contract ${contractType}`, async () => {
                const contractPath: string = path.join(__dirname, 'data', contractType);
                const result: SmartContractPackage = await SmartContractPackage.createSmartContractPackage({
                    smartContractPath: contractPath,
                    label: `test-${contractType}`,
                    smartContractType: contractType as SmartContractType
                });
                should.exist(result.smartContractPackage);
            });

            it(`should package the ${contractType} contract with metadata`, async () => {
                const contractPath: string = path.join(__dirname, 'data', contractType);
                const result: SmartContractPackage = await SmartContractPackage.createSmartContractPackage({
                    smartContractPath: contractPath,
                    label: `test-${contractType}`,
                    smartContractType: contractType as SmartContractType,
                    metaDataPath: path.join(contractPath, 'META-INF')
                });
                should.exist(result.smartContractPackage);
            });
        }

        it('should give an error if no options', async () => {
            // @ts-ignore
            await SmartContractPackage.createSmartContractPackage().should.eventually.be.rejectedWith('Missing options');
        });

        it('should give an error if contractPath is empty', async () => {
            await SmartContractPackage.createSmartContractPackage({
                smartContractPath: '',
                label: `test-node`,
                smartContractType: SmartContractType.NODE
            }).should.eventually.be.rejectedWith('Missing option smartContractPath');
        });

        it('should give an error if no label', async () => {
            const contractPath: string = path.join(__dirname, 'data', 'node');
            await SmartContractPackage.createSmartContractPackage({
                label: '',
                smartContractPath: contractPath,
                smartContractType: SmartContractType.NODE
            }).should.eventually.be.rejectedWith('Missing option label');
        });

        it('should give an error if no type', async () => {
            const contractPath: string = path.join(__dirname, 'data', 'node');
            await SmartContractPackage.createSmartContractPackage({
                label: 'test-node',
                smartContractPath: contractPath,
                smartContractType: '' as SmartContractType
            }).should.eventually.be.rejectedWith('Missing option smartContractType');
        });

        it('should give an error if type is not valid', async () => {
            const contractPath: string = path.join(__dirname, 'data', 'node');
            await SmartContractPackage.createSmartContractPackage({
                label: 'test-node',
                smartContractPath: contractPath,
                smartContractType: 'banana' as SmartContractType
            }).should.eventually.be.rejectedWith('option smartContractType must be set to one of: golang, node, or java');
        });

        it('should give an error not a module and no go path set', async () => {
            const contractPath: string = path.join(__dirname, 'data', 'golang');
            mysandbox.stub(fs, 'pathExists').resolves(false);
            await SmartContractPackage.createSmartContractPackage({
                label: 'test-go',
                smartContractPath: contractPath,
                smartContractType: SmartContractType.GO
            }).should.eventually.be.rejectedWith('option goLangPath was not set so tried to use environment variable GOPATH but this was not set either, one of these must be set');
        });

        it('should package go without a mod file', async () => {
            const goPath: string = path.join(__dirname, 'data', 'golang-no-mod');
            const contractPath: string = path.join('fab-car');
            const packagedContract: SmartContractPackage = await SmartContractPackage.createSmartContractPackage({
                label: 'test-go',
                smartContractPath: contractPath,
                smartContractType: SmartContractType.GO,
                golangPath: goPath
            });

            should.exist(packagedContract.smartContractPackage);
        });

        it('should handle error from packaging', async () => {
            mysandbox.stub(NodePackager.prototype, 'package').rejects(new Error('some error'));

            const contractPath: string = path.join(__dirname, 'data', 'node');
            await SmartContractPackage.createSmartContractPackage({
                label: 'test-node',
                smartContractPath: contractPath,
                smartContractType: SmartContractType.NODE
            }).should.eventually.be.rejectedWith('Could not package smart contract, received error: some error');

        })
    });
});
