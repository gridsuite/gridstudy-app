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
import {
    SUBSTATION_RADIUS,
    SUBSTATION_RADIUS_MAX_PIXEL,
    SUBSTATION_RADIUS_MIN_PIXEL,
} from './constants';

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

function doDash(lineConnection) {
    return (
        !lineConnection.terminal1Connected || !lineConnection.terminal2Connected
    );
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

export const LineLoadingZone = {
    UNKNOWN: 0,
    SAFE: 1,
    WARNING: 2,
    OVERLOAD: 3,
};

function getLineLoadingZoneOfSide(limit, intensity, lineFlowAlertThreshold) {
    if (limit === undefined || intensity === undefined || intensity === 0) {
        return LineLoadingZone.UNKNOWN;
    } else {
        let threshold = (lineFlowAlertThreshold * limit) / 100;
        if (intensity > 0 && intensity < threshold) {
            return LineLoadingZone.SAFE;
        } else if (intensity >= threshold && intensity < limit) {
            return LineLoadingZone.WARNING;
        } else {
            return LineLoadingZone.OVERLOAD;
        }
    }
}

function getLineLoadingZone(line, lineFlowAlertThreshold) {
    const zone1 = getLineLoadingZoneOfSide(
        line.permanentLimit1,
        line.i1,
        lineFlowAlertThreshold
    );
    const zone2 = getLineLoadingZoneOfSide(
        line.permanentLimit2,
        line.i2,
        lineFlowAlertThreshold
    );
    return Math.max(zone1, zone2);
}

function getLineLoadingZoneColor(zone) {
    if (zone === LineLoadingZone.UNKNOWN) {
        return [128, 128, 128]; // grey
    } else if (zone === LineLoadingZone.SAFE) {
        return [107, 178, 40]; // green
    } else if (zone === LineLoadingZone.WARNING) {
        return [210, 179, 63]; // yellow
    } else if (zone === LineLoadingZone.OVERLOAD) {
        return [255, 0, 0]; // red
    } else {
        throw new Error('Unsupported line loading zone: ' + zone);
    }
}

function getLineColor(line, nominalVoltageColor, props, lineConnection) {
    if (props.lineFlowColorMode === LineFlowColorMode.NOMINAL_VOLTAGE) {
        if (
            !lineConnection.terminal1Connected &&
            !lineConnection.terminal2Connected
        ) {
            return props.disconnectedLineColor;
        } else {
            return nominalVoltageColor;
        }
    } else if (props.lineFlowColorMode === LineFlowColorMode.OVERLOADS) {
        const zone = getLineLoadingZone(line, props.lineFlowAlertThreshold);
        return getLineLoadingZoneColor(zone);
    } else {
        return nominalVoltageColor;
    }
}

export const ArrowSpeed = {
    STOPPED: 0,
    SLOW: 1,
    MEDIUM: 2,
    FAST: 3,
    CRAZY: 4,
};

function getArrowSpeedOfSide(limit, intensity) {
    if (limit === undefined || intensity === undefined || intensity === 0) {
        return ArrowSpeed.STOPPED;
    } else {
        if (intensity > 0 && intensity < limit / 3) {
            return ArrowSpeed.SLOW;
        } else if (intensity >= limit / 3 && intensity < (limit * 2) / 3) {
            return ArrowSpeed.MEDIUM;
        } else if (intensity >= (limit * 2) / 3 && intensity < limit) {
            return ArrowSpeed.FAST;
        } else {
            // > limit
            return ArrowSpeed.CRAZY;
        }
    }
}

function getArrowSpeed(line) {
    const speed1 = getArrowSpeedOfSide(line.permanentLimit1, line.i1);
    const speed2 = getArrowSpeedOfSide(line.permanentLimit2, line.i2);
    return Math.max(speed1, speed2);
}

function getArrowSpeedFactor(speed) {
    switch (speed) {
        case ArrowSpeed.STOPPED:
            return 0;
        case ArrowSpeed.SLOW:
            return 0.5;
        case ArrowSpeed.MEDIUM:
            return 2;
        case ArrowSpeed.FAST:
            return 4;
        case ArrowSpeed.CRAZY:
            return 10;
        default:
            throw new Error('Unknown arrow speed: ' + speed);
    }
}

// a frame is 16 ms at 60fps (target render for most browser)
const tsThreshold = 16;
const PATH_UPDATED = 'lastPathUpdate';
const LINE_UPDATED = 'lineUpdated';
const PROXIMITY_UPDATED = 'lastPathUpdate';
const ARROW_UPDATE = 'lastArrowUpdate';

class LineLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            linesConnection: new Map(),
            lineMap: new Map(),
            layers: new Map(),
            linesByNominalVoltage: undefined,
        };
    }

    getVoltageLevelIndex(voltageLevelId) {
        const { network } = this.props;
        const vl = network.getVoltageLevel(voltageLevelId);
        const substation = network.getSubstation(vl.substationId);
        return (
            [
                ...new Set(
                    substation.voltageLevels.map((vl) => vl.nominalVoltage) // only one voltage level
                ),
            ]
                .sort((a, b) => {
                    return a - b; // force numerical sort
                })
                .indexOf(vl.nominalVoltage) + 1
        );
    }

    /*
     *   first things to do when new data, index line by nomimalVoltage
     *   timestamp : time when the batch was called used to evaluate when we need the pass to the next 'frame'
     *   vlIndex : nominal voltage index (in network.nominalVoltages
     *   linesByNominalVoltage : map [vlIndex: [voltagesLevels] ]
     *   next : computeLinesMetadata
     * */
    indexLinesByNominalVoltage(timestamp, vlIndex, linesByNominalVoltage) {
        const nominalVoltage = this.props.network.nominalVoltages[vlIndex];
        const voltageLevelFilter = (line) => {
            const network = this.props.network;
            const vl1 = network.getVoltageLevel(line.voltageLevelId1);
            const vl2 = network.getVoltageLevel(line.voltageLevelId2);
            const vl = vl1 || vl2;
            return (
                vl.nominalVoltage === nominalVoltage &&
                vl1.substationId !== vl2.substationId
            );
        };
        linesByNominalVoltage.set(vlIndex, [
            ...this.props.data.values.filter(voltageLevelFilter),
        ]);
        let next;
        if (this.hasNextNominalVoltage(vlIndex)) {
            next = (ts) =>
                this.indexLinesByNominalVoltage(
                    ts,
                    vlIndex + 1,
                    linesByNominalVoltage
                );
        } else {
            this.setState({ linesByNominalVoltage: linesByNominalVoltage });
            next = (ts) =>
                this.computeLinesMetadata(ts, 0, new Map(), new Map());
        }
        this.scheduleNext(timestamp, next);
    }

    /*  compute lines connexions state and which ones share pair of substations (origin/end)
     *   timestamp : when the 'frame' started
     *   vlIndex : nominalVoltage index to compute
     *   linesConnection : (in/out) map of line connection
     *   mapOriginDestination : (in/out) map of pair of substation
     *            to list of line sharing theses  {genLineKey(line) : [line,...]}
     *   next : generateLinesParallelIndex
     * */
    computeLinesMetadata(
        timestamp,
        vlIndex,
        linesConnection,
        mapOriginDestination
    ) {
        this.state.linesByNominalVoltage.get(vlIndex).forEach((line) => {
            linesConnection.set(line.id, {
                terminal1Connected: line.terminal1Connected,
                terminal2Connected: line.terminal2Connected,
            });

            const key = this.genLineKey(line);
            let val = mapOriginDestination.get(key);
            if (val == null) mapOriginDestination.set(key, new Set([line]));
            else {
                mapOriginDestination.set(key, val.add(line));
            }
        });
        let onNext;
        if (this.hasNextNominalVoltage(vlIndex))
            onNext = (ts) =>
                this.computeLinesMetadata(
                    ts,
                    vlIndex + 1,
                    linesConnection,
                    mapOriginDestination
                );
        else {
            this.setState({
                linesConnection: linesConnection,
                mapOriginDestination: mapOriginDestination,
            });
            onNext = (ts) => this.generateLinesParallelIndex(ts);
        }
        this.scheduleNext(timestamp, onNext);
    }

    generateLinesParallelIndex(ts) {
        // calculate index for line with same substation set
        // The index is a real number in a normalized unit.
        // +1 => distanceBetweenLines on side
        // -1 => distanceBetweenLines on the other side
        // 0.5 => half of distanceBetweenLines
        this.state.mapOriginDestination.forEach((samePathLine) => {
            let index = -(samePathLine.size - 1) / 2;
            samePathLine.forEach((line) => {
                line.parallelIndex = this.props.lineParallelPath ? index : 0;
                index += 1;
            });
        });
        this.scheduleNext(ts, (ts) => this.generateLineMap(ts, 0));
    }

    generateLineMap(ts, vlIndex) {
        const lines = this.state.linesByNominalVoltage.get(vlIndex);
        const lineMap = this.state.lineMap;
        if (vlIndex === 0) lineMap.clear();
        lines.forEach((line) => {
            const positions = this.props.geoData.getLinePositions(
                this.props.network,
                line,
                this.props.lineFullPath
            );
            const cumulativeDistances = this.props.geoData.getLineDistances(
                positions
            );
            lineMap.set(line.id, {
                positions: positions,
                cumulativeDistances: cumulativeDistances,
                line: line,
            });
        });
        this.setState({ lineMap: lineMap, [PATH_UPDATED + vlIndex]: ts });
        this.scheduleNext(ts, (ts) =>
            this.computeForkLines(ts, vlIndex, new Map())
        );
    }

    computeForkLines(ts, vlIndex, mapMinProximityFactor) {
        this.state.linesByNominalVoltage.get(vlIndex).forEach((line) => {
            const positions = this.state.lineMap.get(line.id).positions;
            //the first and last in positions doesn't depend on lineFullPath
            line.origin = positions[0];
            line.end = positions[positions.length - 1];

            line.substationIndexStart = this.getVoltageLevelIndex(
                line.voltageLevelId1
            );
            line.substationIndexEnd = this.getVoltageLevelIndex(
                line.voltageLevelId2
            );

            if (!line.angle)
                line.angle = this.computeAngle(
                    this.props,
                    positions[0],
                    positions[positions.length - 1]
                );
            line.angleStart = this.computeAngle(
                this.props,
                positions[0],
                positions[1]
            );
            line.angleEnd = this.computeAngle(
                this.props,
                positions[positions.length - 2],
                positions[positions.length - 1]
            );
            line.proximityFactorStart = this.getProximityFactor(
                positions[0],
                positions[1]
            );
            line.proximityFactorEnd = this.getProximityFactor(
                positions[positions.length - 2],
                positions[positions.length - 1]
            );

            let key = this.genLineKey(line);
            let val = mapMinProximityFactor.get(key);
            if (val == null)
                mapMinProximityFactor.set(key, {
                    lines: [line],
                    start: line.proximityFactorStart,
                    end: line.proximityFactorEnd,
                });
            else {
                val.lines.push(line);
                val.start = Math.min(val.start, line.proximityFactorStart);
                val.end = Math.min(val.end, line.proximityFactorEnd);
                mapMinProximityFactor.set(key, val);
            }
        });

        if (vlIndex === this.props.network.nominalVoltages.length - 1) {
            mapMinProximityFactor.forEach((samePathLine) =>
                samePathLine.lines.forEach((line) => {
                    line.proximityFactorStart = samePathLine.start;
                    line.proximityFactorEnd = samePathLine.end;
                })
            );
            this.setState({
                [PROXIMITY_UPDATED]: ts,
            });
        }
        this.scheduleNext(
            ts,
            (ts) =>
                this.generateParallelPathLayer(
                    ts,
                    vlIndex,
                    mapMinProximityFactor
                ),
            true
        );
    }

    computeArrows(ts, vlIndex, onlyUpdate) {
        // add arrows
        const lineMap = this.state.lineMap;

        // create one arrow each DISTANCE_BETWEEN_ARROWS
        let arrows = this.state.linesByNominalVoltage
            .get(vlIndex)
            .flatMap((line) => {
                let lineData = lineMap.get(line.id);
                line.cumulativeDistances = lineData.cumulativeDistances;
                line.positions = lineData.positions;

                if (this.props.lineFlowMode === LineFlowMode.FEEDERS) {
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
                const directLinePositions = [
                    lineData.positions[0],
                    lineData.positions[lineData.positions.length - 1],
                ];
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
        this.setState({ [ARROW_UPDATE + vlIndex]: ts });
        this.scheduleNext(
            ts,
            (ts) => this.generateArrowLayer(ts, vlIndex, arrows, onlyUpdate),
            true
        );
    }

    computeLabels(ts, vlIndex) {
        let activePower = [];
        this.state.linesByNominalVoltage.get(vlIndex).forEach((line) => {
            let lineData = this.state.lineMap.get(line.id);
            let arrowDirection = getArrowDirection(line.p1);
            let coordinates1 = this.props.geoData.labelDisplayPosition(
                lineData.positions,
                lineData.cumulativeDistances,
                START_ARROW_POSITION,
                arrowDirection,
                line.parallelIndex,
                (line.angle * 180) / Math.PI,
                (line.angleStart * 180) / Math.PI,
                this.props.distanceBetweenLines,
                line.proximityFactorStart
            );
            let coordinates2 = this.props.geoData.labelDisplayPosition(
                lineData.positions,
                lineData.cumulativeDistances,
                END_ARROW_POSITION,
                arrowDirection,
                line.parallelIndex,
                (line.angle * 180) / Math.PI,
                (line.angleEnd * 180) / Math.PI,
                this.props.distanceBetweenLines,
                line.proximityFactorEnd
            );
            if (coordinates1 !== null && coordinates2 !== null) {
                activePower.push({
                    line: line,
                    p: line.p1,
                    printPosition: [
                        coordinates1.position.longitude,
                        coordinates1.position.latitude,
                    ],
                    offset: coordinates1.offset,
                });
                activePower.push({
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
        this.scheduleNext(ts, (ts) =>
            this.generateLabelLayer(ts, vlIndex, activePower)
        );
    }

    computeLinesConnections(ts, props) {
        let linesConnection = this.state.linesConnection;
        const vlUpdated = {};
        props.updatedLines.forEach((line) => {
            linesConnection.set(line.id, {
                terminal1Connected: line.terminal1Connected,
                terminal2Connected: line.terminal2Connected,
            });
            vlUpdated[
                LINE_UPDATED +
                    (this.getVoltageLevelIndex(line.voltageLevelId1) - 1)
            ] = ts;
            vlUpdated[
                LINE_UPDATED +
                    (this.getVoltageLevelIndex(line.voltageLevelId2) - 1)
            ] = ts;
        });
        this.setState({
            ...{ linesConnection: linesConnection },
            ...vlUpdated,
        });
    }

    updateState({ props, oldProps, changeFlags }) {
        if (!props.data.values) return;
        if (changeFlags.dataChanged) {
            window.requestAnimationFrame((timestamp) =>
                this.indexLinesByNominalVoltage(timestamp, 0, new Map())
            );
        } else if (changeFlags.propsChanged) {
            if (
                oldProps.lineFullPath !== props.lineFullPath ||
                props.lineParallelPath !== oldProps.lineParallelPath
            )
                /* this update will start with lines, then arrow, then labels*/
                window.requestAnimationFrame((ts) =>
                    this.generateLinesParallelIndex(ts)
                );
            else if (
                props.lineFlowMode !== oldProps.lineFlowMode &&
                (props.lineFlowMode === LineFlowMode.FEEDERS ||
                    oldProps.lineFlowMode === LineFlowMode.FEEDERS)
            ) {
                window.requestAnimationFrame((ts) =>
                    this.computeArrows(ts, 0, true)
                );
            }
            if (props.updatedLines !== oldProps.updatedLines) {
                window.requestAnimationFrame((ts) =>
                    this.computeLinesConnections(ts, props)
                );
            }
        }
    }

    generateParallelPathLayer(timestamp, vlIndex, mapMinProximityFactor) {
        const nominalVoltage = this.props.network.nominalVoltages[vlIndex];
        let layers = this.state.layers;
        const nominalVoltageColor = this.props.getNominalVoltageColor(
            nominalVoltage
        );
        const idLayer = 'LineNominalVoltage' + nominalVoltage;
        layers.set(
            idLayer,
            (state, props) =>
                new ParallelPathLayer(
                    this.getSubLayerProps({
                        id: idLayer,
                        data: state.linesByNominalVoltage.get(vlIndex),
                        widthScale: 20,
                        widthMinPixels: 1,
                        widthMaxPixels: 2,
                        getPath: (line) => state.lineMap.get(line.id).positions,
                        getColor: (line) =>
                            getLineColor(
                                line,
                                nominalVoltageColor,
                                props,
                                state.linesConnection.get(line.id)
                            ),
                        getWidth: 2,
                        getLineParallelIndex: (line) => line.parallelIndex,
                        getLineAngles: (line) => [
                            line.angleStart,
                            line.angle,
                            line.angleEnd,
                        ],
                        getParallelIndexAndProximityFactor: (line) => [
                            line.parallelIndex,
                            line.proximityFactorStart,
                            line.proximityFactorEnd,
                        ],
                        distanceBetweenLines: props.distanceBetweenLines,
                        maxParallelOffset: props.maxParallelOffset,
                        minParallelOffset: props.minParallelOffset,
                        visible: props.filteredNominalVoltages.includes(
                            nominalVoltage
                        ),
                        updateTriggers: {
                            getPath: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getParallelIndexAndProximityFactor: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getLineAngles: state[PATH_UPDATED + vlIndex],
                            getColor: [
                                props.disconnectedLineColor,
                                props.lineFlowColorMode,
                                props.lineFlowAlertThreshold,
                                state[LINE_UPDATED + vlIndex],
                            ],
                            getDashArray: [state[LINE_UPDATED + vlIndex]],
                        },
                        getDashArray: (line) =>
                            doDash(state.linesConnection.get(line.id))
                                ? dashArray
                                : noDashArray,
                        extensions: [new PathStyleExtension({ dash: true })],
                    })
                )
        );
        this.setState({ layers: layers });

        this.scheduleNext(timestamp, (ts) =>
            this.generateForkLayer(ts, vlIndex, mapMinProximityFactor, true)
        );
    }

    generateForkLayer(timestamp, vlIndex, mapMinProximityFactor, isStart) {
        const nominalVoltage = this.props.network.nominalVoltages[vlIndex];
        let layers = this.state.layers;
        const nominalVoltageColor = this.props.getNominalVoltageColor(
            nominalVoltage
        );
        const idLayer =
            'LineFork' + (isStart ? 'Start' : 'End') + nominalVoltage;
        layers.set(
            idLayer,
            (state, props) =>
                new ForkLineLayer(
                    this.getSubLayerProps({
                        id: idLayer,
                        getSourcePosition: (line) =>
                            isStart ? line.origin : line.end,
                        getTargetPosition: (line) =>
                            isStart ? line.end : line.origin,
                        getSubstationOffset: (line) =>
                            isStart
                                ? line.substationIndexStart
                                : line.substationIndexEnd,
                        data: state.linesByNominalVoltage.get(vlIndex),
                        widthScale: 20,
                        widthMinPixels: 1,
                        widthMaxPixels: 2,
                        getColor: (line) =>
                            getLineColor(
                                line,
                                nominalVoltageColor,
                                props,
                                state.linesConnection.get(line.id)
                            ),
                        getWidth: 2,
                        getProximityFactor: (line) =>
                            isStart
                                ? line.proximityFactorStart
                                : line.proximityFactorEnd,
                        getLineParallelIndex: (line) =>
                            isStart ? line.parallelIndex : -line.parallelIndex,
                        getLineAngle: (line) =>
                            isStart ? line.angleStart : line.angleEnd + Math.PI,
                        getDistanceBetweenLines: props.distanceBetweenLines,
                        getMaxParallelOffset: props.maxParallelOffset,
                        getMinParallelOffset: props.minParallelOffset,
                        getSubstationRadius: props.substationRadius,
                        getSubstationMaxPixel: props.substationMaxPixel,
                        getMinSubstationRadiusPixel:
                            props.minSubstationRadiusPixel,
                        visible: props.filteredNominalVoltages.includes(
                            nominalVoltage
                        ),
                        updateTriggers: {
                            getLineParallelIndex: [
                                state[PATH_UPDATED + vlIndex],
                            ],
                            getSourcePosition: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getTargetPosition: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getLineAngle: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getProximityFactor: [
                                state[PATH_UPDATED + vlIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getColor: [
                                props.disconnectedLineColor,
                                props.lineFlowColorMode,
                                props.lineFlowAlertThreshold,
                                props.updatedLines,
                            ],
                        },
                    })
                )
        );
        this.setState({ layers: layers }, () => this.scheduleNext(next));
        let next;
        if (isStart) {
            // this function is short (in time)
            this.generateForkLayer(
                timestamp,
                vlIndex,
                mapMinProximityFactor,
                false
            );
        } else {
            if (this.hasNextNominalVoltage(vlIndex))
                next = (ts) => this.generateLineMap(ts, vlIndex + 1);
            else next = (ts) => this.computeArrows(ts, 0);
            this.scheduleNext(timestamp, next, true);
        }
    }

    generateArrowLayer(timestamp, vlIndex, arrows, onlyUpdate) {
        const nominalVoltage = this.props.network.nominalVoltages[vlIndex];
        let layers = this.state.layers;
        const nominalVoltageColor = this.props.getNominalVoltageColor(
            nominalVoltage
        );
        const idLayer = 'ArrowNominalVoltage' + nominalVoltage;
        layers.set(
            idLayer,
            (state, props) =>
                new ArrowLayer(
                    this.getSubLayerProps({
                        id: idLayer,
                        data: arrows,
                        sizeMinPixels: 3,
                        sizeMaxPixels: 7,
                        getDistance: (arrow) => arrow.distance,
                        getLine: (arrow) => arrow.line,
                        getLinePositions: (line) => line.positions,
                        getColor: (arrow) =>
                            getLineColor(
                                arrow.line,
                                nominalVoltageColor,
                                props,
                                state.linesConnection.get(arrow.line.id)
                            ),
                        getSize: 700,
                        getSpeedFactor: (arrow) =>
                            getArrowSpeedFactor(getArrowSpeed(arrow.line)),
                        getLineParallelIndex: (arrow) =>
                            arrow.line.parallelIndex,
                        getLineAngles: (arrow) => [
                            arrow.line.angleStart,
                            arrow.line.angle,
                            arrow.line.angleEnd,
                        ],
                        getProximityFactors: (arrow) => [
                            arrow.line.proximityFactorStart,
                            arrow.line.proximityFactorEnd,
                        ],
                        getDistanceBetweenLines: props.distanceBetweenLines,
                        maxParallelOffset: props.maxParallelOffset,
                        minParallelOffset: props.minParallelOffset,
                        getDirection: (arrow) => {
                            return getArrowDirection(arrow.line.p1);
                        },
                        animated:
                            props.showLineFlow &&
                            props.lineFlowMode === LineFlowMode.ANIMATED_ARROWS,
                        visible:
                            props.showLineFlow &&
                            props.filteredNominalVoltages.includes(
                                nominalVoltage
                            ) &&
                            state[PATH_UPDATED + vlIndex] <=
                                state[ARROW_UPDATE + vlIndex],
                        updateTriggers: {
                            getLinePositions: [state[ARROW_UPDATE + vlIndex]],
                            getLineParallelIndex: [
                                state[ARROW_UPDATE + vlIndex],
                            ],
                            getLineAngles: [state[ARROW_UPDATE + vlIndex]],
                            getColor: [
                                props.lineFlowColorMode,
                                props.lineFlowAlertThreshold,
                                props.updatedLines,
                            ],
                        },
                    })
                )
        );
        this.setState({ layers: layers });
        let next = undefined;
        if (this.hasNextNominalVoltage(vlIndex))
            next = (ts) => this.computeArrows(ts, vlIndex + 1, onlyUpdate);
        else if (!onlyUpdate) next = (ts) => this.computeLabels(ts, 0);
        if (next !== undefined) this.scheduleNext(timestamp, next, true);
    }

    generateLabelLayer(timestamp, vlIndex, activePower) {
        const nominalVoltage = this.props.network.nominalVoltages[vlIndex];
        let layers = this.state.layers;
        const idLayer = 'ActivePower' + nominalVoltage;
        layers.set(
            idLayer,
            (state, props) =>
                new TextLayer(
                    this.getSubLayerProps({
                        id: idLayer,
                        data: activePower,
                        getText: (activePower) =>
                            activePower.p !== undefined
                                ? Math.round(activePower.p).toString()
                                : '',
                        getPosition: (activePower) => activePower.printPosition,
                        getColor: props.labelColor,
                        fontFamily: 'Roboto',
                        getSize: props.labelSize,
                        getAngle: 0,
                        getPixelOffset: (activePower) => activePower.offset,
                        getTextAnchor: 'middle',
                        visible:
                            props.filteredNominalVoltages.includes(
                                nominalVoltage
                            ) && props.labelsVisible,
                        updateTriggers: {
                            getPosition: [state[PATH_UPDATED + vlIndex]],
                            getPixelOffset: [state[PATH_UPDATED + vlIndex]],
                        },
                    })
                )
        );
        this.setState({ layers: layers }, () => this.scheduleNext(next));

        let next = undefined;
        if (this.hasNextNominalVoltage(vlIndex))
            next = (ts) => this.computeLabels(ts, vlIndex + 1);

        this.scheduleNext(timestamp, next, true);
    }

    renderLayers() {
        const layers = [];
        this.state.layers.forEach((layer) =>
            layers.push(layer(this.state, this.props))
        );
        return layers;
    }

    getProximityFactor(firstPosition, secondPosition) {
        let factor =
            getDistance(firstPosition, secondPosition) /
            (3 * this.props.distanceBetweenLines);
        if (factor > 1) {
            factor = 1;
        }
        return factor;
    }

    computeAngle(props, position1, position2) {
        let angle = props.geoData.getMapAngle(position1, position2);
        angle = (angle * Math.PI) / 180 + Math.PI;
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
    }

    hasNextNominalVoltage(vlIndex) {
        return vlIndex < this.props.network.nominalVoltages.length - 1;
    }

    genLineKey(line) {
        return line.voltageLevelId1 > line.voltageLevelId2
            ? line.voltageLevelId1 + '##' + line.voltageLevelId2
            : line.voltageLevelId2 + '##' + line.voltageLevelId1;
    }

    /*
     *  function used to call onNext in the same 'frame' on the next one if we're short on time
     *   timestamp : when the 'frame' started
     *   onNext : callback to call, if undefined does nothing
     *   force : force the callback on the next 'frame'
     * */
    scheduleNext(timestamp, onNext, force) {
        if (onNext === undefined) return;
        if (force || performance.now() > timestamp + tsThreshold) {
            // to keep everything smooth
            window.requestAnimationFrame(onNext);
        } else onNext(timestamp);
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
    substationRadius: { type: 'number', value: SUBSTATION_RADIUS },
    substationMaxPixel: { type: 'number', value: SUBSTATION_RADIUS_MAX_PIXEL },
    minSubstationRadiusPixel: {
        type: 'number',
        value: SUBSTATION_RADIUS_MIN_PIXEL,
    },
};

export default LineLayer;
