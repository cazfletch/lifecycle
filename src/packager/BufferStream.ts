/*
 * Copyright 2019 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import * as stream from 'stream';

export class BufferStream extends stream.PassThrough {

	private readonly buffers: any[] = [];

	constructor() {
		super();
		this.buffers = [];
		this.on('data', (chunk) => {
			this.buffers.push(chunk);
		});
	}

	toBuffer() {
		return Buffer.concat(this.buffers);
	}

}
