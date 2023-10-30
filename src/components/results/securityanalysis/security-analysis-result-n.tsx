/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import {
    CustomColDef,
    PreContingencyResult,
    SecurityAnalysisResultNProps,
} from './security-analysis.type';
import { IntlShape, useIntl } from 'react-intl';
import { LimitViolation } from './security-analysis.type';
import { SecurityAnalysisTable } from './security-analysis-table';
import {
    computeLoading,
    FROM_COLUMN_TO_FIELD,
    securityAnalysisTableNColumnsDefinition,
    securityAnalysisTableNFilterDefinition,
} from './security-analysis-result-utils';
import CustomHeaderComponent from 'components/custom-aggrid/custom-aggrid-header';

export const SecurityAnalysisResultN: FunctionComponent<
    SecurityAnalysisResultNProps
> = ({
    result,
    isLoadingResult,
    onSortChanged,
    sortConfig,
    updateFilter,
    filterSelector,
    filterEnums,
}) => {
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

    const filtersDef = useMemo(
        () => securityAnalysisTableNFilterDefinition(intl, filterEnums),
        [filterEnums, intl]
    );

    const makeColumn = useCallback(
        ({
            headerName,
            field = '',
            valueGetter,
            cellRenderer,
            isSortable = false,
            isHidden = false,
            isFilterable = false,
            filterType,
        }: CustomColDef) => {
            const { options: filterOptions = [] } =
                filtersDef.find((filterDef) => filterDef?.field === field) ||
                {};

            const filterSelectedOptions =
                FROM_COLUMN_TO_FIELD[field] &&
                filterSelector?.[FROM_COLUMN_TO_FIELD[field]];

            return {
                headerName,
                field,
                valueGetter,
                cellRenderer,
                hide: isHidden,
                headerComponent: CustomHeaderComponent,
                headerComponentParams: {
                    field,
                    displayName: headerName,
                    sortConfig,
                    onSortChanged: (newSortValue: number = 0) => {
                        onSortChanged(field, newSortValue);
                    },
                    isSortable,
                    isFilterable,
                    filterOptions,
                    updateFilter,
                    filterSelectedOptions,
                    filterType,
                },
            };
        },
        [filtersDef, filterSelector, sortConfig, updateFilter, onSortChanged]
    );

    const columnDefs = useMemo(
        () => securityAnalysisTableNColumnsDefinition(intl, makeColumn),
        [intl, makeColumn]
    );

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
        />
    );
};
