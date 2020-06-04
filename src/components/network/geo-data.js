/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import getDistance from "geolib/es/getDistance";
import computeDestinationPoint from "geolib/es/computeDestinationPoint";
import cheapRuler from 'cheap-ruler';

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

    getCoordinateInLine(positions, cumulativeDistances, percent) {
        if (percent > 100 || percent < 0) {
            throw new Error("percent value incorrect: " + percent);
        }
        if (cumulativeDistances === null || cumulativeDistances.length < 2 || cumulativeDistances[1] === 0) {
            return null;
        }
        let lineDistance = cumulativeDistances[cumulativeDistances.length-1];
        let wantedDistance = lineDistance * percent / 100;
        let lowerBound = 0;
        let upperBound = cumulativeDistances.length - 1;
        let i = 0;

        //binary search
        while (true) {
            i = Math.floor((lowerBound + upperBound) / 2);
            if (cumulativeDistances[i] < wantedDistance && cumulativeDistances[i+1] < wantedDistance) {
                lowerBound = i+1;
            }
            else if (cumulativeDistances[i] > wantedDistance) {
                upperBound = i;
            }
            else if (cumulativeDistances[i] < wantedDistance && cumulativeDistances[i+1] > wantedDistance) {
                break;
            }
        }

        //the polyline where we reached the wanted distance
        let goodPolyline = positions.slice(i, i+2);
        let ruler = cheapRuler(goodPolyline[0][1], 'meters');
        let leftDistance = wantedDistance - cumulativeDistances[i];
        let angle = ruler.bearing(goodPolyline[0], goodPolyline[1]);
        let reducedAngle = angle;
        if (angle > 180) {
            reducedAngle = angle - 180;
        }
        const neededOffset = this.getNeededOffset(reducedAngle, 10);
        return {distance :computeDestinationPoint(goodPolyline[0], leftDistance, angle), angle: angle, offset: neededOffset};

    }

    getNeededOffset(angle, offsetDistance) {
        let radiantAngle = (-angle + 90) / (180 / (Math.PI));
        return [Math.cos(radiantAngle)*offsetDistance, -Math.sin(radiantAngle)*offsetDistance];
    }
}
