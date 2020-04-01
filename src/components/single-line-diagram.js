/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useLayoutEffect, useState} from "react";
import PropTypes from "prop-types";

import {FormattedMessage} from "react-intl";

import Container from "@material-ui/core/Container";
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from "@material-ui/core/Paper";
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import { fetchSvg } from "../utils/rest-api";

import { SVG } from "@svgdotjs/svg.js";
import "@svgdotjs/svg.panzoom.js";

const maxWidth = 800;
const maxHeight = 700;

const useStyles = makeStyles(theme => ({
    div: {
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        overflowX: 'auto',
        overflowY: 'auto'
    },
    diagram: {
        "& .component-label": {
            fill: theme.palette.text.primary,
            "font-size": 12,
            "font-family": theme.typography.fontFamily
        }
    },
    close: {
        padding: 0
    },
    error: {
        maxWidth: maxWidth,
        maxHeight: maxHeight,
    },
}));

const SvgNotFound = (props) => {

    const classes = useStyles();
    return (
        <Container className={classes.error}>
            <Typography variant="h5">
                <FormattedMessage id="svgNotFound" values={ {"svgUrl": props.svgUrl, "error": props.error.message} }/>
            </Typography>
        </Container>
    );
};

const nosvg = {svg: null, metadata: null, error: null, svgUrl: null};

const SingleLineDiagram = (props) => {

    const [svg, setSvg] = useState(nosvg);

    useEffect(() => {
        if (props.svgUrl) {
            fetchSvg(props.svgUrl)
                .then(data => {
                    setSvg({svg: data.svg, metadata: data.metadata, error: null, svgUrl: props.svgUrl});
                })
                .catch(function(error) {
                    console.error(error.message);
                    setSvg({svg: null, metadata: null, error, svgUrl: props.svgUrl});
                });
        } else {
            setSvg(nosvg);
        }
    }, [props.svgUrl]);

    useLayoutEffect(() => {
        if (svg.svg) {
            // calculate svg width and height
            const divElt = document.getElementById("sld-svg");
            const svgEl = divElt.getElementsByTagName("svg")[0];
            const bbox = svgEl.getBBox();
            const svgWidth = bbox.width + 20;
            const svgHeight = bbox.height + 20;

            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ""; // clear the previous svg in div element before replacing
            const draw = SVG().addTo(divElt).size(svgWidth, svgHeight).viewbox(0, 0, svgWidth, svgHeight).panZoom({panning: true, zoomMin: 0.5, zoomMax: 10, zoomFactor: 0.2});
            draw.svg(svg.svg).node.firstElementChild.style.overflow = "visible";

            // handling the navigation between voltage levels
            const elements = svg.metadata.nodes.filter(el => el.nextVId !== null);
            elements.forEach(el => {
                const domEl = document.getElementById(el.id);
                domEl.style.cursor = "pointer";
                domEl.addEventListener("click", function(e) {
                    const id = e.target.parentElement.id;
                    const meta = svg.metadata.nodes.find( other => other.id === id );
                    props.onNextVoltageLevelClick(meta.nextVId);
                })});
        }
    }, [svg]);

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            props.onClose();
        }
    };

    let inner;
    let finalClasses;
    if (svg.error) {
        finalClasses = classes.error;
        inner = <SvgNotFound svgUrl={svg.svgUrl} error={svg.error}/>;
    } else {
        finalClasses = classes.diagram;
        inner = <div id="sld-svg" style={{height : '100%'}} className={classes.div} dangerouslySetInnerHTML={{__html:svg.svg}}/>
    }

    return (
        <Paper elevation={1} variant='outlined' className={finalClasses}>
                <Box display="flex" flexDirection="row">
                    <Box flexGrow={1}>
                        <Typography>{props.diagramTitle}</Typography>
                    </Box>
                    <IconButton className={classes.close} onClick={onCloseHandler}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
                {inner}
        </Paper>
    );
};

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func
};

export default SingleLineDiagram;
