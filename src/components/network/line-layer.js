/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CompositeLayer, PathLayer, TextLayer} from 'deck.gl';

import ArrowLayer, {ArrowDirection} from "./layers/arrow-layer";
import getDistance from "geolib/es/getDistance";
import cheapRuler from 'cheap-ruler';

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

    updateState({props, oldProps, changeFlags}) {
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
                    compositeData.activePower = [];
                    // create one arrow each DISTANCE_BETWEEN_ARROWS
                    compositeData.arrows = compositeData.lines.flatMap(line => {
                        // calculate distance between 2 substations as a raw estimate of line size
                        const directLinePositions = props.geoData.getLinePositions(props.network, line, false);
                        const directLineDistance = getDistance({latitude: directLinePositions[0][1], longitude: directLinePositions[0][0]},
                                                         {latitude: directLinePositions[1][1], longitude: directLinePositions[1][0]});
                        const arrowCount = Math.ceil(directLineDistance / DISTANCE_BETWEEN_ARROWS);

                        const positions = props.geoData.getLinePositions(props.network, line, props.lineFullPath);
                        let ruler = cheapRuler(positions[0][1], 'meters');
                        let lineLength = ruler.lineDistance(positions);
                        let coordinates1 = props.geoData.getCoordinateInLine(positions, lineLength, 15);
                        let coordinates2 = props.geoData.getCoordinateInLine(positions, lineLength, 85);

                        if (coordinates1 !== null && coordinates2 !== null) {
                            compositeData.activePower.push({
                                line: line,
                                p: line.p1,
                                percent: 15,
                                printPosition: [coordinates1.distance.longitude, coordinates1.distance.latitude],
                                offset: coordinates1.offset,
                                });
                            compositeData.activePower.push({
                                line: line,
                                p: line.p2,
                                percent: 85,
                                printPosition: [coordinates2.distance.longitude, coordinates2.distance.latitude],
                                offset: coordinates2.offset});
                        }

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
        //update the label position when toggling fullPath
        if (changeFlags.propsChanged) {
            if (oldProps.lineFullPath !== undefined && props.lineFullPath !== oldProps.lineFullPath) {
                this.state.compositeData.forEach(compositeData => {
                   compositeData.activePower.forEach(activePower => {
                       const positions = props.geoData.getLinePositions(props.network, activePower.line, props.lineFullPath);
                       let ruler = cheapRuler(positions[0][1], 'meters');
                       let lineLength = ruler.lineDistance(positions);
                       let coordinates = props.geoData.getCoordinateInLine(positions, lineLength, activePower.percent);
                       activePower.printPosition = [coordinates.distance.longitude, coordinates.distance.latitude];
                       activePower.offset = coordinates.offset;
                   });
               });
            }
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

            // lines active power
            const lineActivePowerLabelsLayer = new TextLayer(this.getSubLayerProps({
                id: "ActivePower" + compositeData.nominalVoltage,
                data: compositeData.activePower,
                getText: activePower => activePower.p.toString(),
                getPosition: activePower => activePower.printPosition,
                getColor: this.props.labelColor,
                fontFamily: 'Roboto',
                getSize: 25,
                getAngle: 0,
                getPixelOffset: activePower => activePower.offset,
                getTextAnchor: 'middle',
                visible: this.props.filteredNominalVoltages.includes(compositeData.nominalVoltage) && this.props.labelsVisible,
                updateTriggers: {
                    getPosition: [this.props.lineFullPath],
                    getPixelOffset: [this.props.lineFullPath]
                }
            }));
            layers.push(lineActivePowerLabelsLayer);

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
