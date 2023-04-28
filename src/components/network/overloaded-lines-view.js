/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from 'react-intl';
import { getNominalVoltageColor } from '../../utils/colors';
import VirtualizedTable from '../utils/virtualized-table';
import TableCell from '@mui/material/TableCell';

import 'react-virtualized/styles.css';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import AlertInvalidNode from '../utils/alert-invalid-node';
import Box from '@mui/material/Box';
import { fetchOverloadedLines } from '../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const ROW_HEIGHT = 30;
export const HEADER_ROW_HEIGHT = 48;
export const MAX_TABLE_HEIGHT = 400;

const useStyles = makeStyles((theme) => ({
    div: {
        opacity: '60%',
        '&:hover': {
            opacity: '100%',
        },
        height: 'inherit',
    },
    rowCell: {
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        height: '100%',
        verticalAlign: 'center',
        '&:hover': {
            opacity: '100%',
        },
        top: '50%',
        flex: 1,
        pointerEvents: 'auto',
    },
    table: {
        pointerEvents: 'auto',
        maxHeight: MAX_TABLE_HEIGHT + 'px',
        '& .ReactVirtualized__Table__Grid': {
            height: 'fit-content !important',
            maxHeight: MAX_TABLE_HEIGHT + 'px',
        },
    },
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        pointerEvents: 'none',
    },
}));

const OverloadedLinesView = (props) => {
    const [overloadedLines, setOverloadedLines] = useState(null);
    const classes = useStyles();
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    useEffect(() => {
        const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;
        const PERMANENT_LIMIT_NAME = 'permanent';
        if (props.disabled) {
            return;
        }
        const convertDuration = (acceptableDuration) => {
            if (acceptableDuration === UNDEFINED_ACCEPTABLE_DURATION) {
                return undefined;
            }
            // if modulo 60 convert into minutes, otherwise we still use seconds (600 -> 10' and 700 -> 700")
            if (acceptableDuration % 60 === 0) {
                return acceptableDuration / 60 + "'";
            } else {
                return acceptableDuration + '"';
            }
        };
        const convertSide = (side) => {
            return side === 'ONE' ? 1 : side === 'TWO' ? 2 : undefined;
        };
        const convertLimitName = (limitName) => {
            return limitName === PERMANENT_LIMIT_NAME
                ? intl.formatMessage({ id: 'PermanentLimitName' })
                : limitName;
        };
        const makeData = (overloadedLine) => {
            const line = props.mapEquipments.getLine(overloadedLine.subjectId);
            const vl =
                props.mapEquipments.getVoltageLevel(line?.voltageLevelId1) ||
                props.mapEquipments.getVoltageLevel(line?.voltageLevelId2);
            const lineColor = getNominalVoltageColor(vl?.nominalVoltage);
            return {
                overload: (
                    (overloadedLine.value / overloadedLine.limit) *
                    100
                ).toFixed(1),
                name: overloadedLine.subjectId,
                intensity: overloadedLine.value,
                acceptableDuration: convertDuration(
                    overloadedLine.acceptableDuration
                ),
                limit: overloadedLine.limit,
                limitName: convertLimitName(overloadedLine.limitName),
                side: convertSide(overloadedLine.side),
                // conversion [r,g,b] => #XXXXXX ; concat '0' to (color value) in hexadecimal keep last 2 characters
                //eslint-disable-next-line
                color:
                    '#' +
                    lineColor
                        .map((c) =>
                            ('0' + Math.max(c, 0).toString(16)).slice(-2)
                        )
                        .join(''),
            };
        };
        fetchOverloadedLines(
            props.studyUuid,
            props.currentNode?.id,
            props.lineFlowAlertThreshold / 100.0
        )
            .then((overloadedLines) => {
                const sortedLines = overloadedLines
                    .map((overloadedLine) => makeData(overloadedLine))
                    .sort((a, b) => b.overload - a.overload);
                setOverloadedLines(sortedLines);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ErrFetchOverloadedLinesMsg',
                });
            });
    }, [
        props.studyUuid,
        props.currentNode?.id,
        props.lineFlowAlertThreshold,
        props.disabled,
        props.mapEquipments,
        intl,
        snackError,
    ]);

    function MakeCell(label, color) {
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer)}
                variant="body"
                style={{
                    height: ROW_HEIGHT,
                    color: color,
                }}
                align={'right'}
            >
                {label}
            </TableCell>
        );
    }

    function MakeHead(label) {
        return (
            <TableCell
                variant={'head'}
                className={clsx(classes.tableCell, classes.flexContainer)}
            >
                {label}
            </TableCell>
        );
    }

    function renderOverloadedLines() {
        return (
            <div className={classes.div}>
                {props.disabled && (
                    <Box
                        position="absolute"
                        left={0}
                        right={0}
                        top={HEADER_ROW_HEIGHT}
                    >
                        <AlertInvalidNode noMargin={true} />
                    </Box>
                )}
                <VirtualizedTable
                    className={classes.table}
                    rows={props.disabled ? [] : overloadedLines}
                    rowStyle={{ alignItems: 'stretch' }}
                    rowHeight={ROW_HEIGHT}
                    classes={{ tableRow: classes.rowCell }}
                    sortable={true}
                    columns={[
                        {
                            width: 180,
                            label: intl.formatMessage({ id: 'OverloadedLine' }),
                            dataKey: 'name',
                            numeric: false,
                            headerRenderer: ({ label }) => MakeHead(label),
                            cellRenderer: (cellData) =>
                                MakeCell(
                                    cellData.rowData.name,
                                    cellData.rowData.color
                                ),
                        },
                        {
                            width: 90,
                            label: intl.formatMessage({ id: 'LimitName' }),
                            dataKey: 'limitName',
                            numeric: false,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            width: 70,
                            label: intl.formatMessage({ id: 'LimitSide' }),
                            dataKey: 'side',
                            numeric: true,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            label: intl.formatMessage({
                                id: 'LimitAcceptableDuration',
                            }),
                            dataKey: 'acceptableDuration',
                            numeric: false,
                            width: 90,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            label: intl.formatMessage({ id: 'Limit' }),
                            dataKey: 'limit',
                            numeric: true,
                            width: 100,
                            fractionDigits: 1,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            label: intl.formatMessage({ id: 'Intensity' }),
                            dataKey: 'intensity',
                            numeric: true,
                            width: 100,
                            headerRenderer: ({ label }) => MakeHead(label),
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'LineLoad' }),
                            dataKey: 'overload',
                            numeric: true,
                            width: 110,
                            fractionDigits: 0,
                            headerRenderer: ({ label }) => MakeHead(label),
                            unit: '%',
                        },
                    ]}
                />
            </div>
        );
    }

    return overloadedLines && renderOverloadedLines();
};

OverloadedLinesView.defaultProps = {
    disabled: true,
    lineFlowAlertThreshold: 100,
    mapEquipments: {},
};

OverloadedLinesView.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    disabled: PropTypes.bool,
    lineFlowAlertThreshold: PropTypes.number,
    mapEquipments: PropTypes.object,
};

export default OverloadedLinesView;
