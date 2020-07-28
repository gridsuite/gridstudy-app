/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CompositeLayer, TextLayer } from 'deck.gl';
import { PathStyleExtension } from '@deck.gl/extensions';
import ArrowLayer, { ArrowDirection } from './layers/arrow-layer';
import ParallelPathLayer from './layers/parallel-path-layer';
import getDistance from 'geolib/es/getDistance';
import { ForkLineLayer } from './fork-line-layer';

const DISTANCE_BETWEEN_ARROWS = 10000.0;
//Constants for Feeders mode
const START_ARROW_POSITION = 0.1;
const END_ARROW_POSITION = 0.9;

export const LineFlowMode = {
    NONE: 'none',
    STATIC_ARROWS: 'staticArrows',
    ANIMATED_ARROWS: 'animatedArrows',
    FEEDERS: 'feeders',
};

const noDashArray = [0, 0];
const dashArray = [15, 10];

function doDash(line) {
    return !line.terminal1Connected || !line.terminal2Connected;
}

function isDisconnected(line) {
    return !line.terminal1Connected && !line.terminal2Connected;
}

function getArrowDirection(p) {
    if (p < 0) {
        return ArrowDirection.FROM_SIDE_2_TO_SIDE_1;
    } else if (p > 0) {
        return ArrowDirection.FROM_SIDE_1_TO_SIDE_2;
    } else {
        return ArrowDirection.NONE;
    }
}

class LineLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: [],
        };
    }

    updateState({ props, oldProps, changeFlags }) {
        let compositeData;
        if (changeFlags.dataChanged) {
            compositeData = [];

            if (props.network != null && props.geoData != null) {
                // group lines by nominal voltage
                const lineNominalVoltageIndexer = (map, line) => {
                    const vl =
                        props.network.getVoltageLevel(line.voltageLevelId1) ||
                        props.network.getVoltageLevel(line.voltageLevelId2);
                    let list = map.get(vl.nominalVoltage);
                    if (!list) {
                        list = [];
                        map.set(vl.nominalVoltage, list);
                    }
                    list.push(line);
                    return map;
                };
                const linesByNominalVoltage = props.data.reduce(
                    lineNominalVoltageIndexer,
                    new Map()
                );

                compositeData = Array.from(linesByNominalVoltage.entries())
                    .map((e) => {
                        return { nominalVoltage: e[0], lines: e[1] };
                    })
                    .sort((a, b) => b.nominalVoltage - a.nominalVoltage);
            }
        } else {
            compositeData = this.state.compositeData;
        }
        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    props.lineFlowMode != oldProps.lineFlowMode))
        ) {
            compositeData.forEach((compositeData) => {
                let lineMap = new Map();
                compositeData.lines.forEach((line) => {
                    const positions = props.geoData.getLinePositions(
                        props.network,
                        line,
                        props.lineFullPath
                    );
                    const cumulativeDistances = props.geoData.getLineDistances(
                        positions
                    );
                    lineMap.set(line.id, {
                        positions: positions,
                        cumulativeDistances: cumulativeDistances,
                        line: line,
                    });
                });
                compositeData.lineMap = lineMap;
            });

            let mapOriginDestination = new Map();
            // add arrows
            compositeData.forEach((compositeData) => {
                compositeData.activePower = [];
                // create one arrow each DISTANCE_BETWEEN_ARROWS
                const lineMap = compositeData.lineMap;
                compositeData.arrows = compositeData.lines.flatMap((line) => {
                    // calculate distance between 2 substations as a raw estimate of line size
                    const directLinePositions = props.geoData.getLinePositions(
                        props.network,
                        line,
                        false
                    );
                    const directLineDistance = getDistance(
                        {
                            latitude: directLinePositions[0][1],
                            longitude: directLinePositions[0][0],
                        },
                        {
                            latitude: directLinePositions[1][1],
                            longitude: directLinePositions[1][0],
                        }
                    );
                    const arrowCount = Math.ceil(
                        directLineDistance / DISTANCE_BETWEEN_ARROWS
                    );

                    let lineData = lineMap.get(line.id);
                    let arrowDirection = getArrowDirection(line.p1);

                    let coordinates1 = props.geoData.labelDisplayPosition(
                        lineData.positions,
                        lineData.cumulativeDistances,
                        START_ARROW_POSITION,
                        arrowDirection
                    );
                    let coordinates2 = props.geoData.labelDisplayPosition(
                        lineData.positions,
                        lineData.cumulativeDistances,
                        END_ARROW_POSITION,
                        arrowDirection
                    );
                    if (coordinates1 !== null && coordinates2 !== null) {
                        compositeData.activePower.push({
                            line: line,
                            p: line.p1,
                            printPosition: [
                                coordinates1.position.longitude,
                                coordinates1.position.latitude,
                            ],
                            offset: coordinates1.offset,
                        });
                        compositeData.activePower.push({
                            line: line,
                            p: line.p2,
                            printPosition: [
                                coordinates2.position.longitude,
                                coordinates2.position.latitude,
                            ],
                            offset: coordinates2.offset,
                        });
                    }

                    line.cumulativeDistances = lineData.cumulativeDistances;
                    line.positions = lineData.positions;
                    if (props.lineFlowMode !== LineFlowMode.FEEDERS) {
                        return [...new Array(arrowCount).keys()].map(
                            (index) => {
                                return {
                                    distance: index / arrowCount,
                                    line: line,
                                };
                            }
                        );
                    }
                    //If we use Feeders Mode, we build only two arrows
                    return [
                        {
                            distance: START_ARROW_POSITION,
                            line: line,
                        },
                        {
                            distance: END_ARROW_POSITION,
                            line: line,
                        },
                    ];
                });

                //find lines with same subsations set
                compositeData.lines.forEach((line) => {
                    const key =
                        line.voltageLevelId1 > line.voltageLevelId2
                            ? line.voltageLevelId1 + '##' + line.voltageLevelId2
                            : line.voltageLevelId2 +
                              '##' +
                              line.voltageLevelId1;
                    let val = mapOriginDestination.get(key);
                    if (val == null)
                        mapOriginDestination.set(key, new Set([line]));
                    else {
                        mapOriginDestination.set(key, val.add(line));
                    }

                    const path = this.props.geoData.getLinePositions(
                        this.props.network,
                        line,
                        this.props.lineFullPath
                    );

                    line.angle = Math.atan2(
                        path[0][0] - path[path.length - 1][0],
                        path[0][1] - path[path.length - 1][1]
                    );
                    if (line.angle < 0) line.angle += 2 * Math.PI;
                    line.origin = path[0];
                    line.end = path[1];
                    line.moveOriginPoint = path.length <= 2 ? 1.0 : 0.0;
                });
            });

            // calculate offset for line with same subsation set
            mapOriginDestination.forEach((samePathLine) => {
                let offset = -(samePathLine.size - 1) / 2;
                samePathLine.forEach((line) => {
                    line.parallelIndex = offset;
                    offset += 1;
                });
            });
        }
        this.setState({ compositeData: compositeData });
    }

    renderLayers() {
        const layers = [];
        // lines : create one layer per nominal voltage, starting from higher to lower nominal voltage
        this.state.compositeData.forEach((compositeData) => {
            const color = this.props.getNominalVoltageColor(
                compositeData.nominalVoltage
            );
            const lineLayer = new ParallelPathLayer(
                this.getSubLayerProps({
                    id: 'LineNominalVoltage' + compositeData.nominalVoltage,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getPath: (line) =>
                        this.props.geoData.getLinePositions(
                            this.props.network,
                            line,
                            this.props.lineFullPath
                        ),
                    getColor: (line) =>
                        isDisconnected(line)
                            ? this.props.disconnectedLineColor
                            : color,
                    getWidth: 2,
                    getParallelIndex: (line) => line.parallelIndex,
                    getLineAngle: (line) => line.angle,
                    getMoveOriginPoint: (d) => d.moveOriginPoint,
                    getEnd: (d) => d.origin,
                    getDistanceBetweenLines: () =>
                        this.props.distanceBetweenLines,
                    getMaxParallelOffset: () => this.props.maxParallelOffset,
                    getMinParallelOffset: () => this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),
                    updateTriggers: {
                        getPath: [this.props.lineFullPath],
                        getColor: [this.props.disconnectedLineColor],
                    },
                    getDashArray: (line) =>
                        doDash(line) ? dashArray : noDashArray,
                    extensions: [new PathStyleExtension({ dash: true })],
                })
            );
            layers.push(lineLayer);

            const arrowLayer = new ArrowLayer(
                this.getSubLayerProps({
                    id: 'ArrowNominalVoltage' + compositeData.nominalVoltage,
                    data: compositeData.arrows,
                    sizeMinPixels: 3,
                    sizeMaxPixels: 7,
                    getDistance: (arrow) => arrow.distance,
                    getLine: (arrow) => arrow.line,
                    getLinePositions: (line) =>
                        this.props.geoData.getLinePositions(
                            this.props.network,
                            line,
                            this.props.lineFullPath
                        ),
                    getColor: color,
                    getSize: 700,
                    getSpeedFactor: 3,
                    getParallelIndex: (arrow) => arrow.line.parallelIndex,
                    getDistanceBetweenLines: () =>
                        this.props.distanceBetweenLines,
                    getMaxParallelOffset: () => this.props.maxParallelOffset,
                    getMinParallelOffset: () => this.props.minParallelOffset,
                    getMoveOriginPoint: (d) => d.moveOriginPoint,
                    getDirection: (arrow) => {
                        return getArrowDirection(arrow.line.p1);
                    },
                    animated:
                        this.props.lineFlowMode ===
                        LineFlowMode.ANIMATED_ARROWS,
                    visible:
                        this.props.lineFlowMode !== LineFlowMode.NONE &&
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ),
                    updateTriggers: {
                        getLinePositions: [this.props.lineFullPath],
                    },
                })
            );
            layers.push(arrowLayer);

            const startFork = new ForkLineLayer(
                this.getSubLayerProps({
                    id: 'LineForkStart' + compositeData.nominalVoltage,
                    getSourcePosition: (d) => d.origin,
                    getTargetPosition: (d) => d.end,
                    getMoveOriginPoint: (d) => d.moveOriginPoint,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) =>
                        isDisconnected(line)
                            ? this.props.disconnectedLineColor
                            : color,
                    getWidth: 2,
                    getParallelIndex: (line) => line.parallelIndex,
                    getAngle: (line) => line.angle,
                    getDistanceBetweenLines: () =>
                        this.props.distanceBetweenLines,
                    getMaxParallelOffset: () => this.props.maxParallelOffset,
                    getMinParallelOffset: () => this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),

                    updateTriggers: {
                        getPath: [this.props.lineFullPath],
                        getColor: [this.props.disconnectedLineColor],
                    },
                })
            );
            layers.push(startFork);

            const endFork = new ForkLineLayer(
                this.getSubLayerProps({
                    id: 'LineForkEnd' + compositeData.nominalVoltage,
                    getSourcePosition: (d) => d.end,
                    getTargetPosition: (d) => d.origin,
                    getMoveOriginPoint: (d) => d.moveOriginPoint,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) =>
                        isDisconnected(line)
                            ? this.props.disconnectedLineColor
                            : color,
                    getWidth: 2,
                    getParallelIndex: (line) => -line.parallelIndex,
                    getAngle: (line) => line.angle + Math.PI,
                    getDistanceBetweenLines: () =>
                        this.props.distanceBetweenLines,
                    getMaxParallelOffset: () => this.props.maxParallelOffset,
                    getMinParallelOffset: () => this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),
                    updateTriggers: {
                        getPath: [this.props.lineFullPath],
                        getColor: [this.props.disconnectedLineColor],
                    },
                })
            );
            layers.push(endFork);

            // lines active power
            const lineActivePowerLabelsLayer = new TextLayer(
                this.getSubLayerProps({
                    id: 'ActivePower' + compositeData.nominalVoltage,
                    data: compositeData.activePower,
                    getText: (activePower) =>
                        activePower.p !== undefined
                            ? activePower.p.toString()
                            : '',
                    getPosition: (activePower) => activePower.printPosition,
                    getColor: this.props.labelColor,
                    fontFamily: 'Roboto',
                    getSize: this.props.labelSize,
                    getAngle: 0,
                    getPixelOffset: (activePower) => activePower.offset,
                    getTextAnchor: 'middle',
                    visible:
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ) && this.props.labelsVisible,
                    updateTriggers: {
                        getPosition: [this.props.lineFullPath],
                        getPixelOffset: [this.props.lineFullPath],
                    },
                })
            );
            layers.push(lineActivePowerLabelsLayer);
        });

        return layers;
    }
}

LineLayer.layerName = 'LineLayer';

LineLayer.defaultProps = {
    network: null,
    geoData: null,
    getNominalVoltageColor: { type: 'accessor', value: [255, 255, 255] },
    disconnectedLineColor: { type: 'color', value: [255, 255, 255] },
    filteredNominalVoltages: [],
    lineFlowMode: LineFlowMode.NONE,
    lineFullPath: true,
    labelSize: 16,
    distanceBetweenLines: 1000,
    maxParallelOffset: 2,
    minParallelOffset: 0.25,
};

export default LineLayer;
