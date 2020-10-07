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
import ForkLineLayer from './layers/fork-line-layer';
import getDistance from 'geolib/es/getDistance';
import { getOverLoadLineColor } from '../../utils/colors';

const DISTANCE_BETWEEN_ARROWS = 10000.0;
//Constants for Feeders mode
const START_ARROW_POSITION = 0.1;
const END_ARROW_POSITION = 0.9;

export const LineFlowMode = {
    STATIC_ARROWS: 'staticArrows',
    ANIMATED_ARROWS: 'animatedArrows',
    FEEDERS: 'feeders',
};

export const LineFlowColorMode = {
    NOMINAL_VOLTAGE: 'nominalVoltage',
    OVERLOADS: 'overloads',
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

function getLineColor(line, color, props) {
    if (props.lineFlowColorMode === LineFlowColorMode.NOMINAL_VOLTAGE) {
        if (isDisconnected(line)) {
            return props.disconnectedLineColor;
        } else {
            return color;
        }
    } else if (props.lineFlowColorMode === LineFlowColorMode.OVERLOADS) {
        let limits = [line.permanentLimit1, line.permanentLimit2];
        let intensities = [line.i1, line.i2];
        let iColor1, iColor2;
        let iColor = [iColor1, iColor2];

        for (let i = 0; i < 2; ++i) {
            if (
                limits[i] === undefined ||
                intensities[i] === undefined ||
                intensities[i] === 0
            ) {
                iColor[i] = 0;
            } else {
                let threshold =
                    (props.lineFlowAlertThreshold * limits[i]) / 100;
                if (intensities[i] > 0 && intensities[i] < threshold) {
                    iColor[i] = 1;
                } else if (
                    intensities[i] >= threshold &&
                    intensities[i] < limits[i]
                ) {
                    iColor[i] = 2;
                } else {
                    iColor[i] = 3;
                }
            }
        }
        return getOverLoadLineColor(Math.max(iColor[0], iColor[1]));
    } else {
        return color;
    }
}

class LineLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: [],
        };
    }

    //TODO this is a huge function, refactor
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

                compositeData.forEach((compositeData) => {
                    //find lines with same subsations set
                    let mapOriginDestination = new Map();
                    compositeData.mapOriginDestination = mapOriginDestination;
                    compositeData.lines.forEach((line) => {
                        const key =
                            line.voltageLevelId1 > line.voltageLevelId2
                                ? line.voltageLevelId1 +
                                  '##' +
                                  line.voltageLevelId2
                                : line.voltageLevelId2 +
                                  '##' +
                                  line.voltageLevelId1;
                        let val = mapOriginDestination.get(key);
                        if (val == null)
                            mapOriginDestination.set(key, new Set([line]));
                        else {
                            mapOriginDestination.set(key, val.add(line));
                        }
                    });
                });
            }
        } else {
            compositeData = this.state.compositeData;
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                oldProps.lineParallelPath !== props.lineParallelPath)
        ) {
            compositeData.forEach((compositeData) => {
                const mapOriginDestination = compositeData.mapOriginDestination;
                // calculate index for line with same subsation set
                // The index is a real number in a normalized unit.
                // +1 => distanceBetweenLines on side
                // -1 => distanceBetweenLines on the other side
                // 0.5 => half of distanceBetweenLines
                //The special value 9999 or -9999 mean that we
                //don't want parallel path translations for this line
                mapOriginDestination.forEach((samePathLine) => {
                    let index = -(samePathLine.size - 1) / 2;
                    samePathLine.forEach((line) => {
                        if (props.lineParallelPath && samePathLine.size > 1) {
                            line.parallelIndex = index;
                            index += 1;
                        } else {
                            line.parallelIndex = 9999;
                        }
                    });
                });
            });
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                oldProps.lineFullPath !== props.lineFullPath)
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
        }

        if (changeFlags.dataChanged) {
            compositeData.forEach((compositeData) => {
                compositeData.lines.forEach((line) => {
                    const positions = compositeData.lineMap.get(line.id)
                        .positions;
                    //the first and last in positions doesn't depend on lineFullPath
                    line.origin = positions[0];
                    line.end = positions[positions.length - 1];

                    //TODO right now the angle doesn't depend on linefullpath (we always use the angle between the substations)
                    //but in the future, we will also compute the angle between the substations and the first point to have forklines
                    //going in the direction of the first segment, not the direction of the line between the substations. We will still
                    //need to keep the angle between the substations for the shift of the line, so we will have 3 angles.
                    let angle = props.geoData.getMapAngle(
                        positions[0],
                        positions[positions.length - 1]
                    );
                    angle = (angle * Math.PI) / 180 + Math.PI;
                    if (line.angle < 0) angle += 2 * Math.PI;
                    line.angle = angle;
                });
            });
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    props.lineParallelPath !== oldProps.lineParallelPath))
        ) {
            //add labels
            compositeData.forEach((compositeData) => {
                compositeData.activePower = [];
                compositeData.lines.forEach((line) => {
                    let lineData = compositeData.lineMap.get(line.id);
                    let arrowDirection = getArrowDirection(line.p1);
                    let coordinates1 = props.geoData.labelDisplayPosition(
                        lineData.positions,
                        lineData.cumulativeDistances,
                        START_ARROW_POSITION,
                        arrowDirection,
                        line.parallelIndex,
                        (line.angle * 180) / Math.PI,
                        props.distanceBetweenLines
                    );
                    let coordinates2 = props.geoData.labelDisplayPosition(
                        lineData.positions,
                        lineData.cumulativeDistances,
                        END_ARROW_POSITION,
                        arrowDirection,
                        line.parallelIndex,
                        (line.angle * 180) / Math.PI,
                        props.distanceBetweenLines
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
                });
            });
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    //For lineFlowMode, recompute only if mode goes to or from LineFlowMode.FEEDERS
                    //because for LineFlowMode.STATIC_ARROWS and LineFlowMode.ANIMATED_ARROWS it's the same
                    (props.lineFlowMode !== oldProps.lineFlowMode &&
                        (props.lineFlowMode === LineFlowMode.FEEDERS ||
                            oldProps.lineFlowMode === LineFlowMode.FEEDERS))))
        ) {
            // add arrows
            compositeData.forEach((compositeData) => {
                const lineMap = compositeData.lineMap;

                // create one arrow each DISTANCE_BETWEEN_ARROWS
                compositeData.arrows = compositeData.lines.flatMap((line) => {
                    let lineData = lineMap.get(line.id);
                    line.cumulativeDistances = lineData.cumulativeDistances;
                    line.positions = lineData.positions;

                    if (props.lineFlowMode === LineFlowMode.FEEDERS) {
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
                    }

                    // calculate distance between 2 substations as a raw estimate of line size
                    const directLinePositions = props.geoData.getLinePositions(
                        props.network,
                        line,
                        false
                    );
                    //TODO this doesn't need to be an approximation anymore, we have the value anyway
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

                    return [...new Array(arrowCount).keys()].map((index) => {
                        return {
                            distance: index / arrowCount,
                            line: line,
                        };
                    });
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
                    getColor: (line) => getLineColor(line, color, this.props),
                    getWidth: 2,
                    getLineParallelIndex: (line) => line.parallelIndex,
                    getLineAngle: (line) => line.angle,
                    distanceBetweenLines: this.props.distanceBetweenLines,
                    maxParallelOffset: this.props.maxParallelOffset,
                    minParallelOffset: this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),
                    updateTriggers: {
                        getPath: [this.props.lineFullPath],
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                        ],
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
                    getColor: (arrow) =>
                        getLineColor(arrow.line, color, this.props),
                    getSize: 700,
                    getSpeedFactor: 3,
                    getLineParallelIndex: (arrow) => arrow.line.parallelIndex,
                    getLineAngle: (arrow) => arrow.line.angle,
                    getDistanceBetweenLines: this.props.distanceBetweenLines,
                    maxParallelOffset: this.props.maxParallelOffset,
                    minParallelOffset: this.props.minParallelOffset,
                    getDirection: (arrow) => {
                        return getArrowDirection(arrow.line.p1);
                    },
                    animated:
                        this.props.showLineFlow &&
                        this.props.lineFlowMode ===
                            LineFlowMode.ANIMATED_ARROWS,
                    visible:
                        this.props.showLineFlow &&
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ),
                    updateTriggers: {
                        getLinePositions: [this.props.lineFullPath],
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getColor: [
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                        ],
                    },
                })
            );
            layers.push(arrowLayer);

            const startFork = new ForkLineLayer(
                this.getSubLayerProps({
                    id: 'LineForkStart' + compositeData.nominalVoltage,
                    getSourcePosition: (line) => line.origin,
                    getTargetPosition: (line) => line.end,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) => getLineColor(line, color, this.props),
                    getWidth: 2,
                    getLineParallelIndex: (line) => line.parallelIndex,
                    getLineAngle: (line) => line.angle,
                    getDistanceBetweenLines: this.props.distanceBetweenLines,
                    getMaxParallelOffset: this.props.maxParallelOffset,
                    getMinParallelOffset: this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),
                    updateTriggers: {
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getSourcePosition: [this.props.lineFullPath],
                        getTargetPosition: [this.props.lineFullPath],
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                        ],
                    },
                })
            );
            layers.push(startFork);

            const endFork = new ForkLineLayer(
                this.getSubLayerProps({
                    id: 'LineForkEnd' + compositeData.nominalVoltage,
                    getSourcePosition: (line) => line.end,
                    getTargetPosition: (line) => line.origin,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) => getLineColor(line, color, this.props),
                    getWidth: 2,
                    getLineParallelIndex: (line) => -line.parallelIndex,
                    getLineAngle: (line) => line.angle + Math.PI,
                    getDistanceBetweenLines: this.props.distanceBetweenLines,
                    getMaxParallelOffset: this.props.maxParallelOffset,
                    getMinParallelOffset: this.props.minParallelOffset,
                    visible: this.props.filteredNominalVoltages.includes(
                        compositeData.nominalVoltage
                    ),
                    updateTriggers: {
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getSourcePosition: [this.props.lineFullPath],
                        getTargetPosition: [this.props.lineFullPath],
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                        ],
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
                            ? Math.round(activePower.p).toString()
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
                        getPosition: [
                            this.props.lineFullPath,
                            this.props.lineParallelPath,
                        ],
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
    lineFlowMode: LineFlowMode.FEEDERS,
    lineFlowColorMode: LineFlowColorMode.NOMINAL_VOLTAGE,
    lineFlowAlertThreshold: 100,
    showLineFlow: true,
    lineFullPath: true,
    lineParallelPath: true,
    labelSize: 16,
    distanceBetweenLines: 1000,
    maxParallelOffset: 100,
    minParallelOffset: 3,
};

export default LineLayer;
