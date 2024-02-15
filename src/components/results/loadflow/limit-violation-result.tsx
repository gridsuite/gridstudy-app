/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';

import {
    FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT,
    getIdType,
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    makeData,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import {
    LimitTypes,
    LoadflowResultProps,
    OverloadedEquipment,
    OverloadedEquipmentFromBack,
} from './load-flow-result.type';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { Box } from '@mui/system';
import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { SORT_WAYS, useAgGridSort } from 'hooks/use-aggrid-sort';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import { fetchLimitViolations } from 'services/study/loadflow';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';

export const LimitViolationResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
    tabIndex,
    isWaiting,
}) => {
    const theme = useTheme();
    const intl = useIntl();

    const [overloadedEquipments, setOverloadedEquipments] = useState<
        OverloadedEquipment[]
    >([]);

    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const [isFetchComplete, setIsFetchComplete] = useState(false);

    const [isCurrentViolationReady, setIsCurrentViolationReady] =
        useState(false);
    const [isVoltageViolationReady, setIsVoltageViolationReady] =
        useState(false);
    const [isOverloadedEquipmentsReady, setIsOverloadedEquipmentsReady] =
        useState(false);

    const [hasFilter, setHasFilter] = useState<boolean>(false);
    const gridRef = useRef();

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: 'overload',
        sortWay: SORT_WAYS.desc,
    });

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT
    );

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(hasFilter, setHasFilter);

    //We give each tab its own loader so we don't have a loader spinning because another tab is still doing some work
    const openLoaderTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the loadflow begins
            loadFlowStatus === RunningStatus.RUNNING ||
            // We still want the loader to be displayed for the remaining time there is between "the loadflow is over"
            // and "the data is post processed and can be displayed"
            (!isOverloadedEquipmentsReady &&
                loadFlowStatus === RunningStatus.SUCCEED) ||
            isWaiting ||
            filterEnumsLoading,
        delay: RESULTS_LOADING_DELAY,
    });

    const { snackError } = useSnackMessage();

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            suppressMovable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const onRowDataUpdated = useCallback((params: any) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const loadFlowCurrentViolationsColumns = useMemo(() => {
        return loadFlowCurrentViolationsColumnsDefinition(
            intl,
            { onSortChanged, sortConfig },
            { updateFilter, filterSelector },
            filterEnums
        );
    }, [
        filterEnums,
        filterSelector,
        intl,
        onSortChanged,
        sortConfig,
        updateFilter,
    ]);

    const loadFlowVoltageViolationsColumns = useMemo(() => {
        return loadFlowVoltageViolationsColumnsDefinition(
            intl,
            { onSortChanged, sortConfig },
            { updateFilter, filterSelector },
            filterEnums
        );
    }, [
        filterEnums,
        filterSelector,
        intl,
        sortConfig,
        onSortChanged,
        updateFilter,
    ]);

    const messages = useIntlResultStatusMessages(intl);

    useEffect(() => {
        initFilters();
        if (initSort) {
            initSort(getIdType(tabIndex));
        }
    }, [tabIndex, onSortChanged, updateFilter, initFilters, initSort]);

    const fetchLimitViolationsByType = useCallback(() => {
        const limitTypeValues =
            tabIndex === 0
                ? [LimitTypes.CURRENT]
                : tabIndex === 1
                ? [LimitTypes.HIGH_VOLTAGE, LimitTypes.LOW_VOLTAGE]
                : [];
        const initialFilters = filterSelector || [];
        const existingFilterIndex = initialFilters.findIndex(
            (f) => f.column === 'limitType'
        );
        const updatedFilters =
            existingFilterIndex !== -1 || initialFilters.length !== 0
                ? initialFilters
                : [
                      ...initialFilters,
                      {
                          column: 'limitType',
                          dataType: FILTER_DATA_TYPES.TEXT,
                          type: FILTER_TEXT_COMPARATORS.EQUALS,
                          value: limitTypeValues,
                      },
                  ];

        return fetchLimitViolations(studyUuid, nodeUuid, {
            sort: {
                colKey: FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT[
                    sortConfig.colKey
                ],
                sortWay: sortConfig.sortWay,
            },
            filters: updatedFilters,
        });
    }, [studyUuid, nodeUuid, tabIndex, sortConfig, filterSelector]);

    useEffect(() => {
        if (result) {
            fetchLimitViolationsByType()
                .then((overloadedEquipments: OverloadedEquipmentFromBack[]) => {
                    setIsOverloadedEquipmentsReady(true);
                    const sortedLines = overloadedEquipments.map(
                        (overloadedEquipment) =>
                            makeData(overloadedEquipment, intl)
                    );
                    setOverloadedEquipments(sortedLines);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'ErrFetchViolationsMsg',
                    });
                })
                .finally(() => {
                    setIsOverloadedEquipmentsReady(true);
                    setIsFetchComplete(true);
                });
        }
    }, [
        studyUuid,
        nodeUuid,
        intl,
        result,
        sortConfig,
        filterSelector,
        snackError,
        initFilters,
        initSort,
        fetchLimitViolationsByType,
    ]);

    const getRowStyle = useCallback(
        (params: RowClassParams) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    useEffect(() => {
        //To avoid the rapid flashing of "no rows" before we actually show the rows
        if (overloadedEquipments && isFetchComplete) {
            setIsCurrentViolationReady(true);
        }
    }, [overloadedEquipments, isFetchComplete]);

    const renderLoadFlowCurrentViolations = () => {
        const message = getNoRowsMessage(
            messages,
            overloadedEquipments,
            loadFlowStatus,
            isCurrentViolationReady
        );
        const rowsToShow = getRows(overloadedEquipments, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderTab && <LinearProgress />}
                </Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={loadFlowCurrentViolationsColumns}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsCurrentViolations',
                    })}
                    rows={rowsToShow}
                    onRowDataUpdated={onRowDataUpdated}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                    enableCellTextSelection={true}
                    skipColumnHeaders={false}
                />
            </>
        );
    };

    useEffect(() => {
        //To avoid the rapid flashing of "no rows" before we actually show the rows
        if (overloadedEquipments && isFetchComplete) {
            setIsVoltageViolationReady(true);
        }
    }, [overloadedEquipments, isFetchComplete]);

    useEffect(() => {
        //reset everything at initial state
        if (
            loadFlowStatus === RunningStatus.FAILED ||
            loadFlowStatus === RunningStatus.IDLE
        ) {
            setIsOverloadedEquipmentsReady(false);
            setIsVoltageViolationReady(false);
            setIsFetchComplete(false);
            setIsCurrentViolationReady(false);
        }
    }, [loadFlowStatus]);

    const renderLoadFlowVoltageViolations = () => {
        const message = getNoRowsMessage(
            messages,
            overloadedEquipments,
            loadFlowStatus,
            isVoltageViolationReady
        );

        const rowsToShow = getRows(overloadedEquipments, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderTab && <LinearProgress />}
                </Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={loadFlowVoltageViolationsColumns}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsCurrentViolations',
                    })}
                    rows={rowsToShow}
                    onRowDataUpdated={onRowDataUpdated}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                    enableCellTextSelection={true}
                    skipColumnHeaders={false}
                />
            </>
        );
    };

    return (
        <>
            {tabIndex === 0 && renderLoadFlowCurrentViolations()}
            {tabIndex === 1 && renderLoadFlowVoltageViolations()}
        </>
    );
};
