/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS,
    ILimitReductionsByVoltageLevel,
    IST_FORM,
    ITemporaryLimitReduction,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
    VOLTAGE_LEVELS_FORM,
} from './columns-definitions';
import { useIntl } from 'react-intl';
import LimitReductionsTable from './limit-reductions-table';
import { UseFormReturn } from 'react-hook-form';

const LimitReductionsTableForm: FunctionComponent<{
    formMethods: UseFormReturn;
    limits: ILimitReductionsByVoltageLevel[];
}> = ({ formMethods, limits }) => {
    const intl = useIntl();

    const { reset } = formMethods;

    const getLabelColumn = useCallback(
        (limit: ITemporaryLimitReduction) => {
            return intl.formatMessage(
                { id: 'LimitDuration' },
                {
                    sign: limit.limitDuration.lowClosed ? '>=' : '>',
                    value: Math.trunc(limit.limitDuration.lowBound / 60),
                }
            );
        },
        [intl]
    );

    const columnsDefinition = useMemo(() => {
        let columnsDefinition = COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS.map(
            (column) => ({
                ...column,
                label: intl.formatMessage({ id: column.label }),
            })
        );
        if (limits) {
            limits[0].temporaryLimitReductions.forEach((tlimit, index) => {
                columnsDefinition.push({
                    label: getLabelColumn(tlimit),
                    dataKey: LIMIT_DURATION_FORM + index,
                    width: '20%',
                });
            });
        }
        return columnsDefinition;
    }, [intl, limits, getLabelColumn]);

    const toFormValues = useCallback(() => {
        return limits
            ? {
                  [LIMIT_REDUCTIONS_FORM]: limits.map((vlLimits) => {
                      return {
                          [VOLTAGE_LEVELS_FORM]:
                              vlLimits.voltageLevel.nominalV + ' (kV)',
                          [IST_FORM]: vlLimits.permanentLimitReduction,
                          ...toFormValuesFromTemporaryLimits(
                              vlLimits.temporaryLimitReductions
                          ),
                      };
                  }),
              }
            : {};
    }, [limits]);

    const toFormValuesFromTemporaryLimits = (
        limits: ITemporaryLimitReduction[]
    ) => {
        let formValues: Record<string, number> = {};
        if (limits) {
            limits.forEach((limits, index) => {
                formValues[LIMIT_DURATION_FORM + index] = limits.reduction;
            });
        }
        return formValues;
    };

    useEffect(() => {
        reset(toFormValues());
    }, [reset, toFormValues]);

    return (
        <LimitReductionsTable
            columnsDefinition={columnsDefinition}
            tableHeight={367}
        />
    );
};

export default LimitReductionsTableForm;
