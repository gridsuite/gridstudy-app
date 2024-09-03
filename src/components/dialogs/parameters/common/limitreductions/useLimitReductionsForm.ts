/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import {
    ILimitReductionsByVoltageLevel,
    ITemporaryLimitReduction,
    IST_FORM,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
    VOLTAGE_LEVELS_FORM,
} from './columns-definitions';

export const useLimitReductionsForm = (limits: ILimitReductionsByVoltageLevel[]) => {
    const toFormValuesFromTemporaryLimits = (limits: ITemporaryLimitReduction[]) => {
        let formValues: Record<string, number> = {};
        limits.forEach((limit, index) => {
            formValues[LIMIT_DURATION_FORM + index] = limit.reduction;
        });
        return formValues;
    };

    const toFormValuesLimitReductions = useCallback(() => {
        if (!limits) {
            return {};
        }
        return {
            [LIMIT_REDUCTIONS_FORM]: limits.map((vlLimits) => ({
                [VOLTAGE_LEVELS_FORM]: vlLimits.voltageLevel.nominalV + ' (kV)',
                [IST_FORM]: vlLimits.permanentLimitReduction,
                ...toFormValuesFromTemporaryLimits(vlLimits.temporaryLimitReductions),
            })),
        };
    }, [limits]);

    return { toFormValuesLimitReductions };
};
