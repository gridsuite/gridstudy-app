/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { Box, LinearProgress } from '@mui/material';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import React, { useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { ICellRendererParams } from 'ag-grid-community';
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

import { TimelineEventKeyType } from './types/dynamic-simulation-result.type';
import {
    dynamicSimulationResultInvalidations,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
} from './utils/dynamic-simulation-result-utils';
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationResultTimeline } from '../../../services/dynamic-simulation';

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
    return <Box sx={styles.cell}>{isNaN(value) ? '' : value.toFixed(2)}</Box>;
};

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true,
    lockPinned: true,
    suppressMovable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    cellRenderer: DefaultCellRenderer,
};

type DynamicSimulationResultTimelineProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
};

const DynamicSimulationResultTimeline = ({
    studyUuid,
    nodeUuid,
}: DynamicSimulationResultTimelineProps) => {
    const intl = useIntl();
    const gridRef = useRef(null);

    const [timelines, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResultTimeline,
        dynamicSimulationResultInvalidations
    );

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
    const columnDefs = useMemo(
        () => [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimelineEventTime',
                }),
                field: COL_TIME,
                width: MIN_COLUMN_WIDTH,
                numeric: true,
                fractionDigits: 2,
                filter: 'agNumberColumnFilter',
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.NUMBER,
                    filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                },
                cellRenderer: NumberCellRenderer,
                ...sortAndFilterProps,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimelineEventModelName',
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
                    id: 'DynamicSimulationTimelineEventModelMessage',
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
        ],
        [intl, sortAndFilterProps]
    );

    // messages to show when no data
    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const messages = useIntlResultStatusMessages(intl, true);
    const overlayMessage = useMemo(
        () =>
            getNoRowsMessage(
                messages,
                timelines,
                dynamicSimulationStatus,
                !isLoading
            ),
        [messages, timelines, dynamicSimulationStatus, isLoading]
    );

    const rowDataToShow = useMemo(
        () => (overlayMessage ? [] : timelines),
        [timelines, overlayMessage]
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
                rowData={rowDataToShow}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                overlayNoRowsTemplate={overlayMessage}
            />
        </>
    );
};

export default DynamicSimulationResultTimeline;
