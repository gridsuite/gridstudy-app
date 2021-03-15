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
const PROXIMITY_UPDATED = 'proximityUpdated';
const ARROW_UPDATE = 'lastArrowUpdate';
const ACTIVE_POWER = 'lastPowerUpdate';

class LineLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            linesConnection: new Map(),
            lineMap: new Map(),
            layers: new Map(),
            linesByNominalVoltage: undefined,
            activePower: new Map(),
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

    getLineNominalVoltage(line) {
        const network = this.props.network;
        const vl1 = network.getVoltageLevel(line.voltageLevelId1);
        const vl2 = network.getVoltageLevel(line.voltageLevelId2);
        const vl = vl1 || vl2;
        return vl.nominalVoltage;
    }

    /*
     *   first things to do when new data, index line by nomimalVoltage
     *   nominalVoltageIndex : nominal voltage index (in network.nominalVoltages
     *   linesByNominalVoltage : map [nominalVoltageIndex: [voltagesLevels] ]
     *   next : computeLinesMetadata
     * */
    indexLinesByNominalVoltage() {
        const linesByNominalVoltage = new Map();
        this.props.network.nominalVoltages.forEach((nv) =>
            linesByNominalVoltage.set(nv, new Map())
        );
        this.workArray(
            this.props.data.values.length,
            (i) => {
                linesByNominalVoltage
                    .get(this.getLineNominalVoltage(this.props.data.values[i]))
                    .set(
                        this.props.data.values[i].id,
                        this.props.data.values[i]
                    );
            },
            0,
            () => {
                this.setState({ linesByNominalVoltage: linesByNominalVoltage });
                let next = (ts) =>
                    this.computeLinesMetadata(0, new Map(), new Map());

                this.scheduleNext(next);
            }
        );
    }

    /*  compute lines connexions state and which ones share pair of substations (origin/end)
     *   timestamp : when the 'frame' started
     *   nominalVoltageIndex : nominalVoltage index to compute
     *   linesConnection : (in/out) map of line connection
     *   mapOriginDestination : (in/out) map of pair of substation
     *            to list of line sharing theses  {genLineKey(line) : [line,...]}
     *   next : generateLinesParallelIndex
     * */
    computeLinesMetadata(
        nominalVoltageIndex,
        linesConnection,
        mapOriginDestination
    ) {
        const lines = this.getLinesByNominalVoltageIndex(nominalVoltageIndex);
        this.workArray(
            lines.length,
            (i) => {
                const line = lines[i];
                linesConnection.set(line.id, {
                    terminal1Connected: line.terminal1Connected,
                    terminal2Connected: line.terminal2Connected,
                });
                line.geo = {};
                const key = this.genLineKey(line);
                let val = mapOriginDestination.get(key);
                if (val == null) mapOriginDestination.set(key, new Set([line]));
                else {
                    mapOriginDestination.set(key, val.add(line));
                }
            },
            0,
            () => {
                let onNext;
                if (this.hasNextNominalVoltage(nominalVoltageIndex))
                    onNext = (ts) =>
                        this.computeLinesMetadata(
                            nominalVoltageIndex + 1,
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
                this.scheduleNext(onNext);
            }
        );
    }

    generateLinesParallelIndex(ts) {
        // calculate index for line with same substation set
        // The index is a real number in a normalized unit.
        // +1 => distanceBetweenLines on side
        // -1 => distanceBetweenLines on the other side
        // 0.5 => half of distanceBetweenLines
        const listSamePathLines = [...this.state.mapOriginDestination.values()];
        this.workArray(
            listSamePathLines.length,
            (n) => {
                const samePathLine = listSamePathLines[n];
                let index = -(samePathLine.size - 1) / 2;
                samePathLine.forEach((line) => {
                    line.geo.parallelIndex = this.props.lineParallelPath
                        ? index
                        : 0;
                    index += 1;
                });
            },
            0,
            () => this.generateLineMap(ts, 0)
        );
    }

    generateLineMap(ts, nominalVoltageIndex) {
        const lineMap = this.state.lineMap;
        const lines = this.getLinesByNominalVoltageIndex(nominalVoltageIndex);
        this.workArray(
            lines.length,
            (i) => {
                const line = lines[i];
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
            },
            0,
            () => {
                this.setState({
                    lineMap: lineMap,
                    [PATH_UPDATED + nominalVoltageIndex]: ts,
                });
                this.computeForkLines(ts, nominalVoltageIndex, new Map());
            }
        );
    }

    getLinesByNominalVoltageIndex(nominalVoltageIndex) {
        return [
            ...this.state.linesByNominalVoltage
                .get(this.props.network.nominalVoltages[nominalVoltageIndex])
                .values(),
        ];
    }

    computeForkLines(ts, nominalVoltageIndex, mapMinProximityFactor) {
        const lines = this.getLinesByNominalVoltageIndex(nominalVoltageIndex);
        this.workArray(
            lines.length,
            (i) => {
                const line = lines[i];
                const positions = this.state.lineMap.get(line.id).positions;
                //the first and last in positions doesn't depend on lineFullPath
                line.geo.origin = positions[0];
                line.geo.end = positions[positions.length - 1];

                line.geo.substationIndexStart = this.getVoltageLevelIndex(
                    line.voltageLevelId1
                );
                line.geo.substationIndexEnd = this.getVoltageLevelIndex(
                    line.voltageLevelId2
                );

                if (!line.geo.angle)
                    line.geo.angle = this.computeAngle(
                        this.props,
                        positions[0],
                        positions[positions.length - 1]
                    );
                line.geo.angleStart = this.computeAngle(
                    this.props,
                    positions[0],
                    positions[1]
                );
                line.geo.angleEnd = this.computeAngle(
                    this.props,
                    positions[positions.length - 2],
                    positions[positions.length - 1]
                );
                line.geo.proximityFactorStart = this.getProximityFactor(
                    positions[0],
                    positions[1]
                );
                line.geo.proximityFactorEnd = this.getProximityFactor(
                    positions[positions.length - 2],
                    positions[positions.length - 1]
                );

                let key = this.genLineKey(line);
                let val = mapMinProximityFactor.get(key);
                if (val == null)
                    mapMinProximityFactor.set(key, {
                        lines: [line],
                        start: line.geo.proximityFactorStart,
                        end: line.geo.proximityFactorEnd,
                    });
                else {
                    val.lines.push(line);
                    val.start = Math.min(
                        val.start,
                        line.geo.proximityFactorStart
                    );
                    val.end = Math.min(val.end, line.geo.proximityFactorEnd);
                    mapMinProximityFactor.set(key, val);
                }
            },
            0,
            () => {
                if (
                    nominalVoltageIndex ===
                    this.props.network.nominalVoltages.length - 1
                ) {
                    mapMinProximityFactor.forEach((samePathLine) =>
                        samePathLine.lines.forEach((line) => {
                            line.geo.proximityFactorStart = samePathLine.start;
                            line.geo.proximityFactorEnd = samePathLine.end;
                        })
                    );
                    this.setState({
                        [PROXIMITY_UPDATED]: ts,
                    });
                }
                this.generateParallelPathLayer(
                    nominalVoltageIndex,
                    mapMinProximityFactor
                );
            }
        );
    }

    computeArrows(ts, nominalVoltageIndex, doLabel, doNextNominalVoltage) {
        // add arrows
        const lineMap = this.state.lineMap;
        // create one arrow each DISTANCE_BETWEEN_ARROWS
        let arrows = [];
        const lines = this.getLinesByNominalVoltageIndex(nominalVoltageIndex);
        this.workArray(
            lines.length,
            (i) => {
                const line = lines[i];
                let lineData = lineMap.get(line.id);
                line.cumulativeDistances = lineData.cumulativeDistances;
                line.positions = lineData.positions;

                if (this.props.lineFlowMode === LineFlowMode.FEEDERS) {
                    //If we use Feeders Mode, we build only two arrows
                    arrows.push(
                        {
                            distance: START_ARROW_POSITION,
                            line: line,
                        },
                        {
                            distance: END_ARROW_POSITION,
                            line: line,
                        }
                    );
                } else {
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
                    for (let index = 0; index < arrowCount; ++index)
                        arrows.push({
                            distance: index / arrowCount,
                            line: line,
                        });
                }
            },
            0,
            () => {
                this.setState({ [ARROW_UPDATE + nominalVoltageIndex]: ts });
                this.generateArrowLayer(
                    nominalVoltageIndex,
                    arrows,
                    doLabel,
                    doNextNominalVoltage
                );
            }
        );
    }

    computeLabels(ts, nominalVoltageIndex, doNextNominalVoltage) {
        let activePower = [];
        const lines = this.getLinesByNominalVoltageIndex(nominalVoltageIndex);
        this.workArray(
            lines.length,
            (i) => {
                const line = lines[i];
                let lineData = this.state.lineMap.get(line.id);
                let arrowDirection = getArrowDirection(line.p1);
                let coordinates1 = this.props.geoData.labelDisplayPosition(
                    lineData.positions,
                    lineData.cumulativeDistances,
                    START_ARROW_POSITION,
                    arrowDirection,
                    line.geo.parallelIndex,
                    (line.geo.angle * 180) / Math.PI,
                    (line.geo.angleStart * 180) / Math.PI,
                    this.props.distanceBetweenLines,
                    line.geo.proximityFactorStart
                );
                let coordinates2 = this.props.geoData.labelDisplayPosition(
                    lineData.positions,
                    lineData.cumulativeDistances,
                    END_ARROW_POSITION,
                    arrowDirection,
                    line.geo.parallelIndex,
                    (line.geo.angle * 180) / Math.PI,
                    (line.geo.angleEnd * 180) / Math.PI,
                    this.props.distanceBetweenLines,
                    line.geo.proximityFactorEnd
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
            },
            0,
            () => {
                let mapPower = this.state.activePower;
                mapPower.set(nominalVoltageIndex, activePower);
                this.setState({
                    activePower: mapPower,
                    [ACTIVE_POWER + nominalVoltageIndex]: ts,
                });
                this.generateLabelLayer(
                    nominalVoltageIndex,
                    doNextNominalVoltage
                );
            }
        );
    }

    updateLines(ts, updatedLines) {
        const linesByNominalVoltage = this.state.linesByNominalVoltage;
        const nominalVoltageUpdated = new Set();
        this.workArray(
            updatedLines.length,
            (i) => {
                const line = updatedLines[i];
                const nominalVoltage = this.getLineNominalVoltage(line);
                let oldLine = linesByNominalVoltage
                    .get(nominalVoltage)
                    .get(line.id);
                if (oldLine) {
                    line.geo = oldLine.geo;
                    linesByNominalVoltage
                        .get(nominalVoltage)
                        .set(line.id, line);
                }
                nominalVoltageUpdated.add(nominalVoltage);
            },
            0,
            () => {
                this.setState({ linesByNominalVoltage: linesByNominalVoltage });
                this.computeLinesConnections(
                    ts,
                    updatedLines,
                    nominalVoltageUpdated
                );
            }
        );
    }

    computeLinesConnections(ts, updatedLines, nvUpdated) {
        let linesConnection = this.state.linesConnection;
        this.workArray(
            updatedLines.length,
            (i) => {
                const line = updatedLines[i];
                linesConnection.set(line.id, {
                    terminal1Connected: line.terminal1Connected,
                    terminal2Connected: line.terminal2Connected,
                });
            },
            0,
            () => {
                this.setState({ linesConnection: linesConnection });
                const nvIndexes = nvUpdated.map((nv) =>
                    this.props.network.nominalVoltages.indexOf(nv)
                );
                nvIndexes.forEach((nvi) =>
                    this.setState({ [LINE_UPDATED + nvIndexes[nvi]]: ts })
                );
                this.workArray(nvIndexes.length, (i) =>
                    this.computeArrows(ts, nvIndexes[i], true, false)
                );
            }
        );
    }

    updateState({ props, oldProps, changeFlags }) {
        if (!props.data.values) return;
        if (changeFlags.dataChanged) {
            this.scheduleNext(() => this.indexLinesByNominalVoltage());
        } else if (changeFlags.propsChanged) {
            if (
                oldProps.lineFullPath !== props.lineFullPath ||
                props.lineParallelPath !== oldProps.lineParallelPath
            )
                /* this update will start with lines, then arrow, then labels*/
                this.scheduleNext((ts) => this.generateLinesParallelIndex(ts));
            else if (
                props.lineFlowMode !== oldProps.lineFlowMode &&
                (props.lineFlowMode === LineFlowMode.FEEDERS ||
                    oldProps.lineFlowMode === LineFlowMode.FEEDERS)
            ) {
                this.scheduleNext((ts) => this.computeArrows(ts, 0, true));
            }
            if (
                props.updatedLines !== oldProps.updatedLines &&
                props.updatedLines
            ) {
                this.scheduleNext((ts) =>
                    this.updateLines(ts, [...props.updatedLines])
                );
            }
        }
    }

    generateParallelPathLayer(nominalVoltageIndex, mapMinProximityFactor) {
        const nominalVoltage = this.props.network.nominalVoltages[
            nominalVoltageIndex
        ];
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
                        data: this.getLinesByNominalVoltageIndex(
                            nominalVoltageIndex
                        ),
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
                        getLineParallelIndex: (line) => line.geo.parallelIndex,
                        getLineAngles: (line) => [
                            line.geo.angleStart,
                            line.geo.angle,
                            line.geo.angleEnd,
                        ],
                        getParallelIndexAndProximityFactor: (line) => [
                            line.geo.parallelIndex,
                            line.geo.proximityFactorStart,
                            line.geo.proximityFactorEnd,
                        ],
                        distanceBetweenLines: props.distanceBetweenLines,
                        maxParallelOffset: props.maxParallelOffset,
                        minParallelOffset: props.minParallelOffset,
                        visible: props.filteredNominalVoltages.includes(
                            nominalVoltage
                        ),
                        updateTriggers: {
                            getPath: [
                                state[PATH_UPDATED + nominalVoltageIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getParallelIndexAndProximityFactor: [
                                state[PATH_UPDATED + nominalVoltageIndex],
                                state[PROXIMITY_UPDATED],
                            ],
                            getLineAngles:
                                state[PATH_UPDATED + nominalVoltageIndex],
                            getColor: [
                                props.disconnectedLineColor,
                                props.lineFlowColorMode,
                                props.lineFlowAlertThreshold,
                                state[LINE_UPDATED + nominalVoltageIndex],
                            ],
                            getDashArray: [
                                state[LINE_UPDATED + nominalVoltageIndex],
                            ],
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

        this.scheduleNext((ts) =>
            this.generateForkLayer(
                nominalVoltageIndex,
                mapMinProximityFactor,
                true
            )
        );
    }

    generateForkLayer(nominalVoltageIndex, mapMinProximityFactor, isStart) {
        const nominalVoltage = this.props.network.nominalVoltages[
            nominalVoltageIndex
        ];
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
                            isStart ? line.geo.origin : line.geo.end,
                        getTargetPosition: (line) =>
                            isStart ? line.geo.end : line.geo.origin,
                        getSubstationOffset: (line) =>
                            isStart
                                ? line.geo.substationIndexStart
                                : line.geo.substationIndexEnd,
                        data: this.getLinesByNominalVoltageIndex(
                            nominalVoltageIndex
                        ),
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
                                ? line.geo.proximityFactorStart
                                : line.geo.proximityFactorEnd,
                        getLineParallelIndex: (line) =>
                            isStart
                                ? line.geo.parallelIndex
                                : -line.geo.parallelIndex,
                        getLineAngle: (line) =>
                            isStart
                                ? line.geo.angleStart
                                : line.geo.angleEnd + Math.PI,
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
                                state[PATH_UPDATED + nominalVoltageIndex],
                            ],
                            getSourcePosition: [
                                state[PATH_UPDATED + nominalVoltageIndex],
                            ],
                            getTargetPosition: [
                                state[PATH_UPDATED + nominalVoltageIndex],
                            ],
                            getLineAngle: [
                                state[PATH_UPDATED + nominalVoltageIndex],
                            ],
                            getProximityFactor: [
                                state[PATH_UPDATED + nominalVoltageIndex],
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
        this.setState({ layers: layers });
        let next;
        if (isStart) {
            // this function is short (in time)
            this.generateForkLayer(
                nominalVoltageIndex,
                mapMinProximityFactor,
                false
            );
        } else {
            if (this.hasNextNominalVoltage(nominalVoltageIndex))
                next = (ts) =>
                    this.generateLineMap(ts, nominalVoltageIndex + 1);
            else next = (ts) => this.computeArrows(ts, 0, true, true);
            this.scheduleNext(next);
        }
    }

    generateArrowLayer(
        nominalVoltageIndex,
        arrows,
        doLabel,
        doNextNominalVoltage
    ) {
        const nominalVoltage = this.props.network.nominalVoltages[
            nominalVoltageIndex
        ];
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
                            arrow.line.geo.parallelIndex,
                        getLineAngles: (arrow) => [
                            arrow.line.geo.angleStart,
                            arrow.line.geo.angle,
                            arrow.line.geo.angleEnd,
                        ],
                        getProximityFactors: (arrow) => [
                            arrow.line.geo.proximityFactorStart,
                            arrow.line.geo.proximityFactorEnd,
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
                            state[PATH_UPDATED + nominalVoltageIndex] <=
                                state[ARROW_UPDATE + nominalVoltageIndex],
                        updateTriggers: {
                            getLinePositions: [
                                state[ARROW_UPDATE + nominalVoltageIndex],
                            ],
                            getLineParallelIndex: [
                                state[ARROW_UPDATE + nominalVoltageIndex],
                            ],
                            getLineAngles: [
                                state[ARROW_UPDATE + nominalVoltageIndex],
                            ],
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
        let next;
        if (
            doNextNominalVoltage &&
            this.hasNextNominalVoltage(nominalVoltageIndex)
        )
            next = (ts) =>
                this.computeArrows(
                    ts,
                    nominalVoltageIndex + 1,
                    doLabel,
                    doNextNominalVoltage
                );
        else if (doLabel)
            next = (ts) => this.computeLabels(ts, 0, doNextNominalVoltage);
        this.scheduleNext(next);
    }

    generateLabelLayer(nominalVoltageIndex, doNextNominalVoltage) {
        const nominalVoltage = this.props.network.nominalVoltages[
            nominalVoltageIndex
        ];
        let layers = this.state.layers;
        const idLayer = 'ActivePower' + nominalVoltage;
        layers.set(
            idLayer,
            (state, props) =>
                new TextLayer(
                    this.getSubLayerProps({
                        id: idLayer,
                        data: state.activePower.get(nominalVoltageIndex),
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
                            getPosition: [
                                state[ACTIVE_POWER + nominalVoltageIndex],
                            ],
                            getPixelOffset: [
                                state[ACTIVE_POWER + nominalVoltageIndex],
                            ],
                            getText: [
                                state[ACTIVE_POWER + nominalVoltageIndex],
                            ],
                            data: [state[ACTIVE_POWER + nominalVoltageIndex]],
                        },
                    })
                )
        );
        this.setState({ layers: layers });

        let next =
            doNextNominalVoltage &&
            this.hasNextNominalVoltage(nominalVoltageIndex) &&
            ((ts) =>
                this.computeLabels(
                    ts,
                    nominalVoltageIndex + 1,
                    doNextNominalVoltage
                ));

        this.scheduleNext(next);
    }

    renderLayers() {
        const layers = [];
        this.state.layers.forEach((layer) => {
            layers.push(layer(this.state, this.props));
        });
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

    hasNextNominalVoltage(nominalVoltageIndex) {
        return (
            nominalVoltageIndex < this.props.network.nominalVoltages.length - 1
        );
    }

    genLineKey(line) {
        return line.voltageLevelId1 > line.voltageLevelId2
            ? line.voltageLevelId1 + '##' + line.voltageLevelId2
            : line.voltageLevelId2 + '##' + line.voltageLevelId1;
    }

    /*
     *  function used to call onNext in the same 'frame' or the next one if we're short on time
     *   onNext : callback to call, if undefined does nothing
     * */
    scheduleNext(onNext) {
        if (onNext) window.setTimeout(() => onNext(performance.now()), 0);
    }

    workArray(arrayLength, cb, currentIndex, onNext) {
        let start = performance.now();
        let i = currentIndex || 0;
        while (i < arrayLength && performance.now() - start < tsThreshold) {
            cb(i);
            ++i;
        }
        if (i < arrayLength)
            this.scheduleNext(() => this.workArray(arrayLength, cb, i, onNext));
        else if (onNext) this.scheduleNext(onNext);
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
