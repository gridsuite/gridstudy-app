/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useCallback, useMemo, useRef } from 'react';
import { TOOLTIP_DELAY } from 'utils/UIconstants';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RunningStatus } from '../../utils/running-status';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { Box, LinearProgress } from '@mui/material';
import { mappingTabs, SUFFIX_TYPES } from './sensitivity-analysis-result-utils.js';
import { CustomAGGrid, CustomAGGridProps } from '@gridsuite/commons-ui';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { SensiKind, SENSITIVITY_AT_NODE, SENSITIVITY_IN_DELTA_MW } from './sensitivity-analysis-result.type';
import { AppState } from '../../../redux/reducer';
import type {
    ColDef,
    ColGroupDef,
    GridApi,
    GridColumnsChangedEvent,
    GridReadyEvent,
    RowDataUpdatedEvent,
} from 'ag-grid-community';
import { Sensitivity } from '../../../services/study/sensitivity-analysis.type';

function isColDef(col: ColDef | ColGroupDef): col is ColDef {
    return (col as ColDef).field !== undefined;
}

function getColumnHeaderDisplayNames(gridApi: GridApi): string[] {
    return (
        gridApi.getColumnDefs()?.map((c) => {
            if (isColDef(c)) {
                return c.headerComponentParams?.displayName;
            }
            return '';
        }) ?? []
    );
}

function makeRows(resultRecord: Sensitivity[]) {
    return resultRecord.map((row: Sensitivity) => sanitizeObject(row));
}

// Replace NaN values with an empty string
function sanitizeObject(record: Object): Object {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value === 'NaN' ? '' : value]));
}

type SensitivityAnalysisResultProps = CustomAGGridProps & {
    result: Sensitivity[];
    nOrNkIndex: number;
    sensiKind: SensiKind;
    filtersDef: { field: string; options: string[] }[];
    isLoading: boolean;
    onFilter: () => void;
    setCsvHeaders: (newHeaders: string[]) => void;
    setIsCsvButtonDisabled: (newIsCsv: boolean) => void;
};

function SensitivityAnalysisResult({
    result,
    nOrNkIndex = 0,
    sensiKind = SENSITIVITY_IN_DELTA_MW,
    filtersDef,
    onFilter,
    isLoading,
    setCsvHeaders,
    setIsCsvButtonDisabled,
    ...props
}: Readonly<SensitivityAnalysisResultProps>) {
    const gridRef = useRef(null);
    const intl = useIntl();
    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const messages = useIntlResultStatusMessages(intl, true);

    const makeColumn = useCallback(
        ({
            field,
            labelId,
            isNum = false,
            pinned = false,
            maxWidth,
        }: {
            field: string;
            labelId: string;
            isNum?: boolean;
            pinned?: boolean;
            maxWidth?: number;
        }) => {
            const { options: filterOptions = [] } = filtersDef.find((filterDef) => filterDef?.field === field) || {};

            return makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: labelId }),
                colId: field,
                field: field,
                context: {
                    numeric: isNum,
                    fractionDigits: isNum ? 2 : undefined,
                    sortParams: {
                        table: SENSITIVITY_ANALYSIS_RESULT_SORT_STORE,
                        tab: mappingTabs(sensiKind, nOrNkIndex),
                    },
                    filterComponent: isNum ? undefined : CustomAggridAutocompleteFilter,
                    filterComponentParams: {
                        filterParams: {
                            type: AgGridFilterType.SensitivityAnalysis,
                            tab: mappingTabs(sensiKind, nOrNkIndex),
                            updateFilterCallback: onFilter,
                        },
                        options: filterOptions,
                    },
                },
                maxWidth: maxWidth,
                wrapHeaderText: true,
                autoHeaderHeight: true,
                pinned: pinned,
            });
        },
        [filtersDef, intl, nOrNkIndex, onFilter, sensiKind]
    );

    const columnsDefs = useMemo(() => {
        const returnedTable = [];

        returnedTable.push(
            makeColumn({
                field: 'funcId',
                labelId: sensiKind === SENSITIVITY_AT_NODE ? 'BusBarBus' : 'SupervisedBranches',
                pinned: true,
                maxWidth: 350,
            })
        );
        returnedTable.push(
            makeColumn({
                field: 'varId',
                labelId: 'VariablesToSimulate',
                pinned: true,
            })
        );

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn({
                    field: 'contingencyId',
                    labelId: 'ContingencyId',
                    pinned: true,
                })
            );
        }

        const suffix1 = 'In' + SUFFIX_TYPES[sensiKind];
        const suffix = suffix1 + (nOrNkIndex !== 1 ? '' : 'BeforeContingency');

        returnedTable.push(
            makeColumn({
                field: 'functionReference',
                labelId: 'ValRef' + suffix,
                isNum: true,
            })
        );
        returnedTable.push(
            makeColumn({
                field: 'value',
                labelId: 'Delta' + suffix,
                isNum: true,
            })
        );

        if (nOrNkIndex === 1) {
            returnedTable.push(
                makeColumn({
                    field: 'functionReferenceAfter',
                    labelId: 'ValRef' + suffix1,
                    isNum: true,
                })
            );
            returnedTable.push(
                makeColumn({
                    field: 'valueAfter',
                    labelId: 'Delta' + suffix1,
                    isNum: true,
                })
            );
        }

        return returnedTable;
    }, [makeColumn, nOrNkIndex, sensiKind]);

    const rows = useMemo(() => makeRows(result), [result]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            sortable: true,
            resizable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const handleGridColumnsChanged = useCallback(
        (event: GridColumnsChangedEvent) => {
            if (event?.api) {
                setCsvHeaders(getColumnHeaderDisplayNames(event.api));
            }
        },
        [setCsvHeaders]
    );

    const handleRowDataUpdated = useCallback(
        (event: RowDataUpdatedEvent) => {
            if (event?.api) {
                setIsCsvButtonDisabled(event.api.getDisplayedRowCount() === 0);
            }
        },
        [setIsCsvButtonDisabled]
    );

    const handleGridReady = useCallback(
        (event: GridReadyEvent) => {
            if (event.api) {
                event.api.sizeColumnsToFit();
                setCsvHeaders(getColumnHeaderDisplayNames(event.api));
            }
        },
        [setCsvHeaders]
    );

    const message = getNoRowsMessage(messages, rows, sensitivityAnalysisStatus, !isLoading);

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING || isLoading,
        delay: RESULTS_LOADING_DELAY,
    });

    const rowsToShow = getRows(rows, sensitivityAnalysisStatus);
    return (
        <div style={{ position: 'relative', flexGrow: 1 }}>
            <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
            <CustomAGGrid
                ref={gridRef}
                rowData={rowsToShow}
                columnDefs={columnsDefs}
                defaultColDef={defaultColDef}
                onGridReady={handleGridReady}
                tooltipShowDelay={TOOLTIP_DELAY}
                overlayNoRowsTemplate={message}
                onGridColumnsChanged={handleGridColumnsChanged}
                onRowDataUpdated={handleRowDataUpdated}
                {...props}
            />
        </div>
    );
}

export default SensitivityAnalysisResult;
