/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import mapboxgl from 'mapbox-gl';
import maplibregl from 'maplibre-gl';

import { Map, NavigationControl, useControl } from 'react-map-gl';

import { decomposeColor } from '@mui/material/styles';
import LoaderWithOverlay from '../utils/loader-with-overlay';

import GeoData from './geo-data';
import LineLayer, { LineFlowColorMode, LineFlowMode } from './line-layer';
import SubstationLayer from './substation-layer';
import { getNominalVoltageColor } from '../../utils/colors';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, useTheme } from '@mui/material';
import {
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_MAP_BASEMAP,
    MAP_BASEMAP_MAPBOX,
    basemap_style_theme_key,
} from '../../utils/config-params';
import { isNodeBuilt } from '../graph/util/model-functions';
import MapEquipments from './map-equipments';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import EquipmentPopover from '.././tooltips/equipment-popover';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { fetchMapBoxToken } from '../../services/utils';
import { Box } from '@mui/system';

import { MapboxOverlay } from '@deck.gl/mapbox';
import ComputingType from 'components/computing-status/computing-type';

// MouseEvent.button https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const MOUSE_EVENT_BUTTON_LEFT = 0;
const MOUSE_EVENT_BUTTON_RIGHT = 2;

// Small boilerplate recommended by deckgl, to bridge to a react-map-gl control declaratively
// see https://deck.gl/docs/api-reference/mapbox/mapbox-overlay#using-with-react-map-gl
const DeckGLOverlay = forwardRef((props, ref) => {
    const overlay = useControl(() => new MapboxOverlay(props));
    overlay.setProps(props);
    useImperativeHandle(ref, () => overlay, [overlay]);
    return null;
});

const PICKING_RADIUS = 5;

const styles = {
    mapManualRefreshBackdrop: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'grey',
        opacity: '0.8',
        position: 'relative',
        zIndex: 99,
        fontSize: 30,
    },
};

const FALLBACK_MAPBOX_TOKEN =
    'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug';
const SUBSTATION_LAYER_PREFIX = 'substationLayer';
const LINE_LAYER_PREFIX = 'lineLayer';
const LABEL_SIZE = 12;
const INITIAL_CENTERED = {
    lastCenteredSubstation: null,
    centeredSubstationId: null,
    centered: false,
};

