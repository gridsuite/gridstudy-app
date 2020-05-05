/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CompositeLayer, PathLayer} from 'deck.gl';

import ArrowLayer, {ArrowDirection} from "./layers/arrow-layer";
import getDistance from "geolib/es/getDistance";

const DISTANCE_BETWEEN_ARROWS = 10000.0;

export const LineFlowMode = {
    NONE: 'none',
    STATIC_ARROWS: 'staticArrows',
    ANIMATED_ARROWS: 'animatedArrows'
};

class LineLayer extends CompositeLayer {

    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: []
        };
    }

    updateState({props, changeFlags}) {
        if (changeFlags.dataChanged) {
            let compositeData = [];

            if (props.network != null && props.geoData != null) {

                // group lines by nominal voltage

                const lineNominalVoltageIndexer = (map, line) => {
                    const vl = props.network.getVoltageLevel(line.voltageLevelId1)
                        || props.network.getVoltageLevel(line.voltageLevelId2);
                    let list = map.get(vl.nominalVoltage);
                    if (!list) {
                        list = [];
                        map.set(vl.nominalVoltage, list);
                    }
                    list.push(line);
                    return map;
                };
                const linesByNominalVoltage = props.data.reduce(lineNominalVoltageIndexer, new Map());

                compositeData = Array.from(linesByNominalVoltage.entries())
                    .map(e => { return { nominalVoltage: e[0], lines: e[1] };})
                    .sort((a, b) => b.nominalVoltage - a.nominalVoltage);

                // add arrows

                compositeData.forEach(compositeData => {
                    // create one arrow each DISTANCE_BETWEEN_ARROWS
                    compositeData.arrows = compositeData.lines.flatMap(line => {
                        // calculate distance between 2 substations as a raw estimate of line size
                        const positions = props.geoData.getLinePositions(props.network, line, false);
                        const lineDistance = getDistance({latitude: positions[0][1], longitude: positions[0][0]},
                                                         {latitude: positions[1][1], longitude: positions[1][0]});

                        const arrowCount = Math.ceil(lineDistance / DISTANCE_BETWEEN_ARROWS);

                        return [...new Array(arrowCount).keys()].map(index => {
                            return {
                                distance: index / arrowCount,
                                line: line
                            }
                        });
                    });
                });
            }

            this.setState({compositeData: compositeData});
        }
    }

    renderLayers() {
        const layers = [];

        // lines : create one layer per nominal voltage, starting from higher to lower nominal voltage
        this.state.compositeData.forEach(compositeData => {
            const color = this.props.getNominalVoltageColor(compositeData.nominalVoltage);

            const lineLayer = new PathLayer(this.getSubLayerProps({
                id: 'LineNominalVoltage' + compositeData.nominalVoltage,
                data: compositeData.lines,
                widthScale: 20,
                widthMinPixels: 1,
                widthMaxPixels: 2,
                getPath: line => this.props.geoData.getLinePositions(this.props.network, line, this.props.lineFullPath),
                getColor: color,
                getWidth: 2,
                visible: this.props.filteredNominalVoltages.includes(compositeData.nominalVoltage),
                updateTriggers: {
                    getPath: [this.props.lineFullPath]
                }
            }));
            layers.push(lineLayer);

            const arrowLayer = new ArrowLayer(this.getSubLayerProps({
                id: 'ArrowNominalVoltage' + compositeData.nominalVoltage,
                data: compositeData.arrows,
                sizeMinPixels: 3,
                sizeMaxPixels: 7,
                getDistance: arrow => arrow.distance,
                getLine: arrow => arrow.line,
                getLinePositions: line => this.props.geoData.getLinePositions(this.props.network, line, this.props.lineFullPath),
                getColor: color,
                getSize: 700,
                getSpeedFactor: 3,
                getDirection: arrow => {
                    if (arrow.line.p1 < 0) {
                        return ArrowDirection.FROM_SIDE_2_TO_SIDE_1;
                    } else if (arrow.line.p1 > 0) {
                        return ArrowDirection.FROM_SIDE_1_TO_SIDE_2;
                    } else {
                        return ArrowDirection.NONE;
                    }
                },
                animated: this.props.lineFlowMode === LineFlowMode.ANIMATED_ARROWS,
                visible: this.props.lineFlowMode !== LineFlowMode.NONE && this.props.filteredNominalVoltages.includes(compositeData.nominalVoltage),
                updateTriggers: {
                    getLinePositions: [this.props.lineFullPath]
                }
            }));
            layers.push(arrowLayer);
        });

        return layers;
    }
}

LineLayer.layerName = 'LineLayer';

LineLayer.defaultProps = {
    network: null,
    geoData: null,
    getNominalVoltageColor: {type: 'accessor', value: [255, 255, 255]},
    filteredNominalVoltages: [],
    lineFlowMode: LineFlowMode.NONE,
    lineFullPath: true
};

export default LineLayer;
