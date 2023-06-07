/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
    _MapContext as MapContext,
    NavigationControl,
    StaticMap,
} from 'react-map-gl';
import { FlyToInterpolator } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';

import { makeStyles, useTheme } from '@mui/styles';
import { decomposeColor } from '@mui/material/styles';
import LoaderWithOverlay from '../utils/loader-with-overlay';

import GeoData from './geo-data';
import LineLayer, { LineFlowColorMode, LineFlowMode } from './line-layer';
import SubstationLayer from './substation-layer';
import { getNominalVoltageColor } from '../../utils/colors';
import { RunningStatus } from '../utils/running-status';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button } from '@mui/material';
import { PARAM_MAP_MANUAL_REFRESH } from '../../utils/config-params';
import { isNodeBuilt } from '../graph/util/model-functions';
import MapEquipments from './map-equipments';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { fetchMapBoxToken } from 'utils/rest-api';
import LinePopover from '.././tooltips/line-popover';

const useStyles = makeStyles((theme) => ({
    mapManualRefreshBackdrop: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        zIndex: 99,
        fontSize: 30,
    },
}));

const FALLBACK_MAPBOX_TOKEN =
    'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug';
const SUBSTATION_LAYER_PREFIX = 'substationLayer';
const LINE_LAYER_PREFIX = 'lineLayer';
const LABEL_SIZE = 12;

