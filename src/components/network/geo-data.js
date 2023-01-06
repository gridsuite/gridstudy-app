/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import computeDestinationPoint from 'geolib/es/computeDestinationPoint';
import cheapRuler from 'cheap-ruler';
import getGreatCircleBearing from 'geolib/es/getGreatCircleBearing';
import getRhumbLineBearing from 'geolib/es/getRhumbLineBearing';
import { ArrowDirection } from './layers/arrow-layer';

const substationPositionByIdIndexer = (map, substation) => {
    map.set(substation.id, substation.coordinate);
    return map;
};

const linePositionByIdIndexer = (map, line) => {
    map.set(line.id, line.coordinates);
    return map;
};

export default class GeoData {
    substationPositionsById = new Map();

    linePositionsById = new Map();

    constructor(substationPositionsById, linePositionsById) {
        this.substationPositionsById = substationPositionsById;
        this.linePositionsById = linePositionsById;
    }

    setSubstationPositions(positions) {
        // index positions by substation id
        this.substationPositionsById = positions.reduce(
            substationPositionByIdIndexer,
            new Map()
        );
    }

    addSubstationPositions(positions) {
        positions.forEach((pos) =>
            this.substationPositionsById.set(pos.id, pos.coordinate)
        );
    }

    getSubstationPosition(substationId) {
        const position = this.substationPositionsById.get(substationId);
        if (!position) {
            console.warn(`Position not found for ${substationId}`);
            return null;
        }
        return [position.lon, position.lat];
    }

    setLinePositions(positions) {
        // index positions by line id
        this.linePositionsById = positions.reduce(
            linePositionByIdIndexer,
            new Map()
        );
    }

    addLinePositions(positions) {
        positions.forEach((pos) => {
            this.linePositionsById.set(pos.id, pos.coordinates);
        });
    }

    /**
     * Get line positions always ordered from side 1 to side 2.
     */
    getLinePositions(network, line, detailed = true) {
        const voltageLevel1 = network.getVoltageLevel(line.voltageLevelId1);
        if (!voltageLevel1) {
            throw new Error(
                `Voltage level side 1 '${line.voltageLevelId1}' not found`
            );
        }
        const voltageLevel2 = network.getVoltageLevel(line.voltageLevelId2);
        if (!voltageLevel2) {
            throw new Error(
                `Voltage level side 2 '${line.voltageLevelId1}' not found`
            );
        }
        const substationPosition1 = this.getSubstationPosition(
            voltageLevel1.substationId
        );
        const substationPosition2 = this.getSubstationPosition(
            voltageLevel2.substationId
        );

        if(substationPosition1 === null || substationPosition2 === null) {
            return [[0, 0], [0, 0]];
        }

        if (detailed) {
            const linePositions = this.linePositionsById.get(line.id);
            // Is there any position for this line ?
            if (linePositions) {
                const positions = new Array(linePositions.length);

                for (const [index, position] of linePositions.entries()) {
                    positions[index] = [position.lon, position.lat];
                }

                return positions;
            }
        }

        return [substationPosition1, substationPosition2];
    }

    getLineDistances(positions) {
        if (positions !== null && positions.length > 1) {
            let cumulativeDistanceArray = [0];
            let cumulativeDistance = 0;
            let segmentDistance;
            let ruler;
            for (let i = 0; i < positions.length - 1; i++) {
                ruler = new cheapRuler(positions[i][1], 'meters');
                segmentDistance = ruler.lineDistance(positions.slice(i, i + 2));
                cumulativeDistance = cumulativeDistance + segmentDistance;
                cumulativeDistanceArray[i + 1] = cumulativeDistance;
            }
            return cumulativeDistanceArray;
        }
        return null;
    }

    /**
     * Find the segment in which we reach the wanted distance and return the segment
     * along with the remaining distance to travel on this segment to be at the exact wanted distance
     * (implemented using a binary search)
     */
    findSegment(positions, cumulativeDistances, wantedDistance) {
        let lowerBound = 0;
        let upperBound = cumulativeDistances.length - 1;
        let middlePoint;
        while (lowerBound + 1 !== upperBound) {
            middlePoint = Math.floor((lowerBound + upperBound) / 2);
            let middlePointDistance = cumulativeDistances[middlePoint];
            if (middlePointDistance <= wantedDistance) {
                lowerBound = middlePoint;
            } else {
                upperBound = middlePoint;
            }
        }
        return {
            idx: lowerBound,
            segment: positions.slice(lowerBound, lowerBound + 2),
            remainingDistance: wantedDistance - cumulativeDistances[lowerBound],
        };
    }

