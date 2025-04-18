/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import {
    ConstraintsFromContingencyItem,
    ContingenciesFromConstraintItem,
    SecurityAnalysisResultNmkProps,
} from './security-analysis.type';
import {
    flattenNmKResultsConstraints,
    flattenNmKResultsContingencies,
    handlePostSortRows,
    PAGE_OPTIONS,
} from './security-analysis-result-utils';
import { SecurityAnalysisTable } from './security-analysis-table';
import { RowClassParams } from 'ag-grid-community';
import { Box, useTheme } from '@mui/material';
import CustomTablePagination from '../../utils/custom-table-pagination';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    button: {
        color: 'node.background',
    },
};

export const SecurityAnalysisResultNmk: FunctionComponent<SecurityAnalysisResultNmkProps> = ({
    result,
    columnDefs,
    isLoadingResult,
    isFromContingency,
    paginationProps,
}) => {
    const { content } = result || {};

    const theme = useTheme();
    const intl: IntlShape = useIntl();

    const rows = useMemo(
        () =>
            isFromContingency
                ? flattenNmKResultsContingencies(intl, content as ConstraintsFromContingencyItem[])
                : flattenNmKResultsConstraints(intl, content as ContingenciesFromConstraintItem[]),
        [content, intl, isFromContingency]
    );

    const getRowStyle = useCallback(
        (params: RowClassParams) => {
            if ((isFromContingency && params?.data?.contingencyId) || (!isFromContingency && params?.data?.subjectId)) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [isFromContingency, theme.selectedRow.background]
    );

    const agGridProps = {
        postSortRows: handlePostSortRows,
        getRowStyle,
        tooltipShowDelay: 0,
    };

    return (
        <Box sx={styles.container}>
            <Box sx={{ flexGrow: 1 }}>
                <SecurityAnalysisTable
                    rows={rows}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    agGridProps={agGridProps}
                />
            </Box>
            <Box>
                <CustomTablePagination rowsPerPageOptions={PAGE_OPTIONS} {...paginationProps} />
            </Box>
        </Box>
    );
};
