/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo } from 'react';
import {
    PreContingencyResult,
    SecurityAnalysisResultNProps,
} from './security-analysis-types';
import { IntlShape, useIntl } from 'react-intl';
import { LimitViolation } from './security-analysis-types';
import { SecurityAnalysisTable } from './security-analysis-table';
import { computeLoading } from './security-analysis-result-utils';
import { ValueFormatterParams } from 'ag-grid-community';

export const SecurityAnalysisResultN: FunctionComponent<
    SecurityAnalysisResultNProps
> = ({ result, isLoadingResult }) => {
    const intl: IntlShape = useIntl();

    const limitViolations =
        (result as PreContingencyResult)?.limitViolationsResult
            ?.limitViolations || [];

    const rows = limitViolations.map((limitViolation: LimitViolation) => {
        return {
            subjectId: limitViolation.subjectId,
            limitType: intl.formatMessage({
                id: limitViolation.limitType,
            }),
            limit: limitViolation.limit,
            value: limitViolation.value,
            loading: computeLoading(limitViolation),
        };
    });

    const columnDefs = useMemo(
        () => [
            {
                headerName: intl.formatMessage({ id: 'Equipment' }),
                field: 'subjectId',
                filter: 'agTextColumnFilter',
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                filter: 'agTextColumnFilter',
            },
            {
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.data?.limit?.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.data?.value?.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.data.loading?.toFixed(1),
            },
        ],
        [intl]
    );

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
        />
    );
};
