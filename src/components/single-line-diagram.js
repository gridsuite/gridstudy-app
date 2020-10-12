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

import { FormattedMessage, useIntl } from 'react-intl';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';

import { fetchSvg, lockoutLine } from '../utils/rest-api';

import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import SingleLineDiagramActions from './single-line-diagram-actions';
import { useSelector } from 'react-redux';
import useTheme from '@material-ui/core/styles/useTheme';

const maxWidth = 800;
const maxHeight = 700;

const useStyles = makeStyles((theme) => ({
    div: {
        maxWidth: maxWidth,
        maxHeight: maxHeight,
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
        maxWidth: maxWidth,
        maxHeight: maxHeight,
    },
    errorUpdateSwitch: {
        position: 'absolute',
        top: 25,
        left: 0,
        right: 0,
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

    const [displaySldActions, setDisplaySldActions] = useState(false);

    const [selectedElementMetadata, setSelectedElementMetadata] = useState(
        null
    );

    const [lockoutMessage, setLockoutMessage] = useState(null);

    const [lockout, setLockout] = useState(null);

    const network = useSelector((state) => state.network);

    const intl = useIntl();

    const theme = useTheme();

    const forceUpdate = useCallback(() => {
        if (svgDraw.current) {
            svgPrevViewbox.current = svgDraw.current.viewbox();
        }
        updateState((s) => !s);
    }, []);

    function closeSldActions() {
        setDisplaySldActions(false);
        setLockout(null);
        setLockoutMessage(null);
        setSelectedElementMetadata(null);
    }

    function handleSldLockout() {
        lockoutLine(
            props.studyName,
            props.userId,
            selectedElementMetadata.equipmentId,
            lockout
        ).then(forceUpdate);
    }

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
            fetchSvg(props.svgUrl)
                .then((data) => {
                    setSvg({
                        svg: data.svg,
                        metadata: data.metadata,
                        error: null,
                        svgUrl: props.svgUrl,
                    });
                })
                .catch(function (error) {
                    console.error(error.message);
                    setSvg({
                        svg: null,
                        metadata: null,
                        error,
                        svgUrl: props.svgUrl,
                    });
                });
        } else {
            setSvg(noSvg);
        }
    }, [props.svgUrl, forceState]);

    const { onNextVoltageLevelClick, onBreakerClick } = props;
    useLayoutEffect(() => {
        function addNavigationArrowDef() {
            let svg = document.getElementById('sld-svg').children[0]; //Get svg element
            let defElement = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'defs'
            );
            let html = [
                '<marker id="arrowhead" markerWidth="10" markerHeight="15" refX="1.25" refY="0" >',
                '<polygon points="0 0, 1.25 2.5, 2.5 0"/>',
                '</marker>',
            ].join('');
            defElement.innerHTML = html;
            svg.appendChild(defElement);
        }

        //this arrow is bigger and invisible so the clickable space is bigger
        function addClickableArrow(group, position) {
            let arrow = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'line'
            );

            arrow.setAttribute('x1', 0);
            arrow.setAttribute('x2', 0);
            arrow.setAttribute('y1', 0);
            arrow.setAttribute('y2', 40);
            arrow.style.strokeWidth = '40'; //Set stroke width

            if (position === 'TOP') {
                arrow.setAttribute('transform', 'rotate(180)');
            }
            group.appendChild(arrow);
        }

        function addArrow(element, transform, position) {
            let svgInsert = document.getElementById(element.id).parentElement;
            let group = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g'
            );
            let arrow = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'line'
            );
            //get x and y from transform attribute
            let x = parseInt(transform[0].match(/\d+/));
            let y = parseInt(transform[1].match(/\d+/));
            if (position === 'TOP') {
                y = y - 35;
            } else {
                y = y + 35;
            }
            arrow.setAttribute('x1', 0);
            arrow.setAttribute('x2', 0);
            arrow.setAttribute('y1', 0);
            arrow.setAttribute('y2', 10);
            arrow.setAttribute('marker-end', 'url(#arrowhead)');
            arrow.style.stroke = '#000'; //Set stroke colour
            arrow.style.strokeWidth = '10'; //Set stroke width

            group.setAttribute('pointer-events', 'all');
            group.setAttribute('transform', 'translate(' + x + ',' + y + ')');

            if (position === 'TOP') {
                arrow.setAttribute('transform', 'rotate(180)');
            }

            group.appendChild(arrow);
            svgInsert.appendChild(group);
            addClickableArrow(group, position);

            // handling the navigation between voltage levels
            group.style.cursor = 'pointer';
            group.addEventListener('click', function (e) {
                const id = document.getElementById(element.id).id;
                const meta = svg.metadata.nodes.find(
                    (other) => other.id === id
                );
                closeSldActions();
                onNextVoltageLevelClick(meta.nextVId);
            });
        }

        function addNavigationArrow(svg) {
            const navigable = svg.metadata.nodes.filter(
                (el) => el.nextVId !== null
            );

            navigable.forEach((element) => {
                let transform = document
                    .getElementById(element.id)
                    .getAttribute('transform')
                    .split(',');
                if (element.direction === 'TOP') {
                    addArrow(element, transform, 'TOP');
                } else {
                    addArrow(element, transform, 'BOT');
                }
            });
        }

        function openSingleLineMenu(bool, element) {
            let line = network.lines.find(
                (el) => el.id === element.equipmentId
            );
            let message;
            if (
                line.terminal1Connected === false &&
                line.terminal2Connected === false
            ) {
                message = intl.formatMessage({ id: 'PutLineIntoOperation' });
                setLockout(false);
            } else {
                message = intl.formatMessage({ id: 'LockoutLine' });
                setLockout(true);
            }
            setLockoutMessage(message);
            setSelectedElementMetadata(element);
            setDisplaySldActions(bool);
        }

        if (svg.svg) {
            //close sldActions if we change svg
            closeSldActions();
            //need to add it there so the bbox has the right size
            addNavigationArrowDef();
            addNavigationArrow(svg);
            // calculate svg width and height
            const divElt = document.getElementById('sld-svg');
            const svgEl = divElt.getElementsByTagName('svg')[0];
            const bbox = svgEl.getBBox();
            const xOrigin = bbox.x - 20;
            const yOrigin = bbox.y - 24;
            const svgWidth = bbox.width + 40;
            const svgHeight = bbox.height + 48;
            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ''; // clear the previous svg in div element before replacing
            const draw = SVG()
                .addTo(divElt)
                .size(svgWidth, svgHeight)
                .viewbox(xOrigin, yOrigin, svgWidth, svgHeight)
                .panZoom({
                    panning: true,
                    zoomMin: 0.5,
                    zoomMax: 10,
                    zoomFactor: 0.3,
                    margins: {
                        top: svgHeight / 4,
                        left: svgWidth / 4,
                        bottom: svgHeight / 4,
                        right: svgWidth / 4,
                    },
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
            addNavigationArrowDef();
            addNavigationArrow(svg);

            // handling the selection
            const elements = svg.metadata.nodes.filter(
                (el) => el.nextVId !== null
            );
            elements.forEach((el) => {
                const domEl = document.getElementById(el.id);
                domEl.style.cursor = 'pointer';
                domEl.addEventListener('click', function (e) {
                    let previousSelectedElement = document.getElementsByClassName(
                        'selectedSvgElement'
                    )[0];

                    //if click on the already selected element remove the selection
                    if (previousSelectedElement === e.target) {
                        previousSelectedElement.classList.remove(
                            'selectedSvgElement'
                        );
                        previousSelectedElement.style.fill =
                            theme.palette.text.primary;
                        setDisplaySldActions(false);
                        return;
                    }

                    //remove previously selected element if exists
                    if (previousSelectedElement !== undefined) {
                        previousSelectedElement.classList.remove(
                            'selectedSvgElement'
                        );
                        previousSelectedElement.style.fill =
                            theme.palette.text.primary;
                    }

                    //select element on click
                    let clickedElement = e.target;
                    let elementMetadata = svg.metadata.nodes.find(
                        (element) => e.target.parentElement.id === element.id
                    );
                    clickedElement.style.fill = 'red';
                    clickedElement.classList.add('selectedSvgElement');
                    openSingleLineMenu(true, elementMetadata);
                });
            });

            // handling the click on a switch
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

            svgDraw.current = draw;
        }
        // Note: onNextVoltageLevelClick, intl and onBreakerClick don't change
    }, [
        svg,
        onNextVoltageLevelClick,
        onBreakerClick,
        intl,
        network.lines,
        theme.palette.text.primary,
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
                className={classes.div}
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

    return (
        <Paper elevation={1} variant="outlined" className={finalClasses}>
            <Box display="flex" flexDirection="row">
                <Box flexGrow={1}>
                    <Typography>{props.diagramTitle}</Typography>
                </Box>
                <IconButton className={classes.close} onClick={onCloseHandler}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box display="flex" flexDirection="row">
                <Box>
                    {msgUpdateSwitch}
                    {inner}
                </Box>
                <Box
                    style={{
                        marginTop: '50px',
                        marginRight: '5px',
                        width: '55px',
                    }}
                >
                    {displaySldActions && (
                        <SingleLineDiagramActions
                            handleSldLockout={handleSldLockout}
                            lockout={lockout}
                            message={lockoutMessage}
                        />
                    )}
                </Box>
            </Box>
        </Paper>
    );
});

SingleLineDiagram.propTypes = {
    diagramTitle: PropTypes.string.isRequired,
    svgUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    updateSwitchMsg: PropTypes.string.isRequired,
};

export default SingleLineDiagram;
