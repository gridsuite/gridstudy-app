/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl/lib';
import { useSelector } from 'react-redux';
import { PARAM_LIMIT_REDUCTION } from '../utils/config-params';
import { CustomAGGrid } from './custom-aggrid/custom-aggrid';
import { useTheme } from '@mui/material';
import { ComputingType } from './computing-status/computing-type';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from './utils/aggrid-rows-handler';
import { fetchLimitViolations } from '../services/study';
import { Box } from '@mui/system';

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

const LIMIT_TYPES = {
    HIGH_VOLTAGE: 'HIGH_VOLTAGE',
    LOW_VOLTAGE: 'LOW_VOLTAGE',
    CURRENT: 'CURRENT',
};
const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;

const convertDuration = (duration) => {
    if (!duration) {
        return null;
    }

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    if (seconds === 0) {
        return minutes + "'";
    }

    if (minutes === 0) {
        return seconds + '"';
    }
    return minutes + "' " + seconds + '"';
};

const LoadFlowResult = ({ result, studyUuid, nodeUuid }) => {
    const intl = useIntl();
    const theme = useTheme();
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(0);
    const [overloadedEquipments, setOverloadedEquipments] = useState(null);

    const limitReductionParam = useSelector((state) =>
        Number(state[PARAM_LIMIT_REDUCTION])
    );
    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );
    const messages = useIntlResultStatusMessages(intl);

    useEffect(() => {
        const PERMANENT_LIMIT_NAME = 'permanent';
        const convertSide = (side) => {
            return side === 'ONE'
                ? intl.formatMessage({ id: 'Side1' })
                : side === 'TWO'
                ? intl.formatMessage({ id: 'Side2' })
                : undefined;
        };
        const convertLimitName = (limitName) => {
            return limitName === PERMANENT_LIMIT_NAME
                ? intl.formatMessage({ id: 'PermanentLimitName' })
                : limitName;
        };
        const makeData = (overloadedEquipment) => {
            return {
                overload:
                    (overloadedEquipment.value / overloadedEquipment.limit) *
                    100,
                name: overloadedEquipment.subjectId,
                value: overloadedEquipment.value,
                acceptableDuration:
                    overloadedEquipment.acceptableDuration ===
                    UNDEFINED_ACCEPTABLE_DURATION
                        ? null
                        : overloadedEquipment.acceptableDuration,
                limit: overloadedEquipment.limit,
                limitName: convertLimitName(overloadedEquipment.limitName),
                side: convertSide(overloadedEquipment.side),
                limitType: overloadedEquipment.limitType,
            };
        };
        if (result) {
            fetchLimitViolations(
                studyUuid,
                nodeUuid,
                limitReductionParam / 100.0
            )
                .then((overloadedEquipments) => {
                    const sortedLines = overloadedEquipments
                        .map((overloadedEquipment) =>
                            makeData(overloadedEquipment)
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
    }, [studyUuid, nodeUuid, intl, snackError, limitReductionParam, result]);

    const NumberRenderer = useCallback((cellData) => {
        const value = cellData.data[cellData.colDef.field];
        return (
            <Box sx={styles.cell}>{!isNaN(value) ? value.toFixed(1) : ''}</Box>
        );
    }, []);

    const StatusCellRender = useCallback((cellData) => {
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
    }, []);

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
                valueFormatter: (value) =>
                    convertDuration(value.data.acceptableDuration),
            },
            {
                headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
                field: 'limit',
                valueFormatter: (params) => params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
                field: 'value',
                numeric: true,
                valueFormatter: (params) => params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'overload',
                numeric: true,
                fractionDigits: 0,
                valueFormatter: (params) => params.value.toFixed(1),
            },
        ];
    }, [intl]);

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

    const formatLimitType = useCallback(
        (limitType) => {
            return limitType in LIMIT_TYPES
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
                valueFormatter: (params) => formatLimitType(params.value),
            },
            {
                headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
                field: 'limit',
                valueFormatter: (params) => params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
                field: 'value',
                numeric: true,
                valueFormatter: (params) => params.value.toFixed(1),
            },
        ];
    }, [intl, formatLimitType]);

    function renderLoadFlowResult() {
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
    }
    const onGridReady = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);
    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const currentViolations = overloadedEquipments?.filter(
        (overloadedEquipment) =>
            overloadedEquipment.limitType === LIMIT_TYPES.CURRENT
    );
    const voltageViolations = overloadedEquipments?.filter(
        (overloadedEquipment) =>
            overloadedEquipment.limitType === LIMIT_TYPES.HIGH_VOLTAGE ||
            overloadedEquipment.limitType === LIMIT_TYPES.LOW_VOLTAGE
    );
    function renderLoadFlowCurrentViolations() {
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
    }
    function renderLoadFlowVoltageViolations() {
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
    }
    function renderLoadFlowResultTabs() {
        return (
            <>
                <div>
                    <Tabs
                        value={tabIndex}
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
                    >
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsCurrentViolations'}
                                />
                            }
                        />
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsVoltageViolations'}
                                />
                            }
                        />
                        <Tab
                            label={
                                <FormattedMessage
                                    id={'LoadFlowResultsStatus'}
                                />
                            }
                        />
                    </Tabs>
                </div>
                {tabIndex === 0 && renderLoadFlowCurrentViolations()}
                {tabIndex === 1 && renderLoadFlowVoltageViolations()}
                {tabIndex === 2 && renderLoadFlowResult()}
            </>
        );
    }

    return renderLoadFlowResultTabs();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
