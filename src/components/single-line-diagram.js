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

import { useDispatch, useSelector } from 'react-redux';
import { selectItemNetwork } from '../redux/actions';

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
import { fullScreenSingleLineDiagram } from '../redux/actions';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

import { AutoSizer } from 'react-virtualized';

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

const loadingWidth = 150;
const maxWidthVoltageLevel = 800;
const maxHeightVoltageLevel = 700;
const maxWidthSubstation = 1200;
const maxHeightSubstation = 700;
const errorWidth = maxWidthVoltageLevel;

const useStyles = makeStyles((theme) => ({
    divSld: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
        },
        '& .component-label': {
            fill: theme.palette.text.primary,
            'font-size': 12,
            'font-family': theme.typography.fontFamily,
        },
    },
    close: {
        padding: 0,
    },
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: theme.palette.background.default,
    },
    fullScreenIcon: {
        bottom: 5,
        right: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
}));

const SvgNotFound = (props) => {
    return (
        <Container>
        </Container>
    );
};

const noSvg = { svg: null, metadata: null, error: null, svgUrl: null };

// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
const mapRightOffset = 50;
const mapBottomOffset = 80;
const borders = 2; // we use content-size: border-box so this needs to be included..
// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
const computePaperAndSvgSizesIfReady = (fullScreen, svgType, totalWidth, totalHeight, svgPreferredWidth, svgPreferredHeight, headerPreferredHeight ) => {
    if (typeof(svgPreferredWidth) != "undefined" && typeof(headerPreferredHeight) != "undefined") {
        let paperWidth, paperHeight, svgWidth, svgHeight;
        if (fullScreen) {
            paperWidth = totalWidth;
            paperHeight = totalHeight;
            svgWidth = totalWidth - borders;
            svgHeight = totalHeight - headerPreferredHeight - borders;
        } else {
            let maxWidth, maxHeight;
            if (svgType === SvgType.VOLTAGE_LEVEL) {
                maxWidth = maxWidthVoltageLevel;
                maxHeight = maxHeightVoltageLevel;
            } else {
                maxWidth = maxWidthSubstation;
                maxHeight = maxHeightSubstation;
            }
            svgWidth = Math.min( svgPreferredWidth, totalWidth - mapRightOffset, maxWidth );
            svgHeight = Math.min( svgPreferredHeight, totalHeight - mapBottomOffset, maxHeight );
            paperWidth = svgWidth + borders;
            paperHeight = svgHeight + headerPreferredHeight + borders;
        } 
        return { paperWidth, paperHeight, svgWidth, svgHeight};
    }
}

