/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { STEPS_TAP } from 'components/utils/field-constants';
import { TapChangerStep, TapChangerStepMapInfos } from './two-windings-transformer.types';

export const TwoWindingsTransformerCreationDialogTab = {
    CHARACTERISTICS_TAB: 0,
    LIMITS_TAB: 1,
    RATIO_TAP_TAB: 2,
    PHASE_TAP_TAB: 3,
};

export const TwoWindingsTransformerModificationDialogTab = {
    CONNECTIVITY_TAB: 0,
    CHARACTERISTICS_TAB: 1,
    LIMITS_TAB: 2,
    STATE_ESTIMATION_TAB: 3,
    RATIO_TAP_TAB: 4,
    PHASE_TAP_TAB: 5,
};

export function toTapChangerStepList(
    stepsRecord: Record<number, TapChangerStepMapInfos> | undefined
): TapChangerStep[] | undefined {
    if (stepsRecord) {
        return Object.keys(stepsRecord)
            .map((key) => {
                const index = Number(key);
                return {
                    ...stepsRecord[index],
                    [STEPS_TAP]: index,
                };
            })
            .sort((a, b) => {
                return a[STEPS_TAP] - b[STEPS_TAP];
            });
    }
    return undefined;
}
