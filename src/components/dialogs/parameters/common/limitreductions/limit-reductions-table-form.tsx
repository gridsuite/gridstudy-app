/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
    COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS,
    ILimitReductionsByVoltageLevel,
    ITemporaryLimitReduction,
    LIMIT_DURATION_FORM,
} from './columns-definitions';
import { useIntl } from 'react-intl';
import LimitReductionsTable from './limit-reductions-table';

const getToolTipColumn = (limit: ITemporaryLimitReduction) => {
    const lowBound = Math.trunc(limit.limitDuration.lowBound / 60);
    const highBound = Math.trunc(limit.limitDuration.highBound / 60);
    return `[${lowBound} min, ${highBound} min[`;
};

const LimitReductionsTableForm: FunctionComponent<{
    limits: ILimitReductionsByVoltageLevel[];
}> = ({ limits }) => {
    const intl = useIntl();

    const getLabelColumn = useCallback(
        (limit: ITemporaryLimitReduction) => {
            const lowBound = Math.trunc(limit.limitDuration.lowBound / 60);
            const highBound = Math.trunc(limit.limitDuration.highBound / 60);
            if (lowBound === 0) {
                return intl.formatMessage({ id: 'LimitDurationAfterIST' }, { value: highBound });
            }
            return intl.formatMessage(
                { id: 'LimitDurationInterval' },
                {
                    lowBound: `IT ${lowBound}`,
                    highBound: `IT ${highBound}`,
                }
            );
        },
        [intl]
    );

    const columnsDefinition = useMemo(() => {
        let columnsDefinition = COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS.map((column) => ({
            ...column,
            label: intl.formatMessage({ id: column.label }),
            tooltip: intl.formatMessage({ id: column.tooltip }),
        }));

        if (limits !== null && limits.length > 0) {
            limits[0].temporaryLimitReductions.forEach((tlimit, index) => {
                columnsDefinition.push({
                    label: getLabelColumn(tlimit),
                    dataKey: LIMIT_DURATION_FORM + index,
                    tooltip: getToolTipColumn(tlimit),
                });
            });
        }

        return columnsDefinition;
    }, [intl, limits, getLabelColumn]);

    return <LimitReductionsTable columnsDefinition={columnsDefinition} tableHeight={600} />;
};

export default LimitReductionsTableForm;
