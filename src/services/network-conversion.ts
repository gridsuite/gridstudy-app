/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { backendFetchJson, Parameter } from '@gridsuite/commons-ui';
import { PREFIX_STUDY_SERVER_QUERIES } from './study';

const PREFIX_NETWORK_CONVERSION_SERVER_QUERIES = PREFIX_STUDY_SERVER_QUERIES + '/v1/network-conversion';

export interface GetCaseImportParametersReturn {
    formatName: string;
    parameters: Parameter[];
}

export function getCaseImportParameters(caseUuid: UUID): Promise<GetCaseImportParametersReturn> {
    console.info(`get import parameters for case '${caseUuid}' ...`);
    const getExportFormatsUrl = PREFIX_NETWORK_CONVERSION_SERVER_QUERIES + '/cases/' + caseUuid + '/import-parameters';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}