const NetworkMap = (props) => {
    const [mapBoxToken, setMapBoxToken] = useState();
    const [labelsVisible, setLabelsVisible] = useState(false);
    const [showLineFlow, setShowLineFlow] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const [deck, setDeck] = useState(null);
    const [centered, setCentered] = useState({
        lastCenteredSubstation: null,
        centeredSubstationId: null,
        centered: false,
    });
    const lastViewStateRef = useRef(null);
    const [tooltip, setTooltip] = useState({});
    const theme = useTheme();
    const foregroundNeutralColor = useMemo(() => {
        const labelColor = decomposeColor(theme.palette.text.primary).values;
        labelColor[3] *= 255;
        return labelColor;
    }, [theme]);
    const [cursorType, setCursorType] = useState('grab');
    const centerOnSubstation = useSelector((state) => state.centerOnSubstation);
    const mapManualRefresh = useSelector(
        (state) => state[PARAM_MAP_MANUAL_REFRESH]
    );
    const reloadMapNeeded = useSelector((state) => state.reloadMap);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { getNameOrId } = useNameOrId();

    const readyToDisplay =
        props.mapEquipments !== null &&
        props.geoData !== null &&
        !props.disabled;

    const readyToDisplaySubstations =
        readyToDisplay &&
        props.mapEquipments.substations &&
        props.geoData.substationPositionsById.size > 0;

    const readyToDisplayLines =
        readyToDisplay &&
        (props.mapEquipments?.lines || props.mapEquipments?.hvdcLines) &&
        props.mapEquipments.voltageLevels &&
        props.geoData.substationPositionsById.size > 0;

    const mapEquipmentsLines = useMemo(() => {
        return [
            ...(props.mapEquipments?.lines ?? []),
            ...(props.mapEquipments?.hvdcLines ?? []),
        ];
    }, [props.mapEquipments?.hvdcLines, props.mapEquipments?.lines]);

    const studyUuid = useSelector((state) => state.studyUuid);

    const classes = useStyles();

    const divRef = useRef();

    useEffect(() => {
        fetchMapBoxToken().then((token) =>
            setMapBoxToken(token || FALLBACK_MAPBOX_TOKEN)
        );
    }, []);

    useEffect(() => {
        if (centerOnSubstation === null) {
            return;
        }
        setCentered({
            lastCenteredSubstation: null,
            centeredSubstationId: centerOnSubstation?.to,
            centered: true,
        });
    }, [centerOnSubstation]);

    // Do this in onAfterRender because when doing it in useEffect (triggered by calling setDeck()),
    // it doesn't work in the case of using the browser backward/forward buttons (because in this particular case,
    // we get the ref to the deck and it has not yet initialized..)
    function onAfterRender() {
        //use centered and deck to execute this block only once when the data is ready and deckgl is initialized
        //TODO, replace the next lines with setProps( { initialViewState } ) when we upgrade to 8.1.0
        //see https://github.com/uber/deck.gl/pull/4038
        //This is a hack because it accesses the properties of deck directly but for now it works
        if (
            (!centered.centered ||
                (centered.centeredSubstationId &&
                    centered.centeredSubstationId !==
                        centered.lastCenteredSubstation)) &&
            deck !== null &&
            deck.viewManager != null &&
            props.geoData !== null
        ) {
            if (props.geoData.substationPositionsById.size > 0) {
                if (centered.centeredSubstationId) {
                    const geodata = props.geoData.substationPositionsById.get(
                        centered.centeredSubstationId
                    );
                    if (!geodata) {
                        return;
                    } // can't center on substation if no coordinate.
                    const copyViewState =
                        lastViewStateRef.current || deck.viewState;
                    const newViewState = {
                        longitude: geodata.lon,
                        latitude: geodata.lat,
                        zoom: copyViewState.zoom,
                        maxZoom: deck.viewState.maxZoom,
                        pitch: copyViewState.pitch,
                        bearing: copyViewState.bearing,
                    };
                    // if this is not the page load, use a fly to animation. On page load, we want to center directly
                    if (centered.centered) {
                        newViewState.transitionDuration = 2000;
                        newViewState.transitionInterpolator =
                            new FlyToInterpolator();
                    }
                    deck.viewState = newViewState;
                    deck.setProps({});
                    deck._onViewStateChange({ viewState: deck.viewState });
                    setCentered({
                        lastCenteredSubstation: centered.centeredSubstationId,
                        centeredSubstationId: centered.centeredSubstationId,
                        centered: true,
                    });
                } else {
                    const coords = Array.from(
                        props.geoData.substationPositionsById.entries()
                    ).map((x) => x[1]);
                    const maxlon = Math.max.apply(
                        null,
                        coords.map((x) => x.lon)
                    );
                    const minlon = Math.min.apply(
                        null,
                        coords.map((x) => x.lon)
                    );
                    const maxlat = Math.max.apply(
                        null,
                        coords.map((x) => x.lat)
                    );
                    const minlat = Math.min.apply(
                        null,
                        coords.map((x) => x.lat)
                    );
                    const marginlon = (maxlon - minlon) / 10;
                    const marginlat = (maxlat - minlat) / 10;
                    const viewport = deck.getViewports()[0];
                    const boundedViewport = viewport.fitBounds([
                        [minlon - marginlon / 2, minlat - marginlat / 2],
                        [maxlon + marginlon / 2, maxlat + marginlat / 2],
                    ]);
                    deck.viewState = {
                        longitude: boundedViewport.longitude,
                        latitude: boundedViewport.latitude,
                        zoom: Math.min(
                            deck.viewState.maxZoom,
                            boundedViewport.zoom
                        ),
                        maxZoom: deck.viewState.maxZoom,
                        pitch: deck.viewState.pitch,
                        bearing: deck.viewState.bearing,
                    };
                    deck.setProps({});
                    deck._onViewStateChange({ viewState: deck.viewState });
                    setCentered({
                        lastCenteredSubstation: null,
                        centered: true,
                    });
                }
            }
        }
    }

    function onViewStateChange(info) {
        lastViewStateRef.current = info.viewState;
        if (
            !info.interactionState || // first event of before an animation (e.g. clicking the +/- buttons of the navigation controls, gives the target
            (info.interactionState && !info.interactionState.inTransition) // Any event not part of a animation (mouse panning or zooming)
        ) {
            if (
                info.viewState.zoom >= props.labelsZoomThreshold &&
                !labelsVisible
            ) {
                setLabelsVisible(true);
            } else if (
                info.viewState.zoom < props.labelsZoomThreshold &&
                labelsVisible
            ) {
                setLabelsVisible(false);
            }
            setShowTooltip(info.viewState.zoom >= props.tooltipZoomThreshold);
            setShowLineFlow(info.viewState.zoom >= props.arrowsZoomThreshold);
        }
    }

    function renderTooltip() {
        return (
            tooltip &&
            tooltip.visible && (
                <div
                    ref={divRef}
                    style={{
                        position: 'absolute',
                        color: theme.palette.text.primary,
                        zIndex: 1,
                        pointerEvents: 'none',
                        left: tooltip.pointerX,
                        top: tooltip.pointerY,
                    }}
                >
                    <LinePopover
                        studyUuid={studyUuid}
                        lineInfos={tooltip.lineInfos}
                        anchorEl={divRef.current}
                        lineId={tooltip.lineId}
                        loadFlowStatus={props.loadFlowStatus}
                    />
                </div>
            )
        );
    }

    function onClickHandler(info, event, network) {
        if (
            info.layer &&
            info.layer.id.startsWith(SUBSTATION_LAYER_PREFIX) &&
            info.object &&
            (info.object.substationId || info.object.voltageLevels) // is a voltage level marker, or a substation text
        ) {
            let idVl;
            let idSubstation;
            if (info.object.substationId) {
                idVl = info.object.id;
            } else if (info.object.voltageLevels) {
                if (info.object.voltageLevels.length === 1) {
                    let idS = info.object.voltageLevels[0].substationId;
                    let substation = network.getSubstation(idS);
                    if (substation && substation.voltageLevels.length > 1) {
                        idSubstation = idS;
                    } else {
                        idVl = info.object.voltageLevels[0].id;
                    }
                } else {
                    idSubstation = info.object.voltageLevels[0].substationId;
                }
            }
            if (idVl !== undefined) {
                if (props.onSubstationClick && event.leftButton) {
                    props.onSubstationClick(idVl);
                } else if (props.onVoltageLevelMenuClick && event.rightButton) {
                    props.onVoltageLevelMenuClick(
                        network.getVoltageLevel(idVl),
                        event.center.x,
                        event.center.y
                    );
                }
            }
            if (idSubstation !== undefined) {
                if (
                    props.onSubstationClickChooseVoltageLevel &&
                    event.leftButton
                ) {
                    props.onSubstationClickChooseVoltageLevel(
                        idSubstation,
                        event.center.x,
                        event.center.y
                    );
                } else if (props.onSubstationMenuClick && event.rightButton) {
                    props.onSubstationMenuClick(
                        network.getSubstation(idSubstation),
                        event.center.x,
                        event.center.y
                    );
                }
            }
        }
        if (
            event.rightButton &&
            info.layer &&
            info.layer.id.startsWith(LINE_LAYER_PREFIX) &&
            info.object &&
            info.object.id &&
            info.object.voltageLevelId1 &&
            info.object.voltageLevelId2
        ) {
            // picked line properties are retrieved from network data and not from pickable object infos,
            // because pickable object infos might not be up to date
            let line = network.getLine(info.object.id);
            if (line) {
                props.onLineMenuClick(line, event.center.x, event.center.y);
            } else {
                let hvdcLine = network.getHvdcLine(info.object.id);
                if (hvdcLine) {
                    props.onHvdcLineMenuClick(
                        hvdcLine,
                        event.center.x,
                        event.center.y
                    );
                }
            }
        }
    }

    function cursorHandler({ isDragging }) {
        return isDragging ? 'grabbing' : cursorType;
    }

    const layers = [];

    if (readyToDisplaySubstations) {
        layers.push(
            new SubstationLayer({
                id: SUBSTATION_LAYER_PREFIX,
                data: props.mapEquipments?.substations,
                network: props.mapEquipments,
                geoData: props.geoData,
                getNominalVoltageColor: getNominalVoltageColor,
                filteredNominalVoltages: props.filteredNominalVoltages,
                labelsVisible: labelsVisible,
                labelColor: foregroundNeutralColor,
                labelSize: LABEL_SIZE,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    setCursorType(object ? 'pointer' : 'grab');
                },
                getNameOrId: getNameOrId,
            })
        );
    }

    if (readyToDisplayLines) {
        layers.push(
            new LineLayer({
                id: LINE_LAYER_PREFIX,
                data: mapEquipmentsLines,
                network: props.mapEquipments,
                updatedLines: props.updatedLines,
                geoData: props.geoData,
                getNominalVoltageColor: getNominalVoltageColor,
                disconnectedLineColor: foregroundNeutralColor,
                filteredNominalVoltages: props.filteredNominalVoltages,
                lineFlowMode: props.lineFlowMode,
                showLineFlow: props.visible && showLineFlow,
                lineFlowColorMode: props.lineFlowColorMode,
                lineFlowAlertThreshold: props.lineFlowAlertThreshold,
                loadFlowStatus: props.loadFlowStatus,
                lineFullPath:
                    props.geoData.linePositionsById.size > 0 &&
                    props.lineFullPath,
                lineParallelPath: props.lineParallelPath,
                labelsVisible: labelsVisible,
                labelColor: foregroundNeutralColor,
                labelSize: LABEL_SIZE,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    if (object) {
                        setCursorType('pointer');
                        setTooltip({
                            lineId: getNameOrId(object),
                            pointerX: x,
                            pointerY: y,
                            lineInfos: object,
                            visible: showTooltip,
                        });
                    } else {
                        setCursorType('grab');
                        setTooltip(null);
                    }
                },
            })
        );
    }

    const initialViewState = {
        longitude: props.initialPosition[0],
        latitude: props.initialPosition[1],
        zoom: props.initialZoom,
        maxZoom: 12,
        pitch: 0,
        bearing: 0,
    };

    const renderOverlay = () => (
        <LoaderWithOverlay
            color="inherit"
            loaderSize={70}
            isFixed={false}
            loadingMessageText={'loadingGeoData'}
        />
    );

    return (
        <>
            <DeckGL
                onViewStateChange={onViewStateChange}
                ref={(ref) => {
                    // save a reference to the Deck instance to be able to center in onAfterRender
                    setDeck(ref && ref.deck);
                }}
                onClick={(info, event) => {
                    onClickHandler(info, event, props.mapEquipments);
                }}
                onAfterRender={onAfterRender}
                layers={layers}
                initialViewState={initialViewState}
                controller={{ doubleClickZoom: false }}
                ContextProvider={MapContext.Provider}
                getCursor={cursorHandler}
                pickingRadius={5}
            >
                {props.displayOverlayLoader && renderOverlay()}
                {mapManualRefresh &&
                    reloadMapNeeded &&
                    isNodeBuilt(currentNode) && (
                        <div className={classes.mapManualRefreshBackdrop}>
                            <Button
                                onClick={props.onReloadMapClick}
                                aria-label="reload"
                                color="inherit"
                                size="large"
                            >
                                <ReplayIcon />
                                <FormattedMessage id="ManuallyRefreshGeoData" />
                            </Button>
                        </div>
                    )}

                {mapBoxToken && (
                    <StaticMap
                        mapStyle={theme.mapboxStyle}
                        preventStyleDiffing={true}
                        mapboxApiAccessToken={mapBoxToken}
                    >
                        {showTooltip && renderTooltip()}
                    </StaticMap>
                )}
                <NavigationControl style={{ right: 10, top: 10, zIndex: 1 }} />
            </DeckGL>
        </>
    );
};

