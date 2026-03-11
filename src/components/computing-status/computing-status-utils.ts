/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComputingType } from '@gridsuite/commons-ui';
import { ParameterizedComputingType } from 'redux/actions';
import { ComputingStatusParameters } from 'redux/reducer.type';

export const isParameterizedComputingType = (
    computingType: ComputingType
): computingType is ParameterizedComputingType => {
    return computingType === ComputingType.LOAD_FLOW;
};

export function toComputingStatusParameters<K extends ParameterizedComputingType>(
    computingStatusParameters: unknown,
    _computingType: K
): ComputingStatusParameters[K] | null {
    return computingStatusParameters as ComputingStatusParameters[K];
}
