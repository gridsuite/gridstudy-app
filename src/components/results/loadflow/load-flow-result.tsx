import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
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
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { PARAM_LIMIT_REDUCTION } from '../../../utils/config-params';
import { ComputingType } from '../../computing-status/computing-type';
//import { useSnackMessage } from '@gridsuite/commons-ui/lib';
import { ReduxState } from '../../../redux/reducer.type';
import { fetchLimitViolations } from '../../../utils/rest-api';
import { convertDuration, makeData } from './load-flow-result-utils';
import {
    GridReadyEvent,
    ICellRendererParams,
    RowClassParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { GridStudyTheme } from '../../app-wrapper.type';
import { useTheme } from '@mui/styles';
import { Lens } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { green, red } from '@mui/material/colors';

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
    tabIndex,
}) => {
    const useStyles = makeStyles<GridStudyTheme>((theme) => ({
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

    const intl = useIntl();
    const [overloadedEquipments, setOverloadedEquipments] = useState<
        OverloadedEquipment[]
    >([]);
    const theme: GridStudyTheme = useTheme();

    const limitReductionParam = useSelector((state: ReduxState) =>
        Number(state[PARAM_LIMIT_REDUCTION])
    );
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );
    // const { snackError } = useSnackMessage();
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
        return [
            {
                headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
                field: 'name',
            },
            {
                headerName: intl.formatMessage({
                    id: 'LimitNameCurrentViolation',
                }),
                field: 'limitName',
            },
            {
                headerName: intl.formatMessage({ id: 'LimitSide' }),
                field: 'side',
            },
            {
                headerName: intl.formatMessage({
                    id: 'LimitAcceptableDuration',
                }),
                field: 'acceptableDuration',
                valueFormatter: (value: ValueFormatterParams) =>
                    convertDuration(value.data.acceptableDuration),
            },
            {
                headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
                field: 'limit',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
                field: 'value',
                numeric: true,
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'overload',
                numeric: true,
                fractionDigits: 0,
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value.toFixed(1),
            },
        ];
    }, [intl]);
    const formatLimitType = useCallback(
        (limitType: string) => {
            return limitType in LimitTypes
                ? intl.formatMessage({ id: limitType })
                : limitType;
        },
        [intl]
    );
    const loadFlowVoltageViolationsColumns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'VoltageLevel' }),
                field: 'name',
            },
            {
                headerName: intl.formatMessage({ id: 'Violation' }),
                field: 'limitType',
                valueFormatter: (params: ValueFormatterParams) =>
                    formatLimitType(params.value),
            },
            {
                headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
                field: 'limit',
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
                field: 'value',
                numeric: true,
                valueFormatter: (params: ValueFormatterParams) =>
                    params.value.toFixed(1),
            },
        ];
    }, [intl, formatLimitType]);
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
            //const value = cellData.data[cellData.colDef.field];
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
        return [
            {
                headerName: intl.formatMessage({
                    id: 'connectedComponentNum',
                }),
                field: 'connectedComponentNum',
            },
            {
                headerName: intl.formatMessage({
                    id: 'synchronousComponentNum',
                }),
                field: 'synchronousComponentNum',
            },
            {
                headerName: intl.formatMessage({ id: 'status' }),
                field: 'status',
                cellRenderer: StatusCellRender,
            },
            {
                headerName: intl.formatMessage({
                    id: 'iterationCount',
                }),
                field: 'iterationCount',
            },
            {
                headerName: intl.formatMessage({
                    id: 'slackBusId',
                }),
                field: 'slackBusId',
            },
            {
                headerName: intl.formatMessage({
                    id: 'slackBusActivePowerMismatch',
                }),
                field: 'slackBusActivePowerMismatch',
                cellRenderer: NumberRenderer,
            },
        ];
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
                    //todo : add this
                    /*  snackError({
                        messageTxt: error.message,
                        headerId: 'ErrFetchViolationsMsg',
                    });*/
                });
        }
    }, [studyUuid, nodeUuid, intl, limitReductionParam, result]);

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

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
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
        console.log('rowsToShow: ', rowsToShow);
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

    const voltageViolations = overloadedEquipments?.filter(
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
            result.componentResults,
            loadFlowStatus
        );

        const rowsToShow = getRows(result.componentResults, loadFlowStatus);
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
