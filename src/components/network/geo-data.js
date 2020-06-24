/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import getDistance from "geolib/es/getDistance";
import computeDestinationPoint from "geolib/es/computeDestinationPoint";
import cheapRuler from 'cheap-ruler';
import getGreatCircleBearing from "geolib/es/getGreatCircleBearing";
import {ArrowDirection} from "./layers/arrow-layer";

const substationPositionByIdIndexer = (map, substation) => {
    map.set(substation.id, substation.coordinate);
    return map;
};

const linePositionIndexer = (map, line) => {
    map.set(line.id, line.coordinates);
    return map;
};

export default class GeoData {

    substationPositionsById = new Map();

    linePositionsById = new Map();

    setSubstationPositions(positions) {
        // index positions by substation id
        this.substationPositionsById = positions.reduce(substationPositionByIdIndexer, new Map());
    }

    getSubstationPosition(substation) {
        const position = this.substationPositionsById.get(substation);
        if (!position) {
            console.warn(`Position not found for ${substation}`);
            return [0, 0];
        }
        return [position.lon, position.lat];
    }

    setLinePositions(positions) {
        // index positions by line id
        this.linePositionsById = positions.reduce(linePositionIndexer, new Map());
    }

    /**
     * Get line positions always ordered from side 1 to side 2.
     */
    getLinePositions(network, line, detailed = true) {
        const voltageLevel1 = network.getVoltageLevel(line.voltageLevelId1);
        if (!voltageLevel1) {
            throw new Error(`Voltage level side 1 '${line.voltageLevelId1}' not found`);
        }
        const voltageLevel2 = network.getVoltageLevel(line.voltageLevelId2);
        if (!voltageLevel2) {
            throw new Error(`Voltage level side 2 '${line.voltageLevelId1}' not found`);
        }
        const substationPosition1 = this.getSubstationPosition(voltageLevel1.substationId);
        const substationPosition2 = this.getSubstationPosition(voltageLevel2.substationId);
        if (detailed) {
            const linePositions = this.linePositionsById.get(line.id);
            if (linePositions) {
                const firstPosition = linePositions[0];
                const distSub1 = getDistance({latitude: substationPosition1[1], longitude: substationPosition1[0]},
                    {latitude: firstPosition.lat, longitude: firstPosition.lon});
                const distSub2 = getDistance({latitude: substationPosition2[1], longitude: substationPosition2[0]},
                    {latitude: firstPosition.lon, longitude: firstPosition.lon});

                const positions = new Array(linePositions.length + 2);

                if (distSub1 < distSub2) {
                    positions[0] = substationPosition1;
                    linePositions.forEach((position, index) => positions[index + 1] = [position.lon, position.lat]);
                    positions[positions.length - 1] = substationPosition2;
                } else {
                    // reverse positions order to go from side 1 to 2
                    positions[0] = substationPosition2;
                    for (let index = linePositions.length - 1; index >= 0; index--) {
                        const position = linePositions[index];
                        positions[linePositions.length - index] = [position.lon, position.lat];
                    }
                    positions[positions.length - 1] = substationPosition1;
                }
                return positions;
            }
        }

        return [ substationPosition1, substationPosition2 ];
    };

    getLineDistances(positions) {
        if (positions !== null && positions.length > 1) {
            let cumulativeDistanceArray = [0];
            let cumulativeDistance = 0;
            let segmentDistance;
            let ruler;
            for (let i = 0; i < positions.length - 1; i++) {
                ruler = cheapRuler(positions[i][1], 'meters');
                segmentDistance = ruler.lineDistance(positions.slice(i, i + 2));
                cumulativeDistance = cumulativeDistance + segmentDistance;
                cumulativeDistanceArray[i+1] = cumulativeDistance;
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
        let upperBound = cumulativeDistances.length-1;
        let middlePoint;
        while(lowerBound + 1 !== upperBound) {
            middlePoint = Math.floor((lowerBound + upperBound) / 2);
            let middlePointDistance = cumulativeDistances[middlePoint];
            if (middlePointDistance <= wantedDistance) {
                lowerBound = middlePoint;
            } else {
                upperBound = middlePoint;
            }
        }
        return {segment: positions.slice(lowerBound, lowerBound+2), remainingDistance: wantedDistance - cumulativeDistances[lowerBound]};
    }


    labelDisplayPosition(positions, cumulativeDistances, arrowPosition, arrowDirection) {
        if (arrowPosition > 1 || arrowPosition < 0) {
            throw new Error("Proportional position value incorrect: " + arrowPosition);
        }
        if (cumulativeDistances === null || cumulativeDistances.length < 2 || cumulativeDistances[cumulativeDistances.length-1] === 0) {
            return null;
        }
        let lineDistance = cumulativeDistances[cumulativeDistances.length-1];
        let wantedDistance = lineDistance * arrowPosition;

        let goodSegment = this.findSegment(positions, cumulativeDistances, wantedDistance);

        let remainingDistance = goodSegment.remainingDistance;
        let angle = getGreatCircleBearing(goodSegment.segment[0], goodSegment.segment[1]);

        const neededOffset = this.getLabelOffset(angle, 30, arrowDirection);
        return {position :computeDestinationPoint(goodSegment.segment[0], remainingDistance, angle), angle: angle, offset: neededOffset};

    }

    getLabelOffset(angle, offsetDistance, arrowDirection) {
        let radiantAngle = (-angle + 90) / (180 / (Math.PI));
        //Y offset is negative because deckGL pixel uses a top-left coordinate system and our computation use orthogonal coordinates
        let offset = [Math.cos(radiantAngle)*offsetDistance, -Math.sin(radiantAngle)*offsetDistance];
        if(arrowDirection === ArrowDirection.FROM_SIDE_1_TO_SIDE_2)
        {
            offset = [-offset[0], -offset[1]];
        }
        return offset;
    }
}
