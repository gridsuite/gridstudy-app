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
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationResultTimeline } from '../../../services/dynamic-simulation';
import { NumberCellRenderer } from '../common/result-cell-renderers';
import { setDynamicSimulationResultFilter } from 'redux/actions';
import {
    DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
    DYNAMIC_SIMULATION_RESULT_SORT_STORE,
    TIMELINE,
} from 'utils/store-sort-filter-fields';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';

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

    const { onSortChanged, sortConfig } = useAgGridSort(DYNAMIC_SIMULATION_RESULT_SORT_STORE, TIMELINE);

    const { updateFilter, filterSelector } = useAggridLocalRowFilter(gridRef, {
        filterType: DYNAMIC_SIMULATION_RESULT_STORE_FIELD,
        filterTab: TIMELINE,
        // @ts-expect-error TODO: found how to have Action type in props type
        filterStoreAction: setDynamicSimulationResultFilter,
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
                colId: 'agNumberColumnFilter',
                filter: 'agNumberColumnFilter',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    filterComponent: CustomAggridComparatorFilter,
                    filterComponentParams: {
                        filterParams: {
                            ...sortAndFilterProps.filterProps,
                            filterDataType: FILTER_DATA_TYPES.NUMBER,
                            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        },
                    },
                    sortProps: {
                        ...sortAndFilterProps.sortProps,
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
                            ...sortAndFilterProps.filterProps,
                            filterDataType: FILTER_DATA_TYPES.TEXT,
                            filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        },
                    },
                    sortProps: {
                        ...sortAndFilterProps.sortProps,
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
                            ...sortAndFilterProps.filterProps,
                            filterDataType: FILTER_DATA_TYPES.TEXT,
                            filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        },
                    },
                    sortProps: {
                        ...sortAndFilterProps.sortProps,
                    },
                },
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
