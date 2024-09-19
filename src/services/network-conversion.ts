/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { backendFetchJson } from './utils';

const PREFIX_NETWORK_CONVERSION_SERVER_QUERIES = import.meta.env.VITE_API_GATEWAY + '/network-conversion';

export interface CaseImportParameters {
    name: string;
    description: string;
    type: string;
    defaultValue: any;
    possibleValues?: string[] | null;
}

export interface GetCaseImportParametersReturn {
    formatName: string;
    parameters: CaseImportParameters[];
}

export function getCaseImportParameters(caseUuid: UUID): Promise<GetCaseImportParametersReturn> {
    console.info(`get import parameters for case '${caseUuid}' ...`);
    const getExportFormatsUrl =
        PREFIX_NETWORK_CONVERSION_SERVER_QUERIES + '/v1/cases/' + caseUuid + '/import-parameters';
    console.debug(getExportFormatsUrl);
    return backendFetchJson(getExportFormatsUrl);
}
