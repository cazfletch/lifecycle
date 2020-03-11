/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

import {Utils} from 'fabric-common';
import {BasePackager} from './BasePackager';
import {BufferStream} from './BufferStream';

const logger = Utils.getLogger('packager/Lifecycle.js');


export abstract class LifecyclePackager extends BasePackager {

    findSource(baseFilepath: string, filepath?: string | undefined): Promise<any> {
        throw new Error("Method not implemented.");
    }
	/**
	 * Package the final chaincode package for installation on a
	 * Hyperledger Fabric Peer using the v2 Lifecycle process.
	 * @param {string} label The label of the chaincode package
	 * @param {string} chaincodeType The chaincode type
	 * @param {Byte[]} packageBytes The chaincode package
	 * @param {string} chaincodePath Optional. The chaincode path path
	 * @returns {Promise<Buffer>}
	 */
	async finalPackage (label, chaincodeType, packageBytes, chaincodePath?) {
		const method = 'finalPackage';
		logger.debug('%s - Start building final lifecycle package for label:%s path:%s type:%s',
			method, label, chaincodePath, chaincodeType);

		// We generate the tar in two phases: First grab a list of descriptors,
		// and then pack them into an archive.  While the two phases aren't
		// strictly necessary yet, they pave the way for the future where we
		// will need to assemble sources from multiple packages

		let descriptors = this.buildMetaDataDescriptors(label, chaincodeType, chaincodePath);
		const package_descriptors = this.buildPackageDescriptors(packageBytes);
		descriptors = descriptors.concat(package_descriptors);
		const stream = new BufferStream();
		await super.generateTarGz(descriptors, stream);
		const return_bytes = stream.toBuffer();
		logger.debug('%s - packaged bytes %s', method, return_bytes.length);

		return return_bytes;
	}

	/**
	 * Build a descriptor to describe an in memory JSON file entry
	 * @param label
	 * @param {string} type
	 * @param {string} path
	 */
	buildMetaDataDescriptors(label: string, type: string, path: string) {
		if (!path) {
			path = '';
		}
		const metadata = {
			label: label,
			path: path,
			type: type
		};
		const descriptors: any[] = [];
		const metadataDescriptor = {
			bytes: Buffer.from(JSON.stringify(metadata), 'utf8'),
			name: 'metadata.json'
		};
		descriptors.push(metadataDescriptor);

		return descriptors;
	}

	/**
	 * Build a descriptor to describe an in memory byte[] file entry
	 * @param {byte[]} bytes that are assumed to be a chaincode package.
	 */
	buildPackageDescriptors(bytes) {
		const descriptors: any[] = [];
		const packageDescriptor = {
			bytes: bytes,
			name: 'code.tar.gz'
		};
		descriptors.push(packageDescriptor);

		return descriptors;
	}
}