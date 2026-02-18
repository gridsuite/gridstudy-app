/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { UUID } from 'node:crypto';
import { Box, LinearProgress } from '@mui/material';
import { memo, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { ComputingType, CustomAGGrid, DefaultCellRenderer, type MuiStyles } from '@gridsuite/commons-ui';
import { getNoRowsMessage, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { TimelineEventKeyType } from './types/dynamic-simulation-result.type';
import { LARGE_COLUMN_WIDTH, MEDIUM_COLUMN_WIDTH, MIN_COLUMN_WIDTH } from './utils/dynamic-simulation-result-utils';
import { NumberCellRenderer } from '../common/result-cell-renderers';
import { DYNAMIC_SIMULATION_RESULT_SORT_STORE, TIMELINE } from 'utils/store-sort-filter-fields';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { AgGridReact } from 'ag-grid-react';
import { TableType } from '../../../types/custom-aggrid-types';
import { dynamicSimulationResultInvalidations } from '../../computing-status/use-all-computing-status';
import { useNodeData } from 'components/use-node-data';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import { fetchDynamicSimulationResultTimeline } from '../../../services/study/dynamic-simulation';
import { updateComputationColumnsFilters } from '../common/update-computation-columns-filters';
import { useAgGridInitialColumnFilters } from '../common/use-ag-grid-initial-column-filters';

const styles = {
    loader: {
        height: '4px',
    },
} as const satisfies MuiStyles;

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
    currentRootNetworkUuid: UUID;
};

const DynamicSimulationResultTimeline = memo(
    ({ studyUuid, nodeUuid, currentRootNetworkUuid }: DynamicSimulationResultTimelineProps) => {
        const intl = useIntl();
        const gridRef = useRef<AgGridReact>(null);

        const { result: timelines, isLoading } = useNodeData({
            studyUuid,
            nodeUuid,
            rootNetworkUuid: currentRootNetworkUuid,
            fetcher: fetchDynamicSimulationResultTimeline,
            invalidations: dynamicSimulationResultInvalidations,
        });

        // columns are defined from fields in {@link TimelineEvent} types
        const columnDefs = useMemo(
            () => [
                makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({
                        id: 'DynamicSimulationTimelineEventTime',
                    }),
                    field: COL_TIME,
                    width: MIN_COLUMN_WIDTH,
                    colId: 'agNumberColumnFilter',
                    filter: 'agNumberColumnFilter',
                    context: {
                        numeric: true,
                        fractionDigits: 2,
                        filterComponent: CustomAggridComparatorFilter,
                        filterComponentParams: {
                            filterParams: {
                                type: TableType.DynamicSimulation,
                                tab: TIMELINE,
                                updateFilterCallback: updateComputationColumnsFilters,
                                dataType: FILTER_DATA_TYPES.NUMBER,
                                comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                            },
                        },
                        sortParams: {
                            table: DYNAMIC_SIMULATION_RESULT_SORT_STORE,
                            tab: TIMELINE,
                        },
                    },
                    cellRenderer: NumberCellRenderer,
                }),
                makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({
                        id: 'DynamicSimulationTimelineEventModelName',
                    }),
                    colId: COL_MODEL_NAME,
                    field: COL_MODEL_NAME,
                    width: MEDIUM_COLUMN_WIDTH,
                    context: {
                        filterComponent: CustomAggridComparatorFilter,
                        filterComponentParams: {
                            filterParams: {
                                type: TableType.DynamicSimulation,
                                tab: TIMELINE,
                                updateFilterCallback: updateComputationColumnsFilters,
                                dataType: FILTER_DATA_TYPES.TEXT,
                                comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                            },
                        },
                        sortParams: {
                            table: DYNAMIC_SIMULATION_RESULT_SORT_STORE,
                            tab: TIMELINE,
                        },
                    },
                }),
                makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({
                        id: 'DynamicSimulationTimelineEventModelMessage',
                    }),
                    colId: COL_MESSAGE,
                    field: COL_MESSAGE,
                    width: LARGE_COLUMN_WIDTH,
                    context: {
                        filterComponent: CustomAggridComparatorFilter,
                        filterComponentParams: {
                            filterParams: {
                                type: TableType.DynamicSimulation,
                                tab: TIMELINE,
                                updateFilterCallback: updateComputationColumnsFilters,
                                dataType: FILTER_DATA_TYPES.TEXT,
                                comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                            },
                        },
                        sortParams: {
                            table: DYNAMIC_SIMULATION_RESULT_SORT_STORE,
                            tab: TIMELINE,
                        },
                    },
                }),
            ],
            [intl]
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
        const onGridReady = useAgGridInitialColumnFilters(TableType.DynamicSimulation, TIMELINE);
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
                    onGridReady={onGridReady}
                    overlayNoRowsTemplate={overlayMessage}
                    overrideLocales={AGGRID_LOCALES}
                />
            </>
        );
    }
);

export default DynamicSimulationResultTimeline;
