import {
    ProposalResponse,
    Utils
} from 'fabric-common';
import {format} from 'util';

const logger = Utils.getLogger('packager');

/**
 * Copyright 2020 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class LifecycleCommon {

    public static async processResponse(responses: ProposalResponse): Promise<Buffer[]> {
        const payloads: Buffer[] = [];

        if (responses.errors && responses.errors.length > 0) {
            for (const error of responses.errors) {
                logger.error('Problem with response ::' + error);
                throw error;
            }
        } else if (responses.responses && responses.responses.length > 0) {
            logger.debug('checking the query response');
            for (const response of responses.responses) {
                if (response.response && response.response.status) {
                    if (response.response.status === 200) {
                        logger.debug('peer response %j', response);
                        payloads.push(response.response.payload);

                    } else {
                        throw new Error(format('failed with status:%s ::%s', response.response.status, response.response.message));
                    }
                } else {
                    throw new Error('failure in response');
                }
            }
        } else {
            throw new Error('No response returned');
        }

        return payloads;
    }
}
