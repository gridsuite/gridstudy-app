/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CompositeLayer, PathLayer} from 'deck.gl';

class LineLayer extends CompositeLayer {

    renderLayers() {
        const layers = [];

        if (this.props.network != null && this.props.geoData != null) {
            // lines : create one layer per nominal voltage, starting from higher to lower nominal voltage
            this.props.network.getLinesBySortedNominalVoltage()
                .forEach(e => {
                    const lineLayer = new PathLayer(this.getSubLayerProps({
                        id: 'NominalVoltage' + e.nominalVoltage,
                        data: e.lines,
                        widthScale: 20,
                        widthMinPixels: 1,
                        widthMaxPixels: 2,
                        getPath: line => this.props.geoData.getLinePositions(this.props.network, line),
                        getColor: this.props.getNominalVoltageColor(e.nominalVoltage),
                        getWidth: 2,
                        visible: this.props.filteredNominalVoltages.includes(e.nominalVoltage)
                    }));
                    layers.push(lineLayer);
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
