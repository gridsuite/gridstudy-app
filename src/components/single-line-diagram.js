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
import { useSelector, useDispatch } from 'react-redux';

import { fullScreenSingleLineDiagram } from '../redux/actions';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

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
    fullScreenSingleLineDiagram: {
        width: '100%',
        textAlign: 'center',
        '& svg': {
            width: '100%',
            height: 'calc(100vh - 120px)', // Temporary: it will be fixed in the us of deleting scroll
        },
    },
    fullScreen: {
        top: '-48px',
        position: 'relative',
        textAlign: 'right',
        padding: '5px 10px 0',
    },
    notFullScreen: {
        top: '-50px',
        position: 'relative',
        textAlign: 'right',
        padding: '5px 10px 0',
        float: 'right',
    },
    fullScreenIcon: {
        cursor: 'pointer',
        fontSize: '35px',
        zIndex: '3',
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
    const dispatch = useDispatch();

    const fullScreen = useSelector((state) => state.fullScreen);

    const [forceState, updateState] = useState(false);

    const [loadingState, updateLoadingState] = useState(false);

    const [fullScreenWidth, setFullScreenWidth] = useState(0);

    const [svgFullWidth, setSvgFullWidth] = useState(null);

    const fullWidth = document.querySelector('body').offsetWidth;
    const widthListNetwork = document.getElementById('network-list')
        .offsetWidth;

    const forceUpdate = useCallback(() => {
        if (svgDraw.current) {
            svgPrevViewbox.current = svgDraw.current.viewbox();
        }
        updateState((s) => !s);
    }, []);

    const getSgv = useCallback(() => {
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
    }, [props.svgUrl]);

    useImperativeHandle(
        ref,
        () => ({
            reloadSvg: forceUpdate,
        }),
        // Note: forceUpdate doesn't change
        [forceUpdate]
    );

    useEffect(() => {
        getSgv();
        setSvgFullWidth(fullWidth - widthListNetwork);
    }, [forceState, getSgv]);

    const {
        onNextVoltageLevelClick,
        onBreakerClick,
        isComputationRunning,
        svgType,
    } = props;

    const calcMargins = useCallback(() => {
        return {
            top: fullScreen ? 100 : 100,
            left: fullScreen
                ? svgType === SvgType.VOLTAGE_LEVEL
                    ? -(svgFullWidth / 6)
                    : 100
                : 100,
            bottom: fullScreen ? 100 : 200,
            right: fullScreen
                ? svgType === SvgType.VOLTAGE_LEVEL
                    ? -(svgFullWidth / 6)
                    : 100
                : 100,
        };
    }, [fullScreen]);

    useLayoutEffect(() => {
        if (svg.svg) {
            const widthOfFullScreen = document.getElementById('sld-svg')
                .offsetWidth;
            setFullScreenWidth(widthOfFullScreen);
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
                .viewbox(xOrigin, yOrigin, sizeWidth, sizeHeight)
                .panZoom({
                    panning: true,
                    zoomMin: svgType === SvgType.VOLTAGE_LEVEL ? 0.5 : 0.1,
                    zoomMax: 10,
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
                    margins: calcMargins(),
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
            draw.on('zoom', function (event) {
                draw.panZoom({
                    panning: true,
                    zoomMin: svgType === SvgType.VOLTAGE_LEVEL ? 0.5 : 0.1,
                    zoomMax: 10,
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
                    margins: {
                        top: event.detail.level < 0.5 ? 50 : 100,
                        left:
                            event.detail.level < 1
                                ? svgType === SvgType.VOLTAGE_LEVEL
                                    ? -(svgFullWidth / 6)
                                    : 50
                                : 100,
                        right:
                            event.detail.level < 1
                                ? svgType === SvgType.VOLTAGE_LEVEL
                                    ? -(svgFullWidth / 6)
                                    : 50
                                : 100,
                        bottom: event.detail.level < 0.5 ? 50 : 200,
                    },
                });
            });

            // handling the navigation between voltage levels
            const elements = svg.metadata.nodes.filter(
                (el) => el.nextVId !== null
            );
            elements.forEach((el) => {
                const domEl = document.getElementById(el.id);
                domEl.style.cursor = 'pointer';
                domEl.addEventListener('click', function (e) {
                    const id = e.target.parentElement.id;
                    const meta = svg.metadata.nodes.find(
                        (other) => other.id === id
                    );
                    onNextVoltageLevelClick(meta.nextVId);
                });
            });

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
        calcMargins,
        fullScreenWidth,
    ]);

    useEffect(() => {
        svgPrevViewbox.current = null;
    }, [props.updateSwitchMsg]);

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            dispatch(fullScreenSingleLineDiagram(false));
            props.onClose();
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(true));
        getSgv();
    };

    const hideFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(false));
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
                style={{ height: fullScreen ? 'auto' : '100%' }}
                className={
                    fullScreen
                        ? classes.fullScreenSingleLineDiagram
                        : svgType === SvgType.VOLTAGE_LEVEL
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
            style={{
                height: fullScreen ? '100%' : 'auto',
            }}
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
            {!loadingState && (
                <Box
                    className={
                        fullScreen ? classes.fullScreen : classes.notFullScreen
                    }
                >
                    {fullScreen ? (
                        <FullscreenExitIcon
                            onClick={hideFullScreen}
                            className={classes.fullScreenIcon}
                        />
                    ) : (
                        <FullscreenIcon
                            onClick={showFullScreen}
                            className={classes.fullScreenIcon}
                        />
                    )}
                </Box>
            )}
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
