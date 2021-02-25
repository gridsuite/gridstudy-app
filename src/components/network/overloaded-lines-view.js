/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { useIntl } from 'react-intl';
import { getNominalVoltageColor } from '../../utils/colors';
import VirtualizedTable from '../util/virtualized-table';
import TableCell from '@material-ui/core/TableCell';

import 'react-virtualized/styles.css';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    div: {
        height: '100%',
        width: '100%',
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
        opacity: '60%',
        '&:hover': {
            opacity: '100%',
        },
        pointerEvents: 'auto',
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
    const [linesLoaded, setLinesLoaded] = useState(false);
    const classes = useStyles();

    const intl = useIntl();
    const rowHeight = 30;
    useEffect(() => {
        const makeData = (line) => {
            let limits = [line.permanentLimit1, line.permanentLimit2];
            let intensities = [line.i1, line.i2];
            let loads = [line.p1, line.p2];

            let vl =
                props.network.getVoltageLevel(line.voltageLevelId1) ||
                props.network.getVoltageLevel(line.voltageLevelId2);
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
                        color:
                            '#' +
                            color
                                .map((c) => ('0' + c.toString(16)).slice(-2))
                                .join(''),
                    };
                }
            }
            return fields;
        };
        if (props.lines.getOrFetch(() => setLinesLoaded(true)) === undefined)
            setLinesLoaded(false);
        else
            setLines(
                props.lines
                    .getOrFetch(() => setLinesLoaded(true))
                    .map((line) => makeData(line))
                    .sort((a, b) => b.overload - a.overload)
            );
    }, [props.lines, props.network, props.lineFlowAlertThreshold, linesLoaded]);

    const filter = useCallback(
        (line) => line.overload > props.lineFlowAlertThreshold,
        [props.lineFlowAlertThreshold]
    );

    function MakeCell(label, color) {
        return (
            <TableCell
                component="div"
                className={clsx(classes.tableCell, classes.flexContainer)}
                variant="body"
                style={{
                    height: rowHeight,
                    color: color,
                }}
                align={'right'}
            >
                {label}
            </TableCell>
        );
    }

    function renderOverloadedLines() {
        return (
            <div className={classes.div}>
                <VirtualizedTable
                    height={Math.min(lines.length * rowHeight + 50, 400)}
                    className={classes.table}
                    rowCount={lines.length}
                    rowGetter={({ index }) => lines[index]}
                    rowStyle={{ alignItems: 'stretch' }}
                    rowHeight={rowHeight}
                    classes={{ tableRow: classes.rowCell }}
                    filter={filter}
                    columns={[
                        {
                            width: 150,
                            label: intl.formatMessage({ id: 'Name' }),
                            dataKey: 'name',
                            numeric: false,
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
                            width: 70,
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'Intensity' }),
                            dataKey: 'intensity',
                            numeric: true,
                            width: 70,
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'Limit' }),
                            dataKey: 'limit',
                            numeric: true,
                            width: 70,
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'Overload' }),
                            dataKey: 'overload',
                            numeric: true,
                            width: 90,
                            fractionDigits: 0,
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
    lines: [],
    lineFlowAlertThreshold: 100,
    network: null,
};

OverloadedLinesView.propTypes = {
    lines: PropTypes.object,
    lineFlowAlertThreshold: PropTypes.number,
    network: PropTypes.object,
};

export default OverloadedLinesView;
