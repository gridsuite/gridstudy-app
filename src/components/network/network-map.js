/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {_MapContext as MapContext, NavigationControl, StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {PathLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';

import {useTheme} from '@material-ui/styles';
import {decomposeColor} from '@material-ui/core/styles/colorManipulator';

import Network from './network';
import GeoData from './geo-data';
import {useSelector} from "react-redux";

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2VvZmphbWciLCJhIjoiY2pwbnRwcm8wMDYzMDQ4b2pieXd0bDMxNSJ9.Q4aL20nBo5CzGkrWtxroug'; // eslint-disable-line

const SUBSTATIONS_LAYER_PREFIX = "substationsLayer";

const SUBSTATION_RADIUS = 500;

const NetworkMap = (props) => {

    const [labelsVisible, setLabelsVisible] = useState(false);

    const [deck, setDeck] = useState(null);
    const [centered, setCentered] = useState(false);

    const [tooltip, setTooltip] = useState({});

    const theme = useTheme();

    const useName = useSelector(state => state.useName);

    function getNominalVoltageColor(nominalVoltage) {
        if (nominalVoltage >= 300) {
            return [255, 0, 0];
        } else if (nominalVoltage >= 170 && nominalVoltage < 300) {
            return [34, 139, 34];
        } else if (nominalVoltage >= 120 && nominalVoltage < 170) {
            return [1, 175, 175];
        } else if (nominalVoltage >= 70 && nominalVoltage < 120) {
            return [204, 85, 0];
        } else if (nominalVoltage >= 50 && nominalVoltage < 70) {
            return [160, 32, 240];
        } else if (nominalVoltage >= 30 && nominalVoltage < 50) {
            return [255, 130, 144];
        } else {
            return [171, 175, 40];
        }
    }

    // Do this in onAfterRender because when doing it in useEffect (triggered by calling setDeck()),
    // it doesn't work in the case of using the browser backward/forward buttons (because in this particular case,
    // we get the ref to the deck and it has not yet initialized..)
    function onAfterRender() {
            //use centered and deck to execute this block only once when the data is ready and deckgl is initialized
            if (!centered && deck !== null && deck.viewManager != null && props.geoData !== null) {
                if (props.geoData.substationPositionsById.size > 0) {
                    const coords = Array.from(props.geoData.substationPositionsById.entries()).map(x => x[1]);
                    const maxlon = Math.max.apply(null, coords.map(x => x.lon));
                    const minlon = Math.min.apply(null, coords.map(x => x.lon));
                    const maxlat = Math.max.apply(null, coords.map(x => x.lat));
                    const minlat = Math.min.apply(null, coords.map(x => x.lat));
                    const marginlon = (maxlon - minlon)/10;
                    const marginlat = (maxlat - minlat)/10;
                    const viewport = deck.getViewports()[0];
                    const boundedViewport = viewport.fitBounds([
                            [minlon - marginlon/2, minlat - marginlat/2],
                            [maxlon + marginlon/2, maxlat + marginlat/2]
                    ]);
                    //TODO, replace the next lines with setProps( { initialViewState } ) when we upgrade to 8.1.0
                    //see https://github.com/uber/deck.gl/pull/4038
                    //This is a hack because it accesses the properties of deck directly but for now it works
                    deck.viewState = {
                            longitude: boundedViewport.longitude,
                            latitude: boundedViewport.latitude,
                            zoom: Math.min(deck.viewState.maxZoom, boundedViewport.zoom),
                            maxZoom: deck.viewState.maxZoom,
                            pitch: deck.viewState.pitch,
                            bearing: deck.viewState.bearing
                    };
                    deck.setProps({});
                }
                setCentered(true);
            }
    }

    function onViewStateChange(info) {
        if (info.viewState.zoom >= props.labelsZoomThreshold && !labelsVisible) {
            setLabelsVisible(true);
        } else if (info.viewState.zoom < props.labelsZoomThreshold && labelsVisible) {
            setLabelsVisible(false);
        }
    }

    function renderTooltip() {
        return tooltip && (
            <div style={{position: 'absolute', color: theme.palette.text.primary, zIndex: 1, pointerEvents: 'none', left: tooltip.pointerX, top: tooltip.pointerY}}>
                { tooltip.message }
            </div>
        );
    }

    function onClickHandler(info) {
        if (info.layer && info.layer.id.startsWith(SUBSTATIONS_LAYER_PREFIX)) {
            if (props.onSubstationClick) {
                props.onSubstationClick(info.object.id, info.object.name)
            }
        }
    }

    function getVoltageLevelRadius(substationRadius, voltageLevel) {
        return substationRadius / voltageLevel.voltageLevelCount * (voltageLevel.voltageLevelIndex + 1)
    }

    let layers = [];

    if (props.network !== null && props.geoData !== null) {
        // create one substation layer per nominal voltage, starting from higher to lower nominal voltage
        Array.from(props.network.voltageLevelsByNominalVoltage.entries())
            .map(e => { return { nominalVoltage: e[0], voltageLevels: e[1] };})
            .sort((a, b) => b.nominalVoltage - a.nominalVoltage)
            .forEach(e => {
                const color = getNominalVoltageColor(e.nominalVoltage);

                const substationsLayer = new ScatterplotLayer({
                    id: SUBSTATIONS_LAYER_PREFIX + e.nominalVoltage,
                    data: e.voltageLevels,
                    radiusMinPixels: 1,
                    getPosition: voltageLevel => props.geoData.getSubstationPosition(voltageLevel.substationId),
                    getFillColor: color,
                    getRadius: voltageLevel => getVoltageLevelRadius(SUBSTATION_RADIUS, voltageLevel),
                    pickable: true
                });
                layers.push(substationsLayer);
            });

        const labelColor = decomposeColor(theme.palette.text.primary).values;
        labelColor[3] *= 255;

        const substationLabelsLayer = new TextLayer({
            id: 'labels',
            data: props.network.substations,
            pickable: true,
            getPosition: substation => props.geoData.getSubstationPosition(substation.id),
            getText: substation => useName ? substation.name : substation.id,
            getColor: labelColor,
            getSize: 16,
            getAngle: 0,
            getTextAnchor: 'start',
            getAlignmentBaseline: 'center',
            getPixelOffset: [20, 0],
            visible: labelsVisible,
            updateTriggers : {
                getText : useName
            }
        });
        layers.push(substationLabelsLayer);

        const lineLayer = new PathLayer({
            id: 'lines',
            data: props.network.lines,
            pickable: true,
            widthScale: 20,
            widthMinPixels: 1,
            widthMaxPixels: 2,
            getPath: line => props.geoData.getLinePositions(props.network, line),
            getColor: line => getNominalVoltageColor(props.network.voltageLevelsById.get(line.voltageLevelId1).nominalVoltage),
            getWidth: 2,
            onHover: ({object, x, y}) => {
                setTooltip({
                    message: object ? (useName? object.name : object.id) : null,
                    pointerX: x,
                    pointerY: y
                });
            }
        });
        layers.push(lineLayer);
    }

    const initialViewState = {
        longitude: props.initialPosition[0],
        latitude: props.initialPosition[1],
        zoom: props.initialZoom,
        maxZoom: 12,
        pitch: 0,
        bearing: 0
    };

    return <DeckGL onViewStateChange={onViewStateChange}
                   ref={ref => {
                       // save a reference to the Deck instance to be able to center in onAfterRender
                       setDeck(ref && ref.deck);
                   }}
                   onClick={onClickHandler}
                   onAfterRender={onAfterRender}
                   layers={layers}
                   initialViewState={initialViewState}
                   controller={{ doubleClickZoom: false }}
                   ContextProvider={MapContext.Provider}>
            <StaticMap
                reuseMaps
                mapStyle={ theme.mapboxStyle }
                preventStyleDiffing={true}
                mapboxApiAccessToken={MAPBOX_TOKEN}>
                { renderTooltip() }
            </StaticMap>
            <div style={{ position: "absolute", right: 10, top: 10, zIndex: 1 }}>
                <NavigationControl />
            </div>
        </DeckGL>;
};

NetworkMap.defaultProps = {
    network: null,
    geoData: null,
    labelsZoomThreshold: 7,
    initialZoom: 5,
    initialPosition: [0, 0]
};

NetworkMap.propTypes = {
    network: PropTypes.instanceOf(Network),
    geoData: PropTypes.instanceOf(GeoData),
    labelsZoomThreshold: PropTypes.number.isRequired,
    initialZoom: PropTypes.number.isRequired,
    initialPosition: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSubstationClick: PropTypes.func
};

export default NetworkMap;
