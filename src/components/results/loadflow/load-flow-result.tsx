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
import { useTheme } from '@mui/styles';
import { Lens } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { green, red } from '@mui/material/colors';
import {
    GridReadyEvent,
    ICellRendererParams,
    RowClassParams,
} from 'ag-grid-community';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { PARAM_LIMIT_REDUCTION } from '../../../utils/config-params';
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

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
    tabIndex,
}) => {
    const useStyles = makeStyles(() => ({
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
    }));
    const classes = useStyles();
    const theme = useTheme();
    const intl = useIntl();

    const [overloadedEquipments, setOverloadedEquipments] = useState<
        OverloadedEquipment[]
    >([]);

    const limitReductionParam = useSelector((state: ReduxState) =>
        Number(state[PARAM_LIMIT_REDUCTION])
    );
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );
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
            const color =
                status === 'CONVERGED' ? classes.succeed : classes.fail;
            return (
                <div className={classes.cell}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Lens fontSize={'medium'} className={color} />
                        <span style={{ marginLeft: '4px' }}>{status}</span>
                    </div>
                </div>
            );
        },
        [classes.cell, classes.fail, classes.succeed]
    );

    const NumberRenderer = useCallback(
        (cellData: ICellRendererParams) => {
            const value = cellData.value;
            return (
                <div className={classes.cell}>
                    {!isNaN(value) ? value.toFixed(1) : ''}
                </div>
            );
        },
        [classes.cell]
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
            fetchLimitViolations(
                studyUuid,
                nodeUuid,
                limitReductionParam / 100.0
            )
                .then((overloadedEquipments: OverloadedEquipmentFromBack[]) => {
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
                });
        }
    }, [studyUuid, nodeUuid, intl, limitReductionParam, result, snackError]);

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

    const renderLoadFlowCurrentViolations = () => {
        const message = getNoRowsMessage(
            messages,
            currentViolations,
            loadFlowStatus
        );
        const rowsToShow = getRows(currentViolations, loadFlowStatus);
        return (
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                enableCellTextSelection={true}
                columnDefs={loadFlowCurrentViolationsColumns}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                overlayNoRowsTemplate={message}
            />
        );
    };

    const voltageViolations = overloadedEquipments.filter(
        (overloadedEquipment) =>
            overloadedEquipment.limitType === LimitTypes.HIGH_VOLTAGE ||
            overloadedEquipment.limitType === LimitTypes.LOW_VOLTAGE
    );
    const renderLoadFlowVoltageViolations = () => {
        const message = getNoRowsMessage(
            messages,
            voltageViolations,
            loadFlowStatus
        );

        const rowsToShow = getRows(voltageViolations, loadFlowStatus);
        return (
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                enableCellTextSelection={true}
                columnDefs={loadFlowVoltageViolationsColumns}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                overlayNoRowsTemplate={message}
            />
        );
    };

    const renderLoadFlowResult = () => {
        const message = getNoRowsMessage(
            messages,
            result?.componentResults,
            loadFlowStatus
        );

        const rowsToShow = getRows(result?.componentResults, loadFlowStatus);
        return (
            <CustomAGGrid
                rowData={rowsToShow}
                columnDefs={loadFlowResultColumns}
                defaultColDef={defaultColDef}
                enableCellTextSelection={true}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                overlayNoRowsTemplate={message}
            />
        );
    };
    return (
        <>
            {tabIndex === 0 && renderLoadFlowCurrentViolations()}
            {tabIndex === 1 && renderLoadFlowVoltageViolations()}
            {tabIndex === 2 && renderLoadFlowResult()}
        </>
    );
};
