/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputingType } from '@gridsuite/commons-ui';
import { ComputingTypeWithAdditionalInfos } from 'redux/actions';
import { ComputingStatusInfos } from 'redux/reducer';

export const isComputingTypeWithAdditionalInfos = (
    computingType: ComputingType
): computingType is ComputingTypeWithAdditionalInfos => {
    return computingType === ComputingType.LOAD_FLOW;
};

export function toComputingStatusInfos<K extends ComputingTypeWithAdditionalInfos>(
    computingStatusInfos: unknown,
    computingType: K
): ComputingStatusInfos[K] | null {
    return computingStatusInfos as ComputingStatusInfos[K];
}
