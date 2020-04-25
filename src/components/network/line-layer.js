/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CompositeLayer, PathLayer} from 'deck.gl';

import ArrowLayer from "./layers/arrow-layer";

const ARROW_COUNT = 3;

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

                    // create ARROW_COUNT per line
                    const arrows = e.lines.flatMap(line => {
                        return [...new Array(ARROW_COUNT).keys()].map(index => {
                            return {
                                number: index,
                                line: line
                            }
                        });
                    });

                    const arrowLayer = new ArrowLayer(this.getSubLayerProps({
                        id: 'ArrowNominalVoltage' + e.nominalVoltage,
                        data: arrows,
                        sizeMinPixels: 3,
                        sizeMaxPixels: 10,
                        getDistance: arrow => arrow.number / ARROW_COUNT,
                        getLine: arrow => arrow.line,
                        getLinePositions: line => this.props.geoData.getLinePositions(this.props.network, line),
                        getColor: color,
                        getSize: 700,
                        getSpeedFactor: 3,
                        isInvertDirection: arrow => arrow.line.p1 > 0,
                        animated: true
                    }));
                    layers.push(arrowLayer);
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
    filteredNominalVoltages: []
};

export default LineLayer;