const NetworkMap = (props) => {
    const [mapBoxToken, setMapBoxToken] = useState();
    const [labelsVisible, setLabelsVisible] = useState(false);
    const [showLineFlow, setShowLineFlow] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const mapRef = useRef();
    const deckRef = useRef();
    const [centered, setCentered] = useState(INITIAL_CENTERED);
    const lastViewStateRef = useRef(null);
    const [tooltip, setTooltip] = useState({});
    const theme = useTheme();
    const foregroundNeutralColor = useMemo(() => {
        const labelColor = decomposeColor(theme.palette.text.primary).values;
        labelColor[3] *= 255;
        return labelColor;
    }, [theme]);
    const [cursorType, setCursorType] = useState('grab');
    const [isDragging, setDragging] = useState(false);
    const centerOnSubstation = useSelector((state) => state.centerOnSubstation);
    const mapManualRefresh = useSelector(
        (state) => state[PARAM_MAP_MANUAL_REFRESH]
    );
    const reloadMapNeeded = useSelector((state) => state.reloadMap);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const { getNameOrId } = useNameOrId();

    const loadFlowStatus = useSelector(
        (state) => state.computingStatus[ComputingType.LOADFLOW]
    );
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

    // TODO simplify this, now we use Map as the camera controlling component
    // so  we don't need the deckgl ref anymore. The following comments are
    // probably outdated, cleanup everything:
    // Do this in onAfterRender because when doing it in useEffect (triggered by calling setDeck()),
    // it doesn't work in the case of using the browser backward/forward buttons (because in this particular case,
    // we get the ref to the deck and it has not yet initialized..)
    function onAfterRender() {
        // TODO outdated comment
        //use centered and deck to execute this block only once when the data is ready and deckgl is initialized
        //TODO, replace the next lines with setProps( { initialViewState } ) when we upgrade to 8.1.0
        //see https://github.com/uber/deck.gl/pull/4038
        //This is a hack because it accesses the properties of deck directly but for now it works
        if (
            (!centered.centered ||
                (centered.centeredSubstationId &&
                    centered.centeredSubstationId !==
                        centered.lastCenteredSubstation)) &&
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
                    mapRef.current?.flyTo({
                        center: [geodata.lon, geodata.lat],
                        duration: 2000,
                    });
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
                    mapRef.current?.fitBounds(
                        [
                            [minlon - marginlon / 2, minlat - marginlat / 2],
                            [maxlon + marginlon / 2, maxlat + marginlat / 2],
                        ],
                        { animate: false }
                    );
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
            tooltip?.visible &&
            // Should not display the tooltip for HVDC lines
            !props.mapEquipments?.getHvdcLine(tooltip.equipmentId) && (
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
                    <EquipmentPopover
                        studyUuid={studyUuid}
                        anchorEl={divRef.current}
                        equipmentId={tooltip.equipmentId}
                        equipmentType={EQUIPMENT_TYPES.LINE}
                        loadFlowStatus={loadFlowStatus}
                    />
                </div>
            )
        );
    }

    function onClickHandler(info, event, network) {
        const leftButton =
            event.originalEvent.button === MOUSE_EVENT_BUTTON_LEFT;
        const rightButton =
            event.originalEvent.button === MOUSE_EVENT_BUTTON_RIGHT;
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
                if (props.onSubstationClick && leftButton) {
                    props.onSubstationClick(idVl);
                } else if (props.onVoltageLevelMenuClick && rightButton) {
                    props.onVoltageLevelMenuClick(
                        network.getVoltageLevel(idVl),
                        event.originalEvent.x,
                        event.originalEvent.y
                    );
                }
            }
            if (idSubstation !== undefined) {
                if (props.onSubstationClickChooseVoltageLevel && leftButton) {
                    props.onSubstationClickChooseVoltageLevel(
                        idSubstation,
                        event.originalEvent.x,
                        event.originalEvent.y
                    );
                } else if (props.onSubstationMenuClick && rightButton) {
                    props.onSubstationMenuClick(
                        network.getSubstation(idSubstation),
                        event.originalEvent.x,
                        event.originalEvent.y
                    );
                }
            }
        }
        if (
            rightButton &&
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
                props.onLineMenuClick(
                    line,
                    event.originalEvent.x,
                    event.originalEvent.y
                );
            } else {
                let hvdcLine = network.getHvdcLine(info.object.id);
                if (hvdcLine) {
                    props.onHvdcLineMenuClick(
                        hvdcLine,
                        event.originalEvent.x,
                        event.originalEvent.y
                    );
                }
            }
        }
    }

    function onMapContextMenu(event) {
        const info =
            deckRef.current &&
            deckRef.current.pickObject({
                x: event.point.x,
                y: event.point.y,
                radius: PICKING_RADIUS,
            });
        info && onClickHandler(info, event, props.mapEquipments);
    }

    function cursorHandler() {
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
                loadFlowStatus: loadFlowStatus,
                lineFullPath:
                    props.geoData.linePositionsById.size > 0 &&
                    props.lineFullPath,
                lineParallelPath: props.lineParallelPath,
                labelsVisible: labelsVisible,
                labelColor: foregroundNeutralColor,
                labelSize: LABEL_SIZE,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    const equipmentId =
                        object && getNameOrId(object?.line ?? object);
                    if (!!equipmentId) {
                        setCursorType('pointer');
                        setTooltip({
                            equipmentId,
                            pointerX: x,
                            pointerY: y,
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
        maxZoom: 14,
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

    // With mapboxgl v2 (not a problem with maplibre), we need to call
    // map.resize() when the parent size has changed, otherwise the map is not
    // redrawn. It seems like this is autodetected when the browser window is
    // resized, but not for programmatic resizes of the parent. For now in our
    // app, only 2 things need this to ensure the map keeps the correct size:
    // - changing study display mode because it changes the map container size
    //   programmatically
    // - changing visible when the map provider is changed in the settings because
    //   it causes a render with the map container having display:none
    const studyDisplayMode = useSelector((state) => state.studyDisplayMode);
    useEffect(() => {
        mapRef.current?.resize();
    }, [studyDisplayMode, props.visible]);

    const basemap = useSelector((state) => state[PARAM_MAP_BASEMAP]);
    const mapLib =
        basemap === MAP_BASEMAP_MAPBOX
            ? mapBoxToken && {
                  key: 'mapboxgl',
                  mapLib: mapboxgl,
                  mapboxAccessToken: mapBoxToken,
              }
            : {
                  key: 'maplibregl',
                  mapLib: maplibregl,
              };
    // because the mapLib prop of react-map-gl is not reactive, we need to
    // unmount/mount the Map with 'key', so we need also to reset all state
    // associated with uncontrolled state of the map
    useEffect(() => {
        setCentered(INITIAL_CENTERED);
    }, [mapLib?.key]);

    return (
        mapLib && (
            <Map
                ref={mapRef}
                style={{ zIndex: 0 }}
                {...mapLib}
                onMove={onViewStateChange}
                doubleClickZoom={false}
                mapStyle={theme[basemap_style_theme_key(basemap)]}
                preventStyleDiffing={true}
                initialViewState={initialViewState}
                cursor={cursorHandler()} //TODO needed for pointer on our features, but forces us to reeimplement grabbing/grab for panning. Can we avoid reimplementing?
                onDrag={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
                onContextMenu={onMapContextMenu}
            >
                {props.displayOverlayLoader && renderOverlay()}
                {mapManualRefresh &&
                    reloadMapNeeded &&
                    isNodeBuilt(currentNode) && (
                        <Box sx={styles.mapManualRefreshBackdrop}>
                            <Button
                                onClick={props.onReloadMapClick}
                                aria-label="reload"
                                color="inherit"
                                size="large"
                            >
                                <ReplayIcon />
                                <FormattedMessage id="ManuallyRefreshGeoData" />
                            </Button>
                        </Box>
                    )}
                <DeckGLOverlay
                    ref={deckRef}
                    onClick={(info, event) => {
                        onClickHandler(
                            info,
                            event.srcEvent,
                            props.mapEquipments
                        );
                    }}
                    onAfterRender={onAfterRender} // TODO simplify this
                    layers={layers}
                    pickingRadius={PICKING_RADIUS}
                />
                {showTooltip && renderTooltip()}
                {/* visualizePitch true makes the compass reset the pitch when clicked in addition to visualizing it */}
                <NavigationControl visualizePitch={true} />
            </Map>
        )
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
    tooltipZoomThreshold: 7,
    initialZoom: 5,
    initialPosition: [0, 0],
    lineFullPath: true,
    lineParallelPath: true,
    lineFlowMode: LineFlowMode.FEEDERS,
    lineFlowHidden: true,
    lineFlowColorMode: LineFlowColorMode.NOMINAL_VOLTAGE,
    lineFlowAlertThreshold: 100,
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
    visible: PropTypes.bool,
    updatedLines: PropTypes.array,
    displayOverlayLoader: PropTypes.bool,
    disabled: PropTypes.bool,
    mapEquipments: PropTypes.object,
};

export default React.memo(NetworkMap);
