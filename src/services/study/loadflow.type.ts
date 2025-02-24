/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ILimitReductionsByVoltageLevel } from 'components/dialogs/parameters/common/limitreductions/columns-definitions';
import { UUID } from 'crypto';

export interface LoadFlowParametersInfos {
    uuid?: UUID;
    provider: string;
    limitReduction: number;
    commonParameters: Record<string, boolean | string | string[] | number>;
    specificParametersPerProvider: SpecificParametersPerProvider;
    limitReductions: ILimitReductionsByVoltageLevel[];
}

export type SpecificParametersPerProvider = Record<string, Record<string, string>>;
