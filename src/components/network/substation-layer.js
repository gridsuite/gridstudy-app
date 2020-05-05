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

    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: [],
            substationsLabels: []
        };
    }

    updateState({props, oldProps, changeFlags}) {

        if (changeFlags.dataChanged) {
            let compositeData = [];

            if (props.network != null && props.geoData != null) {

                // group voltage levels by nominal voltage

                const voltageLevelNominalVoltageIndexer = (map, voltageLevel) => {
                    let list = map.get(voltageLevel.nominalVoltage);
                    if (!list) {
                        list = [];
                        map.set(voltageLevel.nominalVoltage, list);
                    }
                    list.push(voltageLevel);
                    return map;
                };
                const voltageLevelsByNominalVoltage = props.data.reduce(voltageLevelNominalVoltageIndexer, new Map());

                compositeData = Array.from(voltageLevelsByNominalVoltage.entries())
                    .map(e => {
                        return {nominalVoltage: e[0], voltageLevels: e[1]};
                    })
                    .sort((a, b) => b.nominalVoltage - a.nominalVoltage);
            }

            this.setState({compositeData});
        }

        if (props.filteredNominalVoltages !== oldProps.filteredNominalVoltages) {
            let substationsLabels = [];

            if (props.network != null && props.geoData != null) {
                // we construct the substations where there is at least one voltage level with a nominal voltage
                // present in the filteredVoltageLevels property, in order to handle correctly the substations labels visibility
                substationsLabels = props.network.substations
                    .filter(substation => substation.voltageLevels.find(v => props.filteredNominalVoltages.includes(v.nominalVoltage)) !== undefined);
            }

            this.setState({substationsLabels});
        }
    }

    renderLayers() {
        const layers = [];

        // substations : create one layer per nominal voltage, starting from higher to lower nominal voltage
        this.state.compositeData.forEach(compositeData => {
            // substations
            const substationsLayer = new ScatterplotLayer(this.getSubLayerProps({
                id: 'NominalVoltage' + compositeData.nominalVoltage,
                data: compositeData.voltageLevels,
                radiusMinPixels: 1,
                getPosition: voltageLevel => this.props.geoData.getSubstationPosition(voltageLevel.substationId),
                getFillColor: this.props.getNominalVoltageColor(compositeData.nominalVoltage),
                getRadius: voltageLevel => getVoltageLevelRadius(SUBSTATION_RADIUS, voltageLevel),
                visible: this.props.filteredNominalVoltages.includes(compositeData.nominalVoltage)
            }));
            layers.push(substationsLayer);
        });

        // substations labels : create one layer
        const substationLabelsLayer = new TextLayer(this.getSubLayerProps({
            id: "Label",
            data: this.state.substationsLabels,
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
