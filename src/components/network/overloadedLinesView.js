/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { TableBody, TableCell, TableHead, Typography } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import { getNominalVoltageColor } from '../../utils/colors';

const OverloadedLinesView = (props) => {
    const [lines, setLines] = useState(null);

    useEffect(() => {
        // parse query parameter
        setLines(props.lines.map((line) => makeData(line)));
    }, [props.lines]);

    function makeData(line) {
        let limits = [line.permanentLimit1, line.permanentLimit2];
        let intensities = [line.i1, line.i2];
        let loads = [line.p1, line.p2];

        const color = getNominalVoltageColor(
            props.network.getVoltageLevel(line.voltageLevelId1)
                .nominalVoltage ||
                props.network.getVoltageLevel(line.voltageLevelId2)
        );

        let fields = { overload: 0 };
        for (let i = 0; i < 2; ++i) {
            if (
                limits[i] !== undefined &&
                intensities[i] !== undefined &&
                intensities[i] !== 0 && // we have enough data
                intensities[i] / limits[i] > fields.overload
            ) {
                fields = {
                    overload: intensities[i] / limits[i],
                    name: line.name,
                    intensity: intensities[i],
                    load: loads[i],
                    limit: limits[i],
                    // conversion [r,g,b] => #XXXXXX ; concat '0' to (color value) in hexadecimal keep last 2 characters
                    color:
                        '#' +
                        color
                            .map((c) =>
                                ('0' + Math.max(c, 0).toString(16)).slice(-2)
                            )
                            .join(''),
                };
            }
        }
        return fields;
    }

    function MakeHead(label) {
        return (
            <TableCell>
                <Typography>{label}</Typography>
            </TableCell>
        );
    }

    function MakeCell(label, color) {
        return (
            <TableCell>
                <Typography style={{ color: color }}>{label}</Typography>
            </TableCell>
        );
    }
    function MakeRawCell(label) {
        return <TableCell>{label}</TableCell>;
    }

    function row(fields) {
        return (
            <TableRow key={fields.name}>
                {MakeCell(fields.name, fields.color)}
                {MakeRawCell(fields.load)}
                {MakeRawCell(fields.intensity)}
                {MakeRawCell(fields.limit)}
                {MakeRawCell((fields.overload * 100).toFixed(1))}
            </TableRow>
        );
    }
    return (
        lines && (
            <Paper>
                <Table aria-sort="none" stickyHeader={true} size="small">
                    <TableHead>
                        <TableRow>
                            {MakeHead('name')}
                            {MakeHead('load')}
                            {MakeHead('intensity')}
                            {MakeHead('limit')}
                            {MakeHead('overload')}
                        </TableRow>
                    </TableHead>
                    <TableBody style={{ overflow: 'scroll' }}>
                        {lines
                            .filter(
                                (line) =>
                                    line.overload * 100 >
                                    props.lineFlowAlertThreshold
                            )
                            .map((line) => row(line))}
                    </TableBody>
                </Table>
            </Paper>
        )
    );
};

OverloadedLinesView.defaultProps = {
    lines: [],
    lineFlowAlertThreshold: 100,
    network: null,
};

OverloadedLinesView.propTypes = {
    lines: PropTypes.array,
    lineFlowAlertThreshold: PropTypes.number,
    network: PropTypes.object,
};

export default OverloadedLinesView;
