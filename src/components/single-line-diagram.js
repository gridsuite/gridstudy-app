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
import useTheme from '@material-ui/core/styles/useTheme';
import Arrow from '../images/arrow.svg';
import ArrowHover from '../images/arrow_hover.svg';

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
        flex: "1 1 auto",
        maxWidth: maxWidthVoltageLevel,
        maxHeight: maxHeightVoltageLevel,
        minHeight: 0,
    },
    divSubstation: {
        flex: "1 1 auto",
        maxWidth: maxWidthSubstation,
        maxHeight: maxHeightSubstation,
        minHeight: 0,
    },
    diagram: {
        maxHeight: 700,
        'display': 'flex',
        'flex': '1 1 auto',
        'flexDirection': 'column',
        'minHeight': 0,
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

let arrowSvg;
let arrowHoverSvg;

fetch(Arrow)
    .then((data) => {
        return data.text();
    })
    .then((data) => {
        arrowSvg = data;
    });

fetch(ArrowHover)
    .then((data) => {
        return data.text();
    })
    .then((data) => {
        arrowHoverSvg = data;
    });

const SingleLineDiagram = forwardRef((props, ref) => {
    const [svg, setSvg] = useState(noSvg);
    const svgPrevViewbox = useRef();
    const svgDraw = useRef();

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const theme = useTheme();

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
        function createSvgArrow(element, position, x, highestY, lowestY) {
            let svgInsert = document.getElementById(element.id).parentElement;
            let group = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g'
            );

            let y;
            if (position === 'TOP') {
                y = lowestY - 65;
                x = x - 22;
            } else {
                y = highestY + 65;
                x = x + 22;
            }

            if (position === 'BOTTOM') {
                group.setAttribute(
                    'transform',
                    'translate(' + x + ',' + y + ') rotate(180)'
                );
            } else {
                group.setAttribute(
                    'transform',
                    'translate(' + x + ',' + y + ')'
                );
            }

            group.innerHTML = arrowSvg + arrowHoverSvg;

            //set initial colors depending on the theme
            group.getElementsByClassName('arrow_hover')[0].style.fill =
                theme.circle.fill;
            group.getElementsByClassName('arrow')[0].style.fill =
                theme.arrow.fill;

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

            //handling the color changes when hovering
            group.addEventListener('mouseenter', function (e) {
                e.target.querySelector('.arrow_hover').style.fill =
                    theme.circle_hover.fill;
                e.target.querySelector('.arrow').style.fill =
                    theme.arrow_hover.fill;
            });

            group.addEventListener('mouseleave', function (e) {
                e.target.querySelector('.arrow_hover').style.fill =
                    theme.circle.fill;
                e.target.querySelector('.arrow').style.fill = theme.arrow.fill;
            });
        }

        function addNavigationArrow(svg) {
            let navigable = svg.metadata.nodes.filter(
                (el) => el.nextVId !== null
            );

            let vlList = svg.metadata.nodes.map((element) => element.vid);
            vlList = vlList.filter(
                (element, index) =>
                    element !== '' && vlList.indexOf(element) === index
            );

            //remove arrows if the arrow points to the current svg
            navigable = navigable.filter((element) => {
                return vlList.indexOf(element.nextVId) === -1;
            });

            let highestY;
            let lowestY;
            let y;

            navigable.forEach((element) => {
                let transform = document
                    .getElementById(element.id)
                    .getAttribute('transform')
                    .split(',');

                y = parseInt(transform[1].match(/\d+/));
                if (highestY === undefined || y > highestY) {
                    highestY = y;
                }
                if (lowestY === undefined || y < lowestY) {
                    lowestY = y;
                }
            });

            navigable.forEach((element) => {
                let transform = document
                    .getElementById(element.id)
                    .getAttribute('transform')
                    .split(',');
                let x = parseInt(transform[0].match(/\d+/));
                createSvgArrow(
                    element,
                    element.direction,
                    x,
                    highestY,
                    lowestY
                );
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
                .width(sizeWidth)
                .height("98%")
                .viewbox(xOrigin, yOrigin, svgWidth, svgHeight)
                .panZoom({
                    panning: true,
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
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
            style={{
                                pointerEvents: 'auto',
            }}
            className={finalClasses}
        >
            <Box className={classes.header}>
                {props.diagramAction}
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
