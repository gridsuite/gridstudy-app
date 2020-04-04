/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CompositeLayer, ScatterplotLayer, TextLayer} from 'deck.gl';

const SUBSTATION_RADIUS = 500;

function getVoltageLevelRadius(substationRadius, voltageLevel) {
    return substationRadius / voltageLevel.voltageLevelCount * (voltageLevel.voltageLevelIndex + 1)
}

class SubstationLayer extends CompositeLayer {

    renderLayers() {
        let layers = [];

        if (this.props.network != null && this.props.geoData != null) {
            // substations : create one layer per nominal voltage, starting from higher to lower nominal voltage
            this.props.network.getVoltageLevelsBySortedNominalVoltage()
                .forEach(e => {
                    // substations
                    const substationsLayer = new ScatterplotLayer(this.getSubLayerProps({
                        id: 'NominalVoltage' + e.nominalVoltage,
                        data: e.voltageLevels,
                        radiusMinPixels: 1,
                        getPosition: voltageLevel => this.props.geoData.getSubstationPosition(voltageLevel.substationId),
                        getFillColor: this.props.getNominalVoltageColor(e.nominalVoltage),
                        getRadius: voltageLevel => getVoltageLevelRadius(SUBSTATION_RADIUS, voltageLevel),
                        visible: this.props.filteredNominalVoltages.includes(e.nominalVoltage)
                    }));
                    layers.push(substationsLayer);
                });

            // substations labels : create one layer
            // First, we construct the substations where there is at least one voltage level with a nominal voltage
            // present in the filteredVoltageLevels property, in order to handle correctly the substations labels visibility
            const substationsLabelsVisible = this.props.network.substations
                .filter(substation => substation.voltageLevels.find(v => this.props.filteredNominalVoltages.includes(v.nominalVoltage)) !== undefined);

            const substationLabelsLayer = new TextLayer(this.getSubLayerProps({
                id: "Label",
                data: substationsLabelsVisible,
                getPosition: substation => this.props.geoData.getSubstationPosition(substation.id),
                getText: substation => this.props.useName ? substation.name : substation.id,
                getColor: this.props.labelColor,
                fontFamily: 'Roboto',
                getSize: 16,
                getAngle: 0,
                getTextAnchor: 'start',
                getAlignmentBaseline: 'center',
                getPixelOffset: [20, 0],
                visible: this.props.labelsVisible,
                updateTriggers: {
                    getText: this.props.useName
                }
            }));
            layers.push(substationLabelsLayer);
        }

        return layers;
    }
}

SubstationLayer.layerName = 'SubstationLayer';

SubstationLayer.defaultProps = {
    network: null,
    geoData: null,
    getNominalVoltageColor: {type: 'accessor', value: [255, 255, 255]},
    filteredNominalVoltages: [],
    useName: true,
    labelsVisible: false,
    labelColor: {type: 'color', value: [255, 255, 255]}
};

export default SubstationLayer;
