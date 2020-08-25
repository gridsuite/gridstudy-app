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

import { useSelector } from 'react-redux';

import {
    _MapContext as MapContext,
    NavigationControl,
    StaticMap,
} from 'react-map-gl';
import { FlyToInterpolator } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';

import { useTheme } from '@material-ui/styles';
import { decomposeColor } from '@material-ui/core/styles/colorManipulator';

import Network from './network';
import GeoData from './geo-data';
import LineLayer, { LineFlowMode } from './line-layer';
import SubstationLayer from './substation-layer';
import { getNominalVoltageColor } from '../../utils/colors';

const MAPBOX_TOKEN =
    'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug'; // eslint-disable-line

const SUBSTATION_LAYER_PREFIX = 'substationLayer';
const LINE_LAYER_PREFIX = 'lineLayer';
const LABEL_SIZE = 16;

const NetworkMap = forwardRef((props, ref) => {
    const [labelsVisible, setLabelsVisible] = useState(false);

    const [lineFlowHidden, setLineFlowHidden] = useState(true);

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

    const useName = useSelector((state) => state.useName);

    const [cursorType, setCursorType] = useState('grab');

    useImperativeHandle(
        ref,
        () => ({
            centerSubstation: (substationId) => {
                setCentered({
                    lastCenteredSubstation: null,
                    centeredSubstationId: substationId,
                    centered: true,
                });
            },
        }),
        [setCentered]
    );

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
                        newViewState.transitionInterpolator = new FlyToInterpolator();
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

            setLineFlowHidden(info.viewState.zoom >= props.arrowsZoomThreshold);
        }
    }

    function renderTooltip() {
        return (
            tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        color: theme.palette.text.primary,
                        zIndex: 1,
                        pointerEvents: 'none',
                        left: tooltip.pointerX,
                        top: tooltip.pointerY,
                    }}
                >
                    {tooltip.message}
                </div>
            )
        );
    }

    function onClickHandler(info) {
        if (
            info.layer &&
            info.layer.id.startsWith(SUBSTATION_LAYER_PREFIX) &&
            info.object &&
            (info.object.substationId || info.object.voltageLevels) // is a voltage level marker, or a substation text
        ) {
            let idVl;
            if (info.object.substationId) {
                idVl = info.object.id;
            } else if (info.object.voltageLevels) {
                idVl = info.object.voltageLevels[0].id; // first voltage level of the substation, at the moment
            }
            if (props.onSubstationClick) {
                props.onSubstationClick(idVl);
            }
        }
    }

    function cursorHandler({ isDragging }) {
        return isDragging ? 'grabbing' : cursorType;
    }

    const layers = [];

    if (props.network !== null && props.geoData !== null) {
        layers.push(
            new SubstationLayer({
                id: SUBSTATION_LAYER_PREFIX,
                data: props.network.substations,
                network: props.network,
                geoData: props.geoData,
                getNominalVoltageColor: getNominalVoltageColor,
                filteredNominalVoltages: props.filteredNominalVoltages,
                useName: useName,
                labelsVisible: labelsVisible,
                labelColor: foregroundNeutralColor,
                labelSize: LABEL_SIZE,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    setCursorType(object ? 'pointer' : 'grab');
                },
            })
        );

        layers.push(
            new LineLayer({
                id: LINE_LAYER_PREFIX,
                data: props.network.lines,
                network: props.network,
                geoData: props.geoData,
                getNominalVoltageColor: getNominalVoltageColor,
                disconnectedLineColor: foregroundNeutralColor,
                filteredNominalVoltages: props.filteredNominalVoltages,
                lineFlowMode: props.lineFlowMode,
                lineFlowHidden: lineFlowHidden,
                lineFullPath: props.lineFullPath,
                lineParallelPath: props.lineParallelPath,
                labelsVisible: labelsVisible,
                labelColor: foregroundNeutralColor,
                labelSize: LABEL_SIZE,
                pickable: true,
                onHover: ({ object, x, y }) => {
                    setTooltip({
                        message: object
                            ? useName
                                ? object.name
                                : object.id
                            : null,
                        pointerX: x,
                        pointerY: y,
                    });
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

    return (
        <DeckGL
            onViewStateChange={onViewStateChange}
            ref={(ref) => {
                // save a reference to the Deck instance to be able to center in onAfterRender
                setDeck(ref && ref.deck);
            }}
            onClick={onClickHandler}
            onAfterRender={onAfterRender}
            layers={layers}
            initialViewState={initialViewState}
            controller={{ doubleClickZoom: false }}
            ContextProvider={MapContext.Provider}
            getCursor={cursorHandler}
            pickingRadius={5}
        >
            <StaticMap
                mapStyle={theme.mapboxStyle}
                preventStyleDiffing={true}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
                {renderTooltip()}
            </StaticMap>
            <div
                style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}
            >
                <NavigationControl
                    ref={(ref) => {
                        // Workaround, remove when https://github.com/uber/deck.gl/issues/4383 is resolved
                        if (ref != null) {
                            ref._uiVersion = 2;
                        }
                    }}
                />
            </div>
        </DeckGL>
    );
});

NetworkMap.defaultProps = {
    network: null,
    geoData: null,
    labelsZoomThreshold: 9,
    arrowsZoomThreshold: 7,
    initialZoom: 5,
    filteredNominalVoltages: null,
    initialPosition: [0, 0],
    lineFullPath: true,
    lineParallelPath: true,
    lineFlowMode: LineFlowMode.FEEDERS,
    lineFlowHidden: true,
};

NetworkMap.propTypes = {
    network: PropTypes.instanceOf(Network),
    geoData: PropTypes.instanceOf(GeoData),
    labelsZoomThreshold: PropTypes.number.isRequired,
    arrowsZoomThreshold: PropTypes.number.isRequired,
    initialZoom: PropTypes.number.isRequired,
    filteredNominalVoltages: PropTypes.array,
    initialPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSubstationClick: PropTypes.func,
    lineFullPath: PropTypes.bool,
    lineParallelPath: PropTypes.bool,
    lineFlowMode: PropTypes.instanceOf(LineFlowMode),
    lineFlowHidden: PropTypes.bool,
};

export default React.memo(NetworkMap);