    labelDisplayPosition(
        positions,
        cumulativeDistances,
        arrowPosition,
        arrowDirection,
        lineParallelIndex,
        lineAngle,
        proximityAngle,
        distanceBetweenLines,
        proximityFactor
    ) {
        if (arrowPosition > 1 || arrowPosition < 0) {
            throw new Error(
                'Proportional position value incorrect: ' + arrowPosition
            );
        }
        if (
            cumulativeDistances === null ||
            cumulativeDistances.length < 2 ||
            cumulativeDistances[cumulativeDistances.length - 1] === 0
        ) {
            return null;
        }
        let lineDistance = cumulativeDistances[cumulativeDistances.length - 1];
        let wantedDistance = lineDistance * arrowPosition;

        if (cumulativeDistances.length === 2) {
            // For parallel lines, the initial fork line distance does not count
            // when there are no intermediate points between the substations.
            // I'm not sure this is entirely correct but it displays well enough.
            wantedDistance =
                wantedDistance -
                2 * distanceBetweenLines * arrowPosition * proximityFactor;
        }

        let goodSegment = this.findSegment(
            positions,
            cumulativeDistances,
            wantedDistance
        );

        // We don't have the exact same distance calculation as in the arrow shader, so take some margin:
        // we move the label a little bit on the flat side of the arrow so that at least it stays
        // on the right side when zooming
        let multiplier;
        switch (arrowDirection) {
            case ArrowDirection.FROM_SIDE_2_TO_SIDE_1:
                multiplier = 1.005;
                break;
            case ArrowDirection.FROM_SIDE_1_TO_SIDE_2:
                multiplier = 0.995;
                break;
            case ArrowDirection.NONE:
                multiplier = 1;
                break;
            default:
                throw new Error('impossible');
        }
        let remainingDistance = goodSegment.remainingDistance * multiplier;

        let angle = this.getMapAngle(
            goodSegment.segment[0],
            goodSegment.segment[1]
        );
        const neededOffset = this.getLabelOffset(angle, 20, arrowDirection);

        const position = {
            position: computeDestinationPoint(
                goodSegment.segment[0],
                remainingDistance,
                angle
            ),
            angle: angle,
            offset: neededOffset,
        };
        // apply parallel spread between lines
        position.position = computeDestinationPoint(
            position.position,
            distanceBetweenLines * lineParallelIndex,
            lineAngle + 90
        );
        if (cumulativeDistances.length === 2) {
            // For line with only one segment, we can just apply a translation by lineAngle because both segment ends
            // connect to fork lines. This accounts for the fact that the forkline part of the line doesn't count
            position.position = computeDestinationPoint(
                position.position,
                -distanceBetweenLines * proximityFactor,
                lineAngle
            );
        } else if (
            goodSegment.idx === 0 ||
            goodSegment.idx === cumulativeDistances.length - 2
        ) {
            // When the label is on the first or last segment and there is an intermediate point,
            // when must shift by the percentange of position of the label on this segment
            const segmentDistance =
                cumulativeDistances[goodSegment.idx + 1] -
                cumulativeDistances[goodSegment.idx];
            const alreadyDoneDistance = segmentDistance - remainingDistance;
            let labelDistanceInSegment;
            if (goodSegment.idx === 0) {
                labelDistanceInSegment = -alreadyDoneDistance;
            } else {
                labelDistanceInSegment = remainingDistance;
            }
            const labelPercentage = labelDistanceInSegment / segmentDistance;
            position.position = computeDestinationPoint(
                position.position,
                distanceBetweenLines * labelPercentage,
                proximityAngle
            );
        }

        return position;
    }

    getLabelOffset(angle, offsetDistance, arrowDirection) {
        let radiantAngle = (-angle + 90) / (180 / Math.PI);
        let direction = 0;
        switch (arrowDirection) {
            case ArrowDirection.FROM_SIDE_2_TO_SIDE_1:
                direction = 1;
                break;
            case ArrowDirection.FROM_SIDE_1_TO_SIDE_2:
                direction = -1;
                break;
            case ArrowDirection.NONE:
                direction = 0;
                break;
            default:
                throw new Error('impossible');
        }
        //Y offset is negative because deckGL pixel uses a top-left coordinate system and our computation use orthogonal coordinates
        return [
            Math.cos(radiantAngle) * offsetDistance * direction,
            -Math.sin(radiantAngle) * offsetDistance * direction,
        ];
    }

    //returns the angle between point1 and point2 in degrees [0-360)
    getMapAngle(point1, point2) {
        // We don't have the exact same angle calculation as in the arrow shader, and this
        // seems to give more approaching results
        let angle = getRhumbLineBearing(point1, point2);
        let angle2 = getGreatCircleBearing(point1, point2);
        const coeff = 0.1;
        angle = coeff * angle + (1 - coeff) * angle2;
        return angle;
    }
}
