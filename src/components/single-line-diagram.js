/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import { fetchSvg } from "../utils/rest-api";

const useStyles = makeStyles(theme => ({
    div: {
        overflowX: 'auto',
        overflowY: 'auto'
    },
    diagram: {
        maxWidth: 800,
        maxHeight: 700,
        overflowX: 'auto',
        overflowY: 'auto',
        "& .component-label": {
            fill: theme.palette.text.primary,
            "font-size": 12,
            "font-family": theme.typography.fontFamily
        },
    },
    close: {
        padding: 0
    }
}));

const SingleLineDiagram = (props) => {

    const [svg, setSvg] = useState(null);

    useEffect(() => {
        if (props.svgUrl != null) {
            fetchSvg(props.svgUrl)
                .then(svg => {
                    setSvg(svg);
                });
        } else {
            setSvg(null);
        }
    }, [props.svgUrl]);

    useEffect(() => {
        const svg = document.getElementById("sld-svg").getElementsByTagName("svg")[0];
        if (svg) {
            const bbox = svg.getBBox();
            const svgWidth = bbox.width + 20;
            const svgHeight = bbox.height + 20;
            svg.setAttribute("width", svgWidth);
            svg.setAttribute("height", svgHeight);
            svg.style.width = svgWidth;
            svg.style.height = svgHeight;
       }
    }, [svg]);

    const classes = useStyles();

    function onClickHandler() {
        if (props.onClose !== null) {
            props.onClose();
        }
    }

    return (
        <Paper elevation={1} variant='outlined' className={classes.diagram}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <Typography>{props.diagramTitle}</Typography>
                </Box>
                <IconButton className={classes.close} onClick={() => onClickHandler()}>
                    <CloseIcon/>
                </IconButton>
            </Box>
            <div id="sld-svg" style={{height : '100%'}} className={classes.div} dangerouslySetInnerHTML={{__html:svg}}/>
        </Paper>
    );
};

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func
};

export default SingleLineDiagram;
