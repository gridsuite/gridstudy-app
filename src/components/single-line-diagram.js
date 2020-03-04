/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import PropTypes from "prop-types";

import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';

import {removeVoltageLevelDiagram} from '../redux/actions';
import {useDispatch} from "react-redux";

const useStyles = makeStyles(theme => ({
    diagram: {
        width: 800,
        height: 600,
        "& .component-label": {
            fill: theme.palette.text.primary,
            "font-size": 12,
            "font-family": theme.typography.fontFamily
        }
    },
    close: {
        padding: 0
    }
}));

const SingleLineDiagram = (props) => {

    const dispatch = useDispatch();

    useEffect(() => {
        var svg = document.getElementById("sld-svg").getElementsByTagName("svg")[0];
        if (svg) {
            svg.style.height = "100%";
            svg.style.width = "100%";
            var bbox = svg.getBBox();
            svg.setAttribute("viewBox", 0 + " " + 0 + " " + (bbox.width + 20) + " " + (bbox.height + 20));
        }
    }, [props.svg]);

    const classes = useStyles();

    return (
        <Paper elevation={1} variant='outlined' className={classes.diagram}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <Typography>{props.diagramId}</Typography>
                </Box>
                <IconButton className={classes.close} onClick={() => dispatch(removeVoltageLevelDiagram())}>
                    <CloseIcon/>
                </IconButton>
            </Box>
            <div id="sld-svg" style={{height : '100%'}} dangerouslySetInnerHTML={{__html:props.svg}}/>
        </Paper>
    );
};

SingleLineDiagram.propTypes = {
    diagramId: PropTypes.string.isRequired,
    svg: PropTypes.string.isRequired
};

export default SingleLineDiagram;