const Inner = forwardRef((props, ref) => {

    const [forceState, updateState] = useState(false);

    const forceUpdate = useCallback(() => {
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

    const fullScreen = useSelector((state) => state.fullScreen);

    // using many useState() calls with literal values only to
    // easily avoid recomputing stuff when updating with the same values
    const [svgPreferredWidth, setSvgPreferredWidth] = useState();
    const [svgPreferredHeight, setSvgPreferredHeight] = useState();
    const [headerPreferredHeight, setHeaderPreferredHeight] = useState();
    const [finalPaperWidth, setFinalPaperWidth] = useState();
    const [finalPaperHeight, setFinalPaperHeight] = useState();
    const [svgFinalWidth, setSvgFinalWidth] = useState();
    const [svgFinalHeight, setSvgFinalHeight] = useState();

    const {totalWidth, totalHeight, svgType} = props;

    useLayoutEffect(() => {
        const sizes = computePaperAndSvgSizesIfReady(fullScreen, svgType, totalWidth, totalHeight, svgPreferredWidth, svgPreferredHeight, headerPreferredHeight);
        if (typeof(sizes) != 'undefined') {
            setSvgFinalWidth(sizes.svgWidth);
            setSvgFinalHeight(sizes.svgHeight);
            setFinalPaperWidth(sizes.paperWidth);
            setFinalPaperHeight(sizes.paperHeight);
        }
    }, [fullScreen, totalWidth,totalHeight, svgType, svgPreferredWidth, svgPreferredHeight, headerPreferredHeight]);

    const [loadingState, updateLoadingState] = useState(false);
    const [svg, setSvg] = useState(noSvg);
    const svgUrl = useRef('');
    const svgDraw = useRef();
    const dispatch =useDispatch();

    const theme = useTheme();

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
    } = props;

    const classes = useStyles();

    const onCloseHandler = () => {
        if (props.onClose !== null) {
            dispatch(selectItemNetwork(null));
            dispatch(fullScreenSingleLineDiagram(false));
            props.onClose();
        }
    };

    const showFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(true));
    };

    const hideFullScreen = () => {
        dispatch(fullScreenSingleLineDiagram(false));
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

            setSvgPreferredWidth(sizeWidth);
            setSvgPreferredHeight(sizeHeight);

            // using svgdotjs panzoom component to pan and zoom inside the svg, using svg width and height previously calculated for size and viewbox
            divElt.innerHTML = ''; // clear the previous svg in div element before replacing
            const draw = SVG()
                .addTo(divElt)
                .width(sizeWidth)
                .height(sizeHeight)
                .viewbox(xOrigin, yOrigin, svgWidth, svgHeight)
                .panZoom({
                    panning: true,
                    margins: { top: 100, left: 100, right: 100, bottom: 200 },
                    zoomFactor: svgType === SvgType.VOLTAGE_LEVEL ? 0.3 : 0.15,
                });
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
                        onBreakerClick(switchId, !open, event.currentTarget);
                    });
                });
            }

            if (svgDraw.current && svgUrl.current === svg.svgUrl) {
                draw.viewbox(svgDraw.current.viewbox());
            }
            svgUrl.current = svg.svgUrl;

            svgDraw.current = draw;
        } else {
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

    useLayoutEffect(() => {
        if (typeof(svgFinalWidth) != 'undefined' && typeof(svgFinalHeight) != 'undefined') {
            const divElt = document.getElementById('sld-svg');
            if (divElt != null) {
                const svgEl = divElt.getElementsByTagName('svg')[0];
                if (svgEl != null) {
                    svgEl.setAttribute("width", svgFinalWidth);
                    svgEl.setAttribute("height", svgFinalHeight);
                }
            }
        } else {
        }
    }, [svgFinalWidth, svgFinalHeight]);


    let sizeWidth, sizeHeight;
    if (svg.error) {
        sizeWidth = errorWidth; // height is not set so height is auto;
    } else if (typeof(finalPaperWidth) != 'undefined' && typeof(finalPaperHeight) != 'undefined' ) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    } else if (loadingState) {
        sizeWidth = loadingWidth; // height is not set so height is auto; used for the first load
    } else {
        sizeWidth = totalWidth; // happens during initalization
    }

 return (
<Paper
    elevation={1}
    variant="outlined"
    square="true"
    style={{
       pointerEvents: "auto",
       width: sizeWidth, height: sizeHeight,
    }}
>
    <Box>
        <AutoSizer onResize={ ({height}) => {setHeaderPreferredHeight(height);} }>
            {() => /* just for measuring the header */ { }}
        </AutoSizer>

        <Box className={classes.header}>
            {props.diagramAction}
            <Box flexGrow={1}>
                <Typography>{props.diagramTitle}</Typography>
            </Box>
            <IconButton className={classes.close} onClick={onCloseHandler}>
                <CloseIcon />
            </IconButton>
        </Box>
    </Box>
    <Box position="relative">
        <Box position="absolute" left={0} right={0} top={0}>
            {loadingState && <Box height={2}><LinearProgress/></Box>}
            {props.updateSwitchMsg && <Alert severity="error">{props.updateSwitchMsg}</Alert>}
        </Box>
        {svg.error ? ( <Typography variant="h5">
                <FormattedMessage
                    id="svgNotFound"
                    values={{
                        svgUrl: svg.svgUrl,
                        error: svg.error.message,
                    }}
                />
            </Typography> ) : (
            <div
                id="sld-svg"
                className={ classes.divSld }
                dangerouslySetInnerHTML={{ __html: svg.svg }}
            />
        )}
        {!loadingState && !svg.error && (
                fullScreen ? (
                    <FullscreenExitIcon
                        onClick={hideFullScreen}
                        className={classes.fullScreenIcon}
                    />
                ) : (
                    <FullscreenIcon
                        onClick={showFullScreen}
                        className={classes.fullScreenIcon}
                    />
                )
        )}
    </Box>
</Paper>
)});

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

    return (
        <AutoSizer>
            {({ width, height }) => <Inner ref={ref} totalWidth={width} totalHeight={height} {...props}/> }
        </AutoSizer>
    )
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
