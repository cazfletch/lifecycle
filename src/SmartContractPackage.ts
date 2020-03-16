/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {LifecyclePackager} from './packager/Lifecycle';
import {NodePackager} from './packager/Node';
import {JavaPackager} from './packager/Java';
import {GolangPackager} from './packager/Golang';
import {Utils} from 'fabric-common';
import {SmartContractType} from './packager/BasePackager';

import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import * as tar from 'tar-stream';

const logger = Utils.getLogger('packager');

export interface PackagingOptions {
    smartContractPath: string,
    label: string,
    smartContractType: SmartContractType,
    metaDataPath?: string,
    golangPath?: string
}

export class SmartContractPackage {

    public smartContractPackage: Buffer;
    private fileNames: string[] = [];

    constructor(smartContractPackage: Buffer) {
        this.smartContractPackage = smartContractPackage;
    }

    public static async createSmartContractPackage(options: PackagingOptions): Promise<SmartContractPackage> {
        if (!options) {
            throw new Error('Missing options parameter');
        }

        logger.debug('createSmartContractPackage: smartContractPath: %s, label: %s, smartContractType: %s, metadataPath: %s golangPath: %s',
            options.smartContractPath, options.label, options.smartContractType, options.metaDataPath, options.golangPath);


        if (!options.label) {
            throw new Error('Missing option label');
        }
        if (!options.smartContractPath || options.smartContractPath.length < 1) {
            throw new Error('Missing option smartContractPath');
        }

        if (!options.smartContractType) {
            throw new Error('Missing option smartContractType');
        }

        const correctType: boolean = Object.values(SmartContractType).includes(options.smartContractType);
        if (!correctType) {
            throw new Error('option smartContractType must be set to one of: golang, node, or java');
        }

        if (options.smartContractType === SmartContractType.GO) {
            const isModule: boolean = await fs.pathExists(path.join(options.smartContractPath, 'go.mod'));

            if (!isModule && !options.golangPath && !process.env.GOPATH) {
                throw new Error('option goLangPath was not set so tried to use environment variable GOPATH but this was not set either, one of these must be set');
            }
        }

        try {
            const smartContractPackage: Buffer = await this.packageContract(options.smartContractPath, options.smartContractType, options.metaDataPath, options.golangPath);

            const finalSmartContract: Buffer = await this.finalPackage(options.label, options.smartContractType, smartContractPackage, options.golangPath);

            return new SmartContractPackage(finalSmartContract);
        } catch (error) {
            throw new Error(`Could not package smart contract, received error: ${error.message}`);
        }
    }

    public async getFileNames(): Promise<string[]> {
        try {
            this.fileNames = [];
            await this.findFileNames(this.smartContractPackage);
            return this.fileNames;
        } catch (error) {
            throw new Error(`Could not get file names for package, received error: ${error.message}`);
        }
    }

    private static async finalPackage(label: string, smartContractType: SmartContractType, packageBytes: Buffer, goPath?: string): Promise<Buffer> {
        logger.debug('finalPackager - Start');

        const handler: LifecyclePackager = this.getHandler(smartContractType);

        return handler.finalPackage(label, smartContractType, packageBytes, goPath);
    }

    private static async packageContract(smartContractPath: string, smartContractType: SmartContractType, metadataPath?: string, goPath?: string): Promise<Buffer> {

        const handler: LifecyclePackager = this.getHandler(smartContractType);

        return handler.package(smartContractPath, metadataPath, goPath);
    }

    private static getHandler(smartContractType: SmartContractType): LifecyclePackager {
        logger.debug('packager: type %s ', smartContractType);

        let handler;

        switch (smartContractType) {
            case SmartContractType.NODE:
                handler = new NodePackager();
                break;
            case SmartContractType.JAVA:
                handler = new JavaPackager();
                break;
            case SmartContractType.GO:
                handler = new GolangPackager(['.go', '.c', '.h', '.s', '.mod', '.sum']);
        }

        return handler
    }

    private async findFileNames(buffer: Buffer): Promise<void> {
        return new Promise((resolve) => {
            const gunzip = zlib.createGunzip();
            const extract = tar.extract();
            extract.on('entry', (header, stream, next) => {
                logger.debug('Package._findFileNames - found entry %s', header.name);
                if (header.type === 'file') {
                    if (header.name === 'code.tar.gz') {
                        this.extractInnerZip(stream, next);
                    } else {
                        this.fileNames.push(header.name);
                        stream.on('end', () => {
                            next();
                        });
                        stream.resume();
                    }
                }
            });
            extract.on('finish', () => {
                resolve();
            });
            gunzip.pipe(extract);
            gunzip.end(buffer);
        });
    }

    private extractInnerZip(packageStream: any, finished: any): void {
        const gunzip = zlib.createGunzip();
        const extract = tar.extract();

        extract.on('entry', (header, stream, next) => {
            logger.debug('Package._findFileNames - found entry %s', header.name);
            if (header.type === 'file') {
                this.fileNames.push(header.name);
            }
            stream.on('end', () => {
                next();
            });
            stream.resume();
        });
        extract.on('finish', () => {
            finished();
        });

        gunzip.pipe(extract);
        packageStream.pipe(gunzip);
    }
}
