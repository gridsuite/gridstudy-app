/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CompositeLayer, TextLayer } from 'deck.gl';
import ScatterplotLayerExt from './layers/scatterplot-layer-ext';

const SUBSTATION_RADIUS = 500;

const SUBSTATION_RADIUS_MAX_PIXEL = 5;

const voltageLevelNominalVoltageIndexer = (map, voltageLevel) => {
    let list = map.get(voltageLevel.nominalVoltage);
    if (!list) {
        list = [];
        map.set(voltageLevel.nominalVoltage, list);
    }
    list.push(voltageLevel);
    return map;
};

class SubstationLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: [],
            substationsLabels: [],
        };
    }

    updateState({ props, oldProps, changeFlags }) {
        if (changeFlags.dataChanged) {
            let metaVoltageLevelsByNominalVoltage = new Map();

            if (props.network != null && props.geoData != null) {
                // create meta voltage levels
                // a meta voltage level is made of:
                //   - a list of voltage level that belong to same substation and with same nominal voltage
                //   - index of the voltage levels nominal voltage in the substation nominal voltage list
                props.data.forEach((substation) => {
                    // index voltage levels of this substation by its nominal voltage (this is because we might
                    // have several voltage levels with the same nominal voltage in the same substation)
                    const voltageLevelsByNominalVoltage = substation.voltageLevels.reduce(
                        voltageLevelNominalVoltageIndexer,
                        new Map()
                    );

                    // sorted distinct nominal voltages for this substation
                    const nominalVoltages = [
                        ...new Set(
                            substation.voltageLevels
                                .map(
                                    (voltageLevel) =>
                                        voltageLevel.nominalVoltage
                                )
                                .sort(
                                    (nominalVoltage1, nominalVoltage2) =>
                                        nominalVoltage1 - nominalVoltage2
                                )
                        ),
                    ];

                    // add to global map of meta voltage levels indexed by nominal voltage
                    Array.from(voltageLevelsByNominalVoltage.entries()).forEach(
                        (e) => {
                            const nominalVoltage = e[0];
                            const voltageLevels = e[1];

                            let metaVoltageLevels = metaVoltageLevelsByNominalVoltage.get(
                                nominalVoltage
                            );
                            if (!metaVoltageLevels) {
                                metaVoltageLevels = [];
                                metaVoltageLevelsByNominalVoltage.set(
                                    nominalVoltage,
                                    metaVoltageLevels
                                );
                            }
                            metaVoltageLevels.push({
                                voltageLevels,
                                nominalVoltageIndex: nominalVoltages.indexOf(
                                    nominalVoltage
                                ),
                            });
                        }
                    );
                });
            }

            // sort the map by descending nominal voltages
            const metaVoltageLevelsByNominalVoltageArray = Array.from(
                metaVoltageLevelsByNominalVoltage
            )
                .map((e) => {
                    return { nominalVoltage: e[0], metaVoltageLevels: e[1] };
                })
                .sort((a, b) => b.nominalVoltage - a.nominalVoltage);

            this.setState({
                metaVoltageLevelsByNominalVoltage: metaVoltageLevelsByNominalVoltageArray,
            });
        }

        if (
            props.filteredNominalVoltages !== oldProps.filteredNominalVoltages
        ) {
            let substationsLabels = [];

            if (props.network != null && props.geoData != null) {
                // we construct the substations where there is at least one voltage level with a nominal voltage
                // present in the filteredVoltageLevels property, in order to handle correctly the substations labels visibility
                substationsLabels = props.network.substations.filter(
                    (substation) =>
                        substation.voltageLevels.find((v) =>
                            props.filteredNominalVoltages.includes(
                                v.nominalVoltage
                            )
                        ) !== undefined
                );
            }

            this.setState({ substationsLabels });
        }
    }

    renderLayers() {
        const layers = [];

        // substations : create one layer per nominal voltage, starting from higher to lower nominal voltage
        this.state.metaVoltageLevelsByNominalVoltage.forEach((e) => {
            const substationsLayer = new ScatterplotLayerExt(
                this.getSubLayerProps({
                    id: 'NominalVoltage' + e.nominalVoltage,
                    data: e.metaVoltageLevels,
                    radiusMinPixels: 1,
                    getRadiusMaxPixels: (metaVoltageLevel) =>
                        SUBSTATION_RADIUS_MAX_PIXEL *
                        (metaVoltageLevel.nominalVoltageIndex + 1),
                    getPosition: (metaVoltageLevel) =>
                        this.props.geoData.getSubstationPosition(
                            metaVoltageLevel.voltageLevels[0].substationId
                        ),
                    getFillColor: this.props.getNominalVoltageColor(
                        e.nominalVoltage
                    ),
                    getRadius: (voltageLevel) =>
                        SUBSTATION_RADIUS *
                        (voltageLevel.nominalVoltageIndex + 1),
                    visible: this.props.filteredNominalVoltages.includes(
                        e.nominalVoltage
                    ),
                })
            );
            layers.push(substationsLayer);
        });

        // substations labels : create one layer
        const substationLabelsLayer = new TextLayer(
            this.getSubLayerProps({
                id: 'Label',
                data: this.state.substationsLabels,
                getPosition: (substation) =>
                    this.props.geoData.getSubstationPosition(substation.id),
                getText: (substation) =>
                    this.props.useName ? substation.name : substation.id,
                getColor: this.props.labelColor,
                fontFamily: 'Roboto',
                getSize: this.props.labelSize,
                getAngle: 0,
                getTextAnchor: 'start',
                getAlignmentBaseline: 'center',
                getPixelOffset: [20, 0],
                visible: this.props.labelsVisible,
                updateTriggers: {
                    getText: this.props.useName,
                },
            })
        );
        layers.push(substationLabelsLayer);

        return layers;
    }
}

SubstationLayer.layerName = 'SubstationLayer';

SubstationLayer.defaultProps = {
    network: null,
    geoData: null,
    getNominalVoltageColor: { type: 'accessor', value: [255, 255, 255] },
    filteredNominalVoltages: [],
    useName: true,
    labelsVisible: false,
    labelColor: { type: 'color', value: [255, 255, 255] },
    labelSize: 16,
};

export default SubstationLayer;
