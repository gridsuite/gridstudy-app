/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { Box, LinearProgress } from '@mui/material';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import React, { useCallback, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import {
    getNoRowsMessage,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import ComputingType from '../../computing-status/computing-type';
import { useAgGridLocalSort } from '../../../hooks/use-aggrid-local-sort';
import { SORT_WAYS } from '../../../hooks/use-aggrid-sort';
import { useAggridLocalRowFilter } from '../../../hooks/use-aggrid-local-row-filter';

import {
    StringTimeSeries,
    TimelineEventKeyType,
} from './types/dynamic-simulation-result.type';
import {
    dynamicSimulationResultInvalidations,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    transformTimeLinesData,
} from './utils/dynamic-simulation-result-utils';
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationResultTimeLine } from '../../../services/study/dynamic-simulation';

const styles = {
    loader: {
        height: '4px',
    },
    cell: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
        flex: 1,
        cursor: 'initial',
    },
};

const COL_TIME: TimelineEventKeyType = 'time';
const COL_MODEL_NAME: TimelineEventKeyType = 'modelName';
const COL_MESSAGE: TimelineEventKeyType = 'message';

const NumberCellRenderer = (cellData: ICellRendererParams) => {
    const value = cellData.value;
    return <Box sx={styles.cell}>{!isNaN(value) ? value.toFixed(2) : ''}</Box>;
};

type DynamicSimulationResultTimeLineProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
};

const DynamicSimulationResultTimeLine = ({
    studyUuid,
    nodeUuid,
}: DynamicSimulationResultTimeLineProps) => {
    const intl = useIntl();
    const gridRef = useRef(null);

    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResultTimeLine,
        dynamicSimulationResultInvalidations,
        null,
        (timeLines: StringTimeSeries[]) => ({
            timeLines: transformTimeLinesData(timeLines),
        })
    );

    const rowData = useMemo(() => result?.timeLines ?? [], [result]);

    const { onSortChanged, sortConfig } = useAgGridLocalSort(gridRef, {
        colKey: COL_TIME,
        sortWay: SORT_WAYS.asc,
    });

    const { updateFilter, filterSelector } = useAggridLocalRowFilter(gridRef, {
        [COL_TIME]: COL_TIME,
        [COL_MODEL_NAME]: COL_MODEL_NAME,
        [COL_MESSAGE]: COL_MESSAGE,
    });

    const sortAndFilterProps = useMemo(
        () => ({
            sortProps: {
                onSortChanged,
                sortConfig,
            },
            filterProps: {
                updateFilter,
                filterSelector,
            },
        }),
        [onSortChanged, sortConfig, updateFilter, filterSelector]
    );

    // columns are defined from fields in {@link TimelineEvent} types
    const columnDefs = useMemo(() => {
        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventTime',
                }),
                field: COL_TIME,
                width: MIN_COLUMN_WIDTH,
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.NUMBER,
                    filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                },
                cellRenderer: NumberCellRenderer,
                ...sortAndFilterProps,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventModelName',
                }),
                field: COL_MODEL_NAME,
                width: MEDIUM_COLUMN_WIDTH,
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [
                        FILTER_TEXT_COMPARATORS.STARTS_WITH,
                        FILTER_TEXT_COMPARATORS.CONTAINS,
                    ],
                },
                ...sortAndFilterProps,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimeLineEventModelMessage',
                }),
                field: COL_MESSAGE,
                width: LARGE_COLUMN_WIDTH,
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [
                        FILTER_TEXT_COMPARATORS.STARTS_WITH,
                        FILTER_TEXT_COMPARATORS.CONTAINS,
                    ],
                },
                ...sortAndFilterProps,
            }),
        ];
    }, [intl, sortAndFilterProps]);

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            suppressMovable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    // messages to show in aggrid
    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const messages = useIntlResultStatusMessages(intl);
    const overlayNoRowsTemplate = useMemo(
        () =>
            getNoRowsMessage(
                messages,
                rowData,
                dynamicSimulationStatus,
                !isLoading
            ),
        [messages, rowData, dynamicSimulationStatus, isLoading]
    );

    return (
        <>
            {isLoading && (
                <Box sx={styles.loader}>
                    <LinearProgress />
                </Box>
            )}
            <CustomAGGrid
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                overlayNoRowsTemplate={overlayNoRowsTemplate}
                enableCellTextSelection
            />
        </>
    );
};

export default DynamicSimulationResultTimeLine;
