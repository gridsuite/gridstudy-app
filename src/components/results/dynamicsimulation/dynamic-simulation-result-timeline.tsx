/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { Box, LinearProgress } from '@mui/material';
import { memo, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import ComputingType from '../../computing-status/computing-type';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useAggridLocalRowFilter } from '../../../hooks/use-aggrid-local-row-filter';

import { TimelineEventKeyType } from './types/dynamic-simulation-result.type';
import {
    dynamicSimulationResultInvalidations,
    LARGE_COLUMN_WIDTH,
    MEDIUM_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
} from './utils/dynamic-simulation-result-utils';
import { fetchDynamicSimulationResultTimeline } from '../../../services/dynamic-simulation';
import { NumberCellRenderer } from '../common/result-cell-renderers';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FILTER,
    DYNAMIC_SIMULATION_RESULT_STORE_SORT,
    TIMELINE,
} from 'utils/store-sort-filter-fields';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { useNodeData } from '../common/use-node-data';

const styles = {
    loader: {
        height: '4px',
    },
};

const COL_TIME: TimelineEventKeyType = 'time';
const COL_MODEL_NAME: TimelineEventKeyType = 'modelName';
const COL_MESSAGE: TimelineEventKeyType = 'message';

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

const DynamicSimulationResultTimeline = memo(({ studyUuid, nodeUuid }: DynamicSimulationResultTimelineProps) => {
    const intl = useIntl();
    const gridRef = useRef(null);

    const [timelines, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResultTimeline,
        dynamicSimulationResultInvalidations
    );

    const { onSortChanged, sortConfig } = useAgGridSort(DYNAMIC_SIMULATION_RESULT_STORE_SORT, TIMELINE);
    const { updateFilter, filterSelector } = useAggridLocalRowFilter(
        gridRef,
        DYNAMIC_SIMULATION_RESULT_STORE_FILTER,
        TIMELINE
    );

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
                id: 'agNumberColumnFilter',
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
                id: COL_MODEL_NAME,
                field: COL_MODEL_NAME,
                width: MEDIUM_COLUMN_WIDTH,
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                },
                ...sortAndFilterProps,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({
                    id: 'DynamicSimulationTimelineEventModelMessage',
                }),
                id: COL_MESSAGE,
                field: COL_MESSAGE,
                width: LARGE_COLUMN_WIDTH,
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                },
                ...sortAndFilterProps,
            }),
        ],
        [intl, sortAndFilterProps]
    );

    // messages to show when no data
    const dynamicSimulationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const messages = useIntlResultStatusMessages(intl, true);
    const overlayMessage = useMemo(
        () => getNoRowsMessage(messages, timelines, dynamicSimulationStatus, !isLoading),
        [messages, timelines, dynamicSimulationStatus, isLoading]
    );

    const rowDataToShow = useMemo(() => (overlayMessage ? [] : timelines), [timelines, overlayMessage]);

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
});

export default DynamicSimulationResultTimeline;
