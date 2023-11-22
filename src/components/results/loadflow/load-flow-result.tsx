/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import {
    GridReadyEvent,
    ICellRendererParams,
    RowClassParams,
} from 'ag-grid-community';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';

import {
    loadFlowCurrentViolationsColumnsDefinition,
    loadFlowResultColumnsDefinition,
    loadFlowVoltageViolationsColumnsDefinition,
    makeData,
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
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { fetchLimitViolations } from '../../../services/study';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { Box } from '@mui/system';
import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { REPORT_TYPES } from '../../utils/reportType';

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
    tabIndex,
    isWaiting,
}) => {
    const styles = {
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    };
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

    //We give each tab its own loader so we don't have a loader spinning because another tab is still doing some work
    const openLoaderCurrentTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the loadflow begins
            loadFlowStatus === RunningStatus.RUNNING ||
            // We still want the loader to be displayed for the remaining time there is between "the loadflow is over"
            // and "the data is post processed and can be displayed"
            (!isOverloadedEquipmentsReady &&
                loadFlowStatus === RunningStatus.SUCCEED) ||
            isWaiting,
        delay: RESULTS_LOADING_DELAY,
    });

    const openLoaderVoltageTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the loadflow begins
            loadFlowStatus === RunningStatus.RUNNING ||
            // We still want the loader to be displayed for the remaining time there is between "the loadflow is over"
            // and "the data is post processed and can be displayed"
            (!isOverloadedEquipmentsReady &&
                loadFlowStatus === RunningStatus.SUCCEED) ||
            isWaiting,
        delay: RESULTS_LOADING_DELAY,
    });

    const openLoaderStatusTab = useOpenLoaderShortWait({
        isLoading: loadFlowStatus === RunningStatus.RUNNING || isWaiting,
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

    const loadFlowCurrentViolationsColumns = useMemo(() => {
        return loadFlowCurrentViolationsColumnsDefinition(intl);
    }, [intl]);

    const loadFlowVoltageViolationsColumns = useMemo(() => {
        return loadFlowVoltageViolationsColumnsDefinition(intl);
    }, [intl]);

    const StatusCellRender = useCallback(
        (cellData: ICellRendererParams) => {
            const status = cellData.value;
            const color = status === 'CONVERGED' ? styles.succeed : styles.fail;
            return (
                <Box sx={styles.cell}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Lens fontSize={'medium'} sx={color} />
                        <span style={{ marginLeft: '4px' }}>{status}</span>
                    </div>
                </Box>
            );
        },
        [styles.cell, styles.fail, styles.succeed]
    );

    const NumberRenderer = useCallback(
        (cellData: ICellRendererParams) => {
            const value = cellData.value;
            return (
                <Box sx={styles.cell}>
                    {!isNaN(value) ? value.toFixed(1) : ''}
                </Box>
            );
        },
        [styles.cell]
    );

    const loadFlowResultColumns = useMemo(() => {
        return loadFlowResultColumnsDefinition(
            intl,
            StatusCellRender,
            NumberRenderer
        );
    }, [intl, NumberRenderer, StatusCellRender]);

    const messages = useIntlResultStatusMessages(intl);

    useEffect(() => {
        if (result) {
            fetchLimitViolations(studyUuid, nodeUuid)
                .then((overloadedEquipments: OverloadedEquipmentFromBack[]) => {
                    setIsOverloadedEquipmentsReady(true);
                    const sortedLines = overloadedEquipments
                        .map((overloadedEquipment) =>
                            makeData(overloadedEquipment, intl)
                        )
                        .sort((a, b) => b.overload - a.overload);
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
    }, [studyUuid, nodeUuid, intl, result, snackError]);

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

    const currentViolations = overloadedEquipments.filter(
        (overloadedEquipment) =>
            overloadedEquipment.limitType === LimitTypes.CURRENT
    );

    useEffect(() => {
        //To avoid the rapid flashing of "no rows" before we actually show the rows
        if (currentViolations && isFetchComplete) {
            setIsCurrentViolationReady(true);
        }
    }, [currentViolations, isFetchComplete]);

    const renderLoadFlowCurrentViolations = () => {
        const message = getNoRowsMessage(
            messages,
            currentViolations,
            loadFlowStatus,
            isCurrentViolationReady
        );
        const rowsToShow = getRows(currentViolations, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderCurrentTab && <LinearProgress />}
                </Box>
                <CustomAGGrid
                    rowData={rowsToShow}
                    defaultColDef={defaultColDef}
                    enableCellTextSelection={true}
                    columnDefs={loadFlowCurrentViolationsColumns}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                />
            </>
        );
    };

    const voltageViolations = overloadedEquipments.filter(
        (overloadedEquipment) =>
            overloadedEquipment.limitType === LimitTypes.HIGH_VOLTAGE ||
            overloadedEquipment.limitType === LimitTypes.LOW_VOLTAGE
    );

    useEffect(() => {
        //To avoid the rapid flashing of "no rows" before we actually show the rows
        if (voltageViolations && isFetchComplete) {
            setIsVoltageViolationReady(true);
        }
    }, [voltageViolations, isFetchComplete]);

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
            voltageViolations,
            loadFlowStatus,
            isVoltageViolationReady
        );

        const rowsToShow = getRows(voltageViolations, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderVoltageTab && <LinearProgress />}
                </Box>
                <CustomAGGrid
                    rowData={rowsToShow}
                    defaultColDef={defaultColDef}
                    enableCellTextSelection={true}
                    columnDefs={loadFlowVoltageViolationsColumns}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                />
            </>
        );
    };

    const renderLoadFlowResult = () => {
        const message = getNoRowsMessage(
            messages,
            result?.componentResults,
            loadFlowStatus,
            result?.componentResults ? true : false
        );

        const rowsToShow = getRows(result?.componentResults, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderStatusTab && <LinearProgress />}
                </Box>
                <CustomAGGrid
                    rowData={rowsToShow}
                    columnDefs={loadFlowResultColumns}
                    defaultColDef={defaultColDef}
                    enableCellTextSelection={true}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                />
            </>
        );
    };

    const renderLoadFlowReport = () => {
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderCurrentTab && <LinearProgress />}
                </Box>
                {loadFlowStatus === RunningStatus.SUCCEED && (
                    <ComputationReportViewer
                        reportType={REPORT_TYPES.LOADFLOW}
                    />
                )}
            </>
        );
    };

    return (
        <>
            {tabIndex === 0 && renderLoadFlowCurrentViolations()}
            {tabIndex === 1 && renderLoadFlowVoltageViolations()}
            {tabIndex === 2 && renderLoadFlowResult()}
            {tabIndex === 3 && renderLoadFlowReport()}
        </>
    );
};