NetworkMap.defaultProps = {
    network: null,
    substations: [],
    lines: [],
    geoData: null,
    filteredNominalVoltages: null,
    labelsZoomThreshold: 9,
    arrowsZoomThreshold: 7,
    tooltipZoomThreshold: 6,
    initialZoom: 5,
    initialPosition: [0, 0],
    lineFullPath: true,
    lineParallelPath: true,
    lineFlowMode: LineFlowMode.FEEDERS,
    lineFlowHidden: true,
    lineFlowColorMode: LineFlowColorMode.NOMINAL_VOLTAGE,
    lineFlowAlertThreshold: 100,
    loadFlowStatus: RunningStatus.IDLE,
    visible: true,
    displayOverlayLoader: false,
    disabled: false,
};

NetworkMap.propTypes = {
    network: PropTypes.instanceOf(MapEquipments),
    geoData: PropTypes.instanceOf(GeoData),
    filteredNominalVoltages: PropTypes.array,
    labelsZoomThreshold: PropTypes.number.isRequired,
    arrowsZoomThreshold: PropTypes.number.isRequired,
    tooltipZoomThreshold: PropTypes.number.isRequired,
    initialZoom: PropTypes.number.isRequired,
    initialPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSubstationClick: PropTypes.func,
    onLineMenuClick: PropTypes.func,
    onHvdcLineMenuClick: PropTypes.func,
    onSubstationClickChooseVoltageLevel: PropTypes.func,
    onSubstationMenuClick: PropTypes.func,
    onVoltageLevelMenuClick: PropTypes.func,
    lineFullPath: PropTypes.bool,
    lineParallelPath: PropTypes.bool,
    lineFlowMode: PropTypes.oneOf(Object.values(LineFlowMode)),
    lineFlowHidden: PropTypes.bool,
    lineFlowColorMode: PropTypes.oneOf(Object.values(LineFlowColorMode)),
    lineFlowAlertThreshold: PropTypes.number.isRequired,
    loadFlowStatus: PropTypes.oneOf(Object.values(RunningStatus)),
    visible: PropTypes.bool,
    updatedLines: PropTypes.array,
    displayOverlayLoader: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default React.memo(NetworkMap);
