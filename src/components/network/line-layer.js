/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CompositeLayer, TextLayer, IconLayer } from 'deck.gl';
import PadlockIcon from '../../images/lock_black_24dp.svg';
import BoltIcon from '../../images/bolt_black_24dp.svg';
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
import { RunningStatus } from '../util/running-status';
import { INVALID_LOADFLOW_OPACITY } from '../../utils/colors';

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

export function getLineLoadingZoneOfSide(
    limit,
    intensity,
    lineFlowAlertThreshold
) {
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

export function getLineLoadingZone(line, lineFlowAlertThreshold) {
    const zone1 = getLineLoadingZoneOfSide(
        line.currentLimits1?.permanentLimit,
        line.i1,
        lineFlowAlertThreshold
    );
    const zone2 = getLineLoadingZoneOfSide(
        line.currentLimits2?.permanentLimit,
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

function getLineIcon(lineStatus) {
    return {
        url:
            lineStatus === 'PLANNED_OUTAGE'
                ? PadlockIcon
                : lineStatus === 'FORCED_OUTAGE'
                ? BoltIcon
                : undefined,
        height: 24,
        width: 24,
        mask: true,
    };
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
    const speed1 = getArrowSpeedOfSide(
        line.currentLimits1?.permanentLimit,
        line.i1
    );
    const speed2 = getArrowSpeedOfSide(
        line.currentLimits2?.permanentLimit,
        line.i2
    );
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

class LineLayer extends CompositeLayer {
    initializeState() {
        super.initializeState();

        this.state = {
            compositeData: [],
            linesConnection: new Map(),
            linesStatus: new Map(),
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

    //TODO this is a huge function, refactor
    updateState({ props, oldProps, changeFlags }) {
        let compositeData;
        let linesConnection;
        let linesStatus;

        if (changeFlags.dataChanged) {
            compositeData = [];

            linesConnection = new Map();
            linesStatus = new Map();

            if (
                props.network != null &&
                props.network.substations &&
                props.data.length !== 0 &&
                props.geoData != null
            ) {
                // group lines by nominal voltage
                const lineNominalVoltageIndexer = (map, line) => {
                    const network = props.network;
                    const vl1 = network.getVoltageLevel(line.voltageLevelId1);
                    const vl2 = network.getVoltageLevel(line.voltageLevelId2);
                    const vl = vl1 || vl2;
                    let list = map.get(vl.nominalVoltage);
                    if (!list) {
                        list = [];
                        map.set(vl.nominalVoltage, list);
                    }
                    if (vl1.substationId !== vl2.substationId) {
                        list.push(line);
                    }
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
                    //find lines with same substations set
                    let mapOriginDestination = new Map();
                    compositeData.mapOriginDestination = mapOriginDestination;
                    compositeData.lines.forEach((line) => {
                        linesConnection.set(line.id, {
                            terminal1Connected: line.terminal1Connected,
                            terminal2Connected: line.terminal2Connected,
                        });

                        linesStatus.set(line.id, {
                            branchStatus: line.branchStatus,
                        });

                        const key = this.genLineKey(line);
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
            linesConnection = this.state.linesConnection;
            linesStatus = this.state.linesStatus;

            if (props.updatedLines !== oldProps.updatedLines) {
                props.updatedLines.forEach((line1) => {
                    linesConnection.set(line1.id, {
                        terminal1Connected: line1.terminal1Connected,
                        terminal2Connected: line1.terminal2Connected,
                    });
                    linesStatus.set(line1.id, {
                        branchStatus: line1.branchStatus,
                    });
                });
            }
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    props.lineParallelPath !== oldProps.lineParallelPath ||
                    props.geoData !== oldProps.geoData))
        ) {
            this.recomputeParallelLinesIndex(compositeData, props);
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    oldProps.geoData !== props.geoData))
        ) {
            compositeData.forEach((compositeData) => {
                let lineMap = new Map();
                compositeData.lines.forEach((line) => {
                    const positions = props.geoData.getLinePositions(
                        props.network,
                        line,
                        props.lineFullPath
                    );
                    const cumulativeDistances =
                        props.geoData.getLineDistances(positions);
                    lineMap.set(line.id, {
                        positions: positions,
                        cumulativeDistances: cumulativeDistances,
                        line: line,
                    });
                });
                compositeData.lineMap = lineMap;
            });
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (props.lineFullPath !== oldProps.lineFullPath ||
                    props.lineParallelPath !== oldProps.lineParallelPath ||
                    props.geoData !== oldProps.geoData))
        ) {
            this.recomputeForkLines(compositeData, props);
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    props.lineParallelPath !== oldProps.lineParallelPath ||
                    props.geoData !== oldProps.geoData))
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
                        (line.angleStart * 180) / Math.PI,
                        props.distanceBetweenLines,
                        line.proximityFactorStart
                    );
                    let coordinates2 = props.geoData.labelDisplayPosition(
                        lineData.positions,
                        lineData.cumulativeDistances,
                        END_ARROW_POSITION,
                        arrowDirection,
                        line.parallelIndex,
                        (line.angle * 180) / Math.PI,
                        (line.angleEnd * 180) / Math.PI,
                        props.distanceBetweenLines,
                        line.proximityFactorEnd
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
                (props.updatedLines !== oldProps.updatedLines ||
                    oldProps.lineFullPath !== props.lineFullPath ||
                    props.lineParallelPath !== oldProps.lineParallelPath ||
                    props.geoData !== oldProps.geoData))
        ) {
            //add icons
            compositeData.forEach((compositeData) => {
                compositeData.branchStatus = [];
                compositeData.lines.forEach((line) => {
                    let lineStatus = linesStatus.get(line.id);
                    if (
                        lineStatus !== undefined &&
                        lineStatus.branchStatus !== undefined &&
                        lineStatus.branchStatus !== 'IN_OPERATION'
                    ) {
                        let lineData = compositeData.lineMap.get(line.id);
                        let coordinatesIcon =
                            props.geoData.labelDisplayPosition(
                                lineData.positions,
                                lineData.cumulativeDistances,
                                0.5,
                                ArrowDirection.NONE,
                                line.parallelIndex,
                                (line.angle * 180) / Math.PI,
                                (line.angleEnd * 180) / Math.PI,
                                props.distanceBetweenLines,
                                line.proximityFactorEnd
                            );
                        if (coordinatesIcon !== null) {
                            compositeData.branchStatus.push({
                                status: lineStatus.branchStatus,
                                printPosition: [
                                    coordinatesIcon.position.longitude,
                                    coordinatesIcon.position.latitude,
                                ],
                                offset: coordinatesIcon.offset,
                            });
                        }
                    }
                });
            });
        }

        if (
            changeFlags.dataChanged ||
            (changeFlags.propsChanged &&
                (oldProps.lineFullPath !== props.lineFullPath ||
                    props.geoData !== oldProps.geoData ||
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
        this.setState({
            compositeData: compositeData,
            linesConnection: linesConnection,
            linesStatus: linesStatus,
        });
    }

    genLineKey(line) {
        return line.voltageLevelId1 > line.voltageLevelId2
            ? line.voltageLevelId1 + '##' + line.voltageLevelId2
            : line.voltageLevelId2 + '##' + line.voltageLevelId1;
    }

    recomputeParallelLinesIndex(compositeData, props) {
        compositeData.forEach((compositeData) => {
            const mapOriginDestination = compositeData.mapOriginDestination;
            // calculate index for line with same substation set
            // The index is a real number in a normalized unit.
            // +1 => distanceBetweenLines on side
            // -1 => distanceBetweenLines on the other side
            // 0.5 => half of distanceBetweenLines
            mapOriginDestination.forEach((samePathLine, key) => {
                // restrict parallelIndex to -15.5, -15, .., 15, 15.5 (32 lines, half precision)
                // for 31 lines, -15, -14, .., 15
                // for 32 lines, -15.5, -14.5, ..., 14.5, 15.5
                // (needed by the parallel path shader)
                let truncatedSize = samePathLine.size;
                if (truncatedSize > 32) {
                    console.warn(
                        'Warning, more than 32 parallel lines between vls ' +
                            key +
                            '. The map will only show 32 parallel lines.'
                    );
                    truncatedSize = 32;
                }
                let index = -(truncatedSize - 1) / 2;
                samePathLine.forEach((line) => {
                    line.parallelIndex = props.lineParallelPath ? index : 0;
                    if (index < 15) {
                        index += 1;
                    }
                });
            });
        });
    }

    recomputeForkLines(compositeData, props) {
        const mapMinProximityFactor = new Map();
        compositeData.forEach((compositeData) => {
            compositeData.lines.forEach((line) => {
                const positions = compositeData.lineMap.get(line.id).positions;
                //the first and last in positions doesn't depend on lineFullPath
                line.origin = positions[0];
                line.end = positions[positions.length - 1];

                line.substationIndexStart = this.getVoltageLevelIndex(
                    line.voltageLevelId1
                );
                line.substationIndexEnd = this.getVoltageLevelIndex(
                    line.voltageLevelId2
                );

                line.angle = this.computeAngle(
                    props,
                    positions[0],
                    positions[positions.length - 1]
                );
                line.angleStart = this.computeAngle(
                    props,
                    positions[0],
                    positions[1]
                );
                line.angleEnd = this.computeAngle(
                    props,
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
        });
        mapMinProximityFactor.forEach((samePathLine) =>
            samePathLine.lines.forEach((line) => {
                line.proximityFactorStart = samePathLine.start;
                line.proximityFactorEnd = samePathLine.end;
            })
        );
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

    renderLayers() {
        const layers = [];

        const linePathUpdateTriggers = [
            this.props.lineFullPath,
            this.props.geoData.linePositionsById,
            this.props.network.lines,
        ];

        // lines : create one layer per nominal voltage, starting from higher to lower nominal voltage
        this.state.compositeData.forEach((compositeData) => {
            const nominalVoltageColor = this.props.getNominalVoltageColor(
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
                        getLineColor(
                            line,
                            nominalVoltageColor,
                            this.props,
                            this.state.linesConnection.get(line.id)
                        ),
                    getWidth: 2,
                    getLineParallelIndex: (line) => line.parallelIndex,
                    getExtraAttributes: (line) => [
                        line.angleStart,
                        line.angle,
                        line.angleEnd,
                        line.parallelIndex * 2 +
                            31 +
                            64 *
                                (Math.ceil(line.proximityFactorStart * 512) -
                                    1) +
                            64 *
                                512 *
                                (Math.ceil(line.proximityFactorEnd * 512) - 1),
                    ],
                    distanceBetweenLines: this.props.distanceBetweenLines,
                    maxParallelOffset: this.props.maxParallelOffset,
                    minParallelOffset: this.props.minParallelOffset,
                    visible:
                        !this.props.filteredNominalVoltages ||
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ),
                    updateTriggers: {
                        getPath: linePathUpdateTriggers,
                        getExtraAttributes: [
                            this.props.lineParallelPath,
                            linePathUpdateTriggers,
                        ],
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                            this.props.updatedLines,
                        ],
                        getDashArray: [this.props.updatedLines],
                    },
                    getDashArray: (line) =>
                        doDash(this.state.linesConnection.get(line.id))
                            ? dashArray
                            : noDashArray,
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
                        getLineColor(
                            arrow.line,
                            nominalVoltageColor,
                            this.props,
                            this.state.linesConnection.get(arrow.line.id)
                        ),
                    getSize: 700,
                    getSpeedFactor: (arrow) =>
                        getArrowSpeedFactor(getArrowSpeed(arrow.line)),
                    getLineParallelIndex: (arrow) => arrow.line.parallelIndex,
                    getLineAngles: (arrow) => [
                        arrow.line.angleStart,
                        arrow.line.angle,
                        arrow.line.angleEnd,
                    ],
                    getProximityFactors: (arrow) => [
                        arrow.line.proximityFactorStart,
                        arrow.line.proximityFactorEnd,
                    ],
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
                        (!this.props.filteredNominalVoltages ||
                            this.props.filteredNominalVoltages.includes(
                                compositeData.nominalVoltage
                            )),
                    opacity:
                        this.props.loadFlowStatus !== RunningStatus.SUCCEED
                            ? INVALID_LOADFLOW_OPACITY
                            : 1,
                    updateTriggers: {
                        getLinePositions: linePathUpdateTriggers,
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getLineAngles: linePathUpdateTriggers,
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                            this.props.updatedLines,
                        ],
                        opacity: [this.props.loadFlowStatus],
                    },
                })
            );
            layers.push(arrowLayer);

            const startFork = new ForkLineLayer(
                this.getSubLayerProps({
                    id: 'LineForkStart' + compositeData.nominalVoltage,
                    getSourcePosition: (line) => line.origin,
                    getTargetPosition: (line) => line.end,
                    getSubstationOffset: (line) => line.substationIndexStart,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) =>
                        getLineColor(
                            line,
                            nominalVoltageColor,
                            this.props,
                            this.state.linesConnection.get(line.id)
                        ),
                    getWidth: 2,
                    getProximityFactor: (line) => line.proximityFactorStart,
                    getLineParallelIndex: (line) => line.parallelIndex,
                    getLineAngle: (line) => line.angleStart,
                    getDistanceBetweenLines: this.props.distanceBetweenLines,
                    getMaxParallelOffset: this.props.maxParallelOffset,
                    getMinParallelOffset: this.props.minParallelOffset,
                    getSubstationRadius: this.props.substationRadius,
                    getSubstationMaxPixel: this.props.substationMaxPixel,
                    getMinSubstationRadiusPixel:
                        this.props.minSubstationRadiusPixel,
                    visible:
                        !this.props.filteredNominalVoltages ||
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ),
                    updateTriggers: {
                        getLineParallelIndex: linePathUpdateTriggers,
                        getSourcePosition: linePathUpdateTriggers,
                        getTargetPosition: linePathUpdateTriggers,
                        getLineAngle: linePathUpdateTriggers,
                        getProximityFactor: linePathUpdateTriggers,
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                            this.props.updatedLines,
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
                    getSubstationOffset: (line) => line.substationIndexEnd,
                    data: compositeData.lines,
                    widthScale: 20,
                    widthMinPixels: 1,
                    widthMaxPixels: 2,
                    getColor: (line) =>
                        getLineColor(
                            line,
                            nominalVoltageColor,
                            this.props,
                            this.state.linesConnection.get(line.id)
                        ),
                    getWidth: 2,
                    getProximityFactor: (line) => line.proximityFactorEnd,
                    getLineParallelIndex: (line) => -line.parallelIndex,
                    getLineAngle: (line) => line.angleEnd + Math.PI,
                    getDistanceBetweenLines: this.props.distanceBetweenLines,
                    getMaxParallelOffset: this.props.maxParallelOffset,
                    getMinParallelOffset: this.props.minParallelOffset,
                    getSubstationRadius: this.props.substationRadius,
                    getSubstationMaxPixel: this.props.substationMaxPixel,
                    getMinSubstationRadiusPixel:
                        this.props.minSubstationRadiusPixel,
                    visible:
                        !this.props.filteredNominalVoltages ||
                        this.props.filteredNominalVoltages.includes(
                            compositeData.nominalVoltage
                        ),
                    updateTriggers: {
                        getLineParallelIndex: [this.props.lineParallelPath],
                        getSourcePosition: linePathUpdateTriggers,
                        getTargetPosition: linePathUpdateTriggers,
                        getLineAngle: linePathUpdateTriggers,
                        getProximityFactor: linePathUpdateTriggers,
                        getColor: [
                            this.props.disconnectedLineColor,
                            this.props.lineFlowColorMode,
                            this.props.lineFlowAlertThreshold,
                            this.props.updatedLines,
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
                    getPixelOffset: (activePower) =>
                        activePower.offset.map((x) => x),
                    getTextAnchor: 'middle',
                    visible:
                        (!this.props.filteredNominalVoltages ||
                            this.props.filteredNominalVoltages.includes(
                                compositeData.nominalVoltage
                            )) &&
                        this.props.labelsVisible,
                    opacity:
                        this.props.loadFlowStatus !== RunningStatus.SUCCEED
                            ? INVALID_LOADFLOW_OPACITY
                            : 1,
                    updateTriggers: {
                        getPosition: [
                            this.props.lineParallelPath,
                            linePathUpdateTriggers,
                        ],
                        getPixelOffset: linePathUpdateTriggers,
                        opacity: [this.props.loadFlowStatus],
                    },
                })
            );
            layers.push(lineActivePowerLabelsLayer);

            // line status
            const lineStatusIconLayer = new IconLayer(
                this.getSubLayerProps({
                    id: 'BranchStatus' + compositeData.nominalVoltage,
                    data: compositeData.branchStatus,
                    getPosition: (branchStatus) => branchStatus.printPosition,
                    getIcon: (branchStatus) => getLineIcon(branchStatus.status),
                    getSize: this.props.iconSize,
                    getColor: (branchStatus) => this.props.labelColor,
                    getPixelOffset: (branchStatus) => branchStatus.offset,
                    visible:
                        (!this.props.filteredNominalVoltages ||
                            this.props.filteredNominalVoltages.includes(
                                compositeData.nominalVoltage
                            )) &&
                        this.props.labelsVisible,
                    updateTriggers: {
                        getPosition: [
                            this.props.lineParallelPath,
                            linePathUpdateTriggers,
                        ],
                        getPixelOffset: linePathUpdateTriggers,
                        getIcon: [this.state.linesStatus],
                        getColor: [this.props.labelColor],
                    },
                })
            );
            layers.push(lineStatusIconLayer);
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
    filteredNominalVoltages: null,
    lineFlowMode: LineFlowMode.FEEDERS,
    lineFlowColorMode: LineFlowColorMode.NOMINAL_VOLTAGE,
    lineFlowAlertThreshold: 100,
    showLineFlow: true,
    lineFullPath: true,
    lineParallelPath: true,
    labelSize: 12,
    iconSize: 48,
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
