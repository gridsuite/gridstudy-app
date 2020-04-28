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

export const ArrowMode = {
    NONE: 'none',
    STATIC: 'static',
    ANIMATED: 'animated'
}

class LineLayer extends CompositeLayer {

    renderLayers() {
        const layers = [];

        if (this.props.network != null && this.props.geoData != null) {
            // lines : create one layer per nominal voltage, starting from higher to lower nominal voltage
            this.props.network.getLinesBySortedNominalVoltage()
                .forEach(e => {
                    const color = this.props.getNominalVoltageColor(e.nominalVoltage);

                    const lineLayer = new PathLayer(this.getSubLayerProps({
                        id: 'LineNominalVoltage' + e.nominalVoltage,
                        data: e.lines,
                        widthScale: 20,
                        widthMinPixels: 1,
                        widthMaxPixels: 2,
                        getPath: line => this.props.geoData.getLinePositions(this.props.network, line),
                        getColor: color,
                        getWidth: 2,
                        visible: this.props.filteredNominalVoltages.includes(e.nominalVoltage)
                    }));
                    layers.push(lineLayer);

                    if (this.props.arrowMode !== ArrowMode.NONE) {
                        // create one arrow each DISTANCE_BETWEEN_ARROWS
                        const arrows = e.lines.flatMap(line => {

                            // calculate distance between 2 substations as a raw estimate of line size
                            const positions = this.props.geoData.getLinePositions(this.props.network, line, false);
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

                        const arrowLayer = new ArrowLayer(this.getSubLayerProps({
                            id: 'ArrowNominalVoltage' + e.nominalVoltage,
                            data: arrows,
                            sizeMinPixels: 3,
                            sizeMaxPixels: 7,
                            getDistance: arrow => arrow.distance,
                            getLine: arrow => arrow.line,
                            getLinePositions: line => this.props.geoData.getLinePositions(this.props.network, line),
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
                            animated: this.props.arrowMode === ArrowMode.ANIMATED,
                            visible: this.props.filteredNominalVoltages.includes(e.nominalVoltage)
                        }));
                        layers.push(arrowLayer);
                    }
                });
        }

        return layers;
    }
}

LineLayer.layerName = 'LineLayer';

LineLayer.defaultProps = {
    network: null,
    geoData: null,
    getNominalVoltageColor: {type: 'accessor', value: [255, 255, 255]},
    filteredNominalVoltages: [],
    arrowMode: ArrowMode.NONE
};

export default LineLayer;
