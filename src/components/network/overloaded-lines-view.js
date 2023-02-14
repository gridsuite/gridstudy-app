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
import VirtualizedTable from '../util/virtualized-table';
import TableCell from '@mui/material/TableCell';

import 'react-virtualized/styles.css';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import AlertInvalidNode from '../util/alert-invalid-node';
import Box from '@mui/material/Box';

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
    const [lines, setLines] = useState(null);
    const classes = useStyles();

    const intl = useIntl();
    useEffect(() => {
        if (props.disabled) return;
        const makeData = (line) => {
            let limits = [line.permanentLimit1, line.permanentLimit2];
            let intensities = [line.i1, line.i2];
            let loads = [line.p1, line.p2];

            let vl =
                props.mapEquipments.getVoltageLevel(line.voltageLevelId1) ||
                props.mapEquipments.getVoltageLevel(line.voltageLevelId2);
            const color = getNominalVoltageColor(vl.nominalVoltage);

            let fields = { overload: 0 };
            for (let i = 0; i < 2; ++i) {
                if (
                    limits[i] !== undefined &&
                    intensities[i] !== undefined &&
                    intensities[i] !== 0 && // we have enough data
                    (intensities[i] / limits[i]) * 100 > fields.overload
                ) {
                    fields = {
                        overload: ((intensities[i] / limits[i]) * 100).toFixed(
                            1
                        ),
                        name: line.name || line.id,
                        intensity: intensities[i],
                        load: loads[i],
                        limit: limits[i],
                        // conversion [r,g,b] => #XXXXXX ; concat '0' to (color value) in hexadecimal keep last 2 characters
                        //eslint-disable-next-line
                        color:
                            '#' +
                            color
                                .map((c) =>
                                    ('0' + Math.max(c, 0).toString(16)).slice(
                                        -2
                                    )
                                )
                                .join(''),
                    };
                }
            }
            return fields;
        };
        setLines(
            props.mapEquipments?.lines
                .map((line) => makeData(line))
                .filter((line) => line.overload > props.lineFlowAlertThreshold)
                .sort((a, b) => b.overload - a.overload)
        );
    }, [
        props.mapEquipments,
        props.mapEquipments?.lines,
        props.lineFlowAlertThreshold,
        props.disabled,
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
                    rows={props.disabled ? [] : lines}
                    rowStyle={{ alignItems: 'stretch' }}
                    rowHeight={ROW_HEIGHT}
                    classes={{ tableRow: classes.rowCell }}
                    sortable={true}
                    columns={[
                        {
                            width: 180,
                            label: intl.formatMessage({ id: 'Name' }),
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
                            label: intl.formatMessage({ id: 'Load' }),
                            dataKey: 'load',
                            numeric: true,
                            width: 120,
                            fractionDigits: 1,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            label: intl.formatMessage({ id: 'Intensity' }),
                            dataKey: 'intensity',
                            numeric: true,
                            width: 120,
                            headerRenderer: ({ label }) => MakeHead(label),
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'Limit' }),
                            dataKey: 'limit',
                            numeric: true,
                            width: 120,
                            fractionDigits: 1,
                            headerRenderer: ({ label }) => MakeHead(label),
                        },
                        {
                            label: intl.formatMessage({ id: 'Overload' }),
                            dataKey: 'overload',
                            numeric: true,
                            width: 90,
                            fractionDigits: 0,
                            headerRenderer: ({ label }) => MakeHead(label),
                            unit: '%',
                        },
                    ]}
                />
            </div>
        );
    }

    return lines && renderOverloadedLines();
};

OverloadedLinesView.defaultProps = {
    disabled: true,
    lineFlowAlertThreshold: 100,
    mapEquipments: {},
};

OverloadedLinesView.propTypes = {
    disabled: PropTypes.bool,
    lineFlowAlertThreshold: PropTypes.number,
    mapEquipments: PropTypes.object,
};

export default OverloadedLinesView;
