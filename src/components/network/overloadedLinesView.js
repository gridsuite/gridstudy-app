/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import {
    TableBody,
    TableCell,
    TableHead,
    TableSortLabel,
    Typography,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles((theme) => ({}));

const OverloadedLinesView = (props) => {
    const classes = useStyles();

    function MakeHead(label) {
        return (
            <TableCell>
                <TableSortLabel>
                    <Typography>{label}</Typography>
                </TableSortLabel>
            </TableCell>
        );
    }

    function MakeCell(label) {
        return (
            <TableCell>
                <Typography>{label}</Typography>
            </TableCell>
        );
    }
    function MakeRawCell(label) {
        return <TableCell>{label}</TableCell>;
    }

    function row(line) {
        return (
            <TableRow>
                {MakeCell(line.name)}
                {MakeRawCell(line.load)}
                {MakeRawCell(line.intensity)}
                {MakeRawCell(line.limit)}
            </TableRow>
        );
    }
    return (
        <Paper>
            <Table
                aria-sort="none"
                stickyHeader={true}
                className={classes.table}
                size="small"
            >
                <TableHead>
                    {MakeHead('name')}
                    {MakeHead('load')}
                    {MakeHead('intensity')}
                    {MakeHead('limit')}
                </TableHead>
                <TableBody style={{ overflow: 'scroll' }}>
                    {props.lines
                        .filter((line) => line.p1 > 100)
                        .map((line) => row(line))}
                </TableBody>
            </Table>
        </Paper>
    );
};

OverloadedLinesView.defaultProps = {
    lines: [],
};

OverloadedLinesView.propTypes = {
    lines: PropTypes.array,
};

export default OverloadedLinesView;
