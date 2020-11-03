/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';

import { fetchSvg } from '../utils/rest-api';

import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import { useSelector } from 'react-redux';
import { LIGHT_THEME } from '../redux/actions';

export const SubstationLayout = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    SMART: 'smart',
    SMARTHORIZONTALCOMPACTION: 'smartHorizontalCompaction',
    SMARTVERTICALCOMPACTION: 'smartVerticalCompaction',
};

export const SvgType = {
    VOLTAGE_LEVEL: 'voltage-level',
    SUBSTATION: 'substation',
};

const maxWidthVoltageLevel = 800;
const maxHeightVoltageLevel = 700;
const maxWidthSubstation = 1200;
const maxHeightSubstation = 700;

const useStyles = makeStyles((theme) => ({
    divVoltageLevel: {
        maxWidth: maxWidthVoltageLevel,
        maxHeight: maxHeightVoltageLevel,
        overflowX: 'hidden',
        overflowY: 'hidden',
    },
    divSubstation: {
        maxWidth: maxWidthSubstation,
        maxHeight: maxHeightSubstation,
        overflowX: 'hidden',
        overflowY: 'hidden',
    },
    diagram: {
        '& .component-label': {
            fill: theme.palette.text.primary,
            'font-size': 12,
            'font-family': theme.typography.fontFamily,
        },
    },
    close: {
        padding: 0,
    },
    error: {
        maxWidth: maxWidthVoltageLevel,
        maxHeight: maxHeightVoltageLevel,
    },
    errorUpdateSwitch: {
        position: 'absolute',
        top: 25,
        left: 0,
        right: 0,
    },
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: theme.palette.background.default,
    },
}));

const SvgNotFound = (props) => {
    const classes = useStyles();
    return (
        <Container className={classes.error}>
            <Typography variant="h5">
                <FormattedMessage
                    id="svgNotFound"
                    values={{
                        svgUrl: props.svgUrl,
                        error: props.error.message,
                    }}
                />
            </Typography>
        </Container>
    );
};

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

const SWITCH_COMPONENT_TYPES = ['BREAKER', 'DISCONNECTOR', 'LOAD_BREAK_SWITCH'];

const SingleLineDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
    const svgPrevViewbox = useRef();
    const svgDraw = useRef();

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useSelector((state) => state.theme);

    const forceUpdate = useCallback(() => {
        if (svgDraw.current) {
            svgPrevViewbox.current = svgDraw.current.viewbox();
        }
        updateState((s) => !s);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            reloadSvg: forceUpdate,
        }),
        // Note: forceUpdate doesn't change
        [forceUpdate]
    );

    useEffect(() => {
        if (props.svgUrl) {
            updateLoadingState(true);
            fetchSvg(props.svgUrl)
                .then((data) => {
                    setSvg({
                        svg: data.svg,
                        metadata: data.metadata,
                        error: null,
                        svgUrl: props.svgUrl,
                    });
                    updateLoadingState(false);
                })
                .catch(function (error) {
                    console.error(error.message);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error,
                        svgUrl: props.svgUrl,
                    });
                    updateLoadingState(false);
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState]);

    const {
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        svgType,
    } = props;

    const calcMargins = (svgType, width, height) => {
        return {
            top: svgType === SvgType.VOLTAGE_LEVEL ? height / 4 : -Infinity,
            left: svgType === SvgType.VOLTAGE_LEVEL ? width / 4 : -Infinity,
            bottom: svgType === SvgType.VOLTAGE_LEVEL ? height / 4 : -Infinity,
            right: svgType === SvgType.VOLTAGE_LEVEL ? width / 4 : -Infinity,
        };
    };

    useLayoutEffect(() => {
        function addNavigationArrowDef() {
            let svg = document.getElementById('sld-svg').children[0]; //Get svg element
            let defElement = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'defs'
            );

            let html;
            if (theme === LIGHT_THEME) {
                html = [
                    '<marker id="arrowhead" viewBox="0 0 100 100" refX="50" refY="1" >',
                    '<polygon style="stroke: white;fill: white" points="0 0, 50 80, 100 0"/>',
                    '</marker>',
                ].join('');
            } else {
                html = [
                    '<marker id="arrowhead" viewBox="0 0 100 100" refX="50" refY="1" >',
                    '<polygon style="stroke: #212121;fill: #212121" points="0 0, 50 80, 100 0"/>',
                    '</marker>',
                ].join('');
            }

            defElement.innerHTML = html;
            svg.appendChild(defElement);
        }

        function createSvgArrow(element, transform, position) {
            let svgInsert = document.getElementById(element.id).parentElement;
            let group = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g'
            );
            let circle = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'circle'
            );

            let arrow = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'line'
            );
            //get x and y from transform attribute
            let x = parseInt(transform[0].match(/\d+/));
            let y = parseInt(transform[1].match(/\d+/));
            if (position === 'TOP') {
                y = y - 45;
            } else {
                y = y + 45;
            }
            arrow.setAttribute('x1', 0);
            arrow.setAttribute('x2', 0);
            arrow.setAttribute('y1', -10);
            arrow.setAttribute('y2', 0);
            arrow.setAttribute('marker-end', 'url(#arrowhead)');
            arrow.style.strokeWidth = '5'; //Set stroke width

            circle.setAttribute('r', 15);
            circle.setAttribute('cx', 0);
            circle.setAttribute('cy', 0);

            //set colors depending on the theme
            if (theme === LIGHT_THEME) {
                circle.style.stroke = '#212121';
                circle.style.fill = '#212121';
                arrow.style.stroke = 'white';
            } else {
                circle.style.stroke = 'white';
                circle.style.fill = 'white';
                arrow.style.stroke = '#212121';
            }

            group.setAttribute('pointer-events', 'all');
            group.setAttribute('transform', 'translate(' + x + ',' + y + ')');

            if (position === 'TOP') {
                arrow.setAttribute('transform', 'rotate(180)');
            }

            group.appendChild(circle);
            group.appendChild(arrow);
            svgInsert.appendChild(group);

            // handling the navigation between voltage levels
            group.style.cursor = 'pointer';
            group.addEventListener('click', function (e) {
                const id = document.getElementById(element.id).id;
                const meta = svg.metadata.nodes.find(
                    (other) => other.id === id
                );
                onNextVoltageLevelClick(meta.nextVId);
            });
        }

        function addNavigationArrow(svg) {
            addNavigationArrowDef();
            const navigable = svg.metadata.nodes.filter(
                (el) => el.nextVId !== null
            );

            navigable.forEach((element) => {
                let transform = document
                    .getElementById(element.id)
                    .getAttribute('transform')
                    .split(',');
                createSvgArrow(element, transform, element.direction);
            });
        }

        if (svg.svg) {
            //need to add it there so the bbox has the right size
            addNavigationArrow(svg);
            // calculate svg width and height from svg bounding box
            const divElt = document.getElementById('sld-svg');
            const svgEl = divElt.getElementsByTagName('svg')[0];
            const bbox = svgEl.getBBox();
            const xOrigin = bbox.x - 20;
            const yOrigin = bbox.y - 20;
            const svgWidth = bbox.width + 40;
            const svgHeight = bbox.height + 40;

            let sizeWidth = svgWidth;
            let sizeHeight = svgHeight;
            if (svgType === 'substation') {
                // fit substation diagram to content
                sizeWidth =
                    svgWidth > maxWidthSubstation
                        ? maxWidthSubstation
                        : svgWidth;
                sizeHeight =
                    svgHeight > maxHeightSubstation
                        ? maxHeightSubstation
                        : svgHeight;
            }

            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ''; // clear the previous svg in div element before replacing
            const draw = SVG()
                .addTo(divElt)
                .size(sizeWidth, sizeHeight)
                .viewbox(xOrigin, yOrigin, svgWidth, svgHeight)
                .panZoom({
                    panning: true,
                    zoomMin: svgType === SvgType.VOLTAGE_LEVEL ? 0.5 : 0.1,
                    zoomMax: 10,
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
                    margins: calcMargins(svgType, sizeWidth, sizeHeight),
                });
            if (svgPrevViewbox.current) {
                draw.viewbox(svgPrevViewbox.current);
                svgPrevViewbox.current = null;
            }
            draw.svg(svg.svg).node.firstElementChild.style.overflow = 'visible';
            draw.on('panStart', function (evt) {
                divElt.style.cursor = 'move';
            });
            draw.on('panEnd', function (evt) {
                divElt.style.cursor = 'default';
            });
            addNavigationArrow(svg);

            // handling the click on a switch
            if (!isComputationRunning) {
                const switches = svg.metadata.nodes.filter((element) =>
                    SWITCH_COMPONENT_TYPES.includes(element.componentType)
                );
                switches.forEach((aSwitch) => {
                    const domEl = document.getElementById(aSwitch.id);
                    domEl.style.cursor = 'pointer';
                    domEl.addEventListener('click', function (event) {
                        const clickedElementId = event.currentTarget.id;
                        const switchMetadata = svg.metadata.nodes.find(
                            (value) => value.id === clickedElementId
                        );
                        const switchId = switchMetadata.equipmentId;
                        const open = switchMetadata.open;
                        svgPrevViewbox.current = draw.viewbox();
                        onBreakerClick(switchId, !open, event.currentTarget);
                    });
                });
            }

            svgDraw.current = draw;
        }
        // Note: onNextVoltageLevelClick and onBreakerClick don't change
    }, [
        svg,
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        svgType,
        theme,
    ]);

    useEffect(() => {
        svgPrevViewbox.current = null;
    }, [props.updateSwitchMsg]);

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
        inner = <SvgNotFound svgUrl={svg.svgUrl} error={svg.error} />;
    } else {
        finalClasses = classes.diagram;
        inner = (
            <div
                id="sld-svg"
                style={{ height: '100%' }}
                className={
                    svgType === SvgType.VOLTAGE_LEVEL
                        ? classes.divVoltageLevel
                        : classes.divSubstation
                }
                dangerouslySetInnerHTML={{ __html: svg.svg }}
            />
        );
    }

    let msgUpdateSwitch;
    if (props.updateSwitchMsg !== '') {
        msgUpdateSwitch = (
            <Alert className={classes.errorUpdateSwitch} severity="error">
                {props.updateSwitchMsg}
            </Alert>
        );
    } else {
        msgUpdateSwitch = '';
    }

    let displayProgress;
    if (loadingState) {
        displayProgress = <LinearProgress />;
    } else {
        displayProgress = '';
    }

    return (
        <Paper
            elevation={1}
            variant="outlined"
            square="true"
            className={finalClasses}
        >
            <Box className={classes.header}>
                <Box flexGrow={1}>
                    <Typography>{props.diagramTitle}</Typography>
                </Box>
                <IconButton className={classes.close} onClick={onCloseHandler}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box height={2}>{displayProgress}</Box>
            {msgUpdateSwitch}
            {inner}
        </Paper>
    );
});

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    updateSwitchMsg: PropTypes.string.isRequired,
    isComputationRunning: PropTypes.bool.isRequired,
    svgType: PropTypes.string.isRequired,
};

export default SingleLineDiagram;
