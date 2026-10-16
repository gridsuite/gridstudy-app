/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SCAFaultResult, ShortCircuitAnalysisType } from '@gridsuite/commons-ui';

export type SCAResult = {
    resultUuid: string;
    writeTimeStamp: any;
    faults: SCAFaultResult[];
};

export enum ShortCircuitAnalysisResultTabs {
    ALL_BUSES = 0,
    ONE_BUS = 1,
}

export const getShortCircuitAnalysisTypeFromEnum = (type: ShortCircuitAnalysisType) => {
    switch (type) {
        case ShortCircuitAnalysisType.ALL_BUSES:
            return 'ALL_BUSES';
        case ShortCircuitAnalysisType.ONE_BUS:
            return 'ONE_BUS';
        default:
            return null;
    }
};
