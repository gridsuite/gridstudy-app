/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const substationPositionByIdIndexer = (map, substation) => {
    map.set(substation.id, substation.coordinate);
    return map;
};

const linePositionIndexer = (map, line) => {
    map.set(line.id, line.coordinates);
    return map;
};

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        const radlat1 = Math.PI * lat1/180;
        const radlat2 = Math.PI * lat2/180;
        const theta = lon1-lon2;
        const radtheta = Math.PI * theta/180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit==="K") { dist = dist * 1.609344 }
        if (unit==="M") { dist = dist * 1609.344 }
        if (unit==="N") { dist = dist * 0.8684 }
        return dist;
    }
}

export default class GeoData {

    substationPositionsById = new Map();

    linePositions = new Map();

    setSubstationPositions(positions) {
        // index positions by substation id
        this.substationPositionsById = positions.reduce(substationPositionByIdIndexer, new Map());
    }

    getSubstationPosition(substation) {
        const position = this.substationPositionsById.get(substation);
        if (!position) {
            console.warn(`Position not found for ${substation}`);
            return [0, 0, 0];
        }
        return [position.lon, position.lat, 0];
    }

    setLinePositions(positions) {
        // index positions by line id
        this.linePositions = positions.reduce(linePositionIndexer, new Map());
    }

    getLinePositions(network, line) {
        const linePosition = this.linePositions.get(line.id);
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

        if (linePosition) {
            const positions = linePosition.map(c => [c.lon, c.lat]);
            const distSub1 = distance(substationPosition1[1],substationPosition1[0],positions[0][1],positions[0][0], "M");
            const distSub2 = distance(substationPosition2[1],substationPosition2[0],positions[0][1],positions[0][0], "M");

            if (distSub1 < distSub2) {
                return [substationPosition1].concat(positions.concat([substationPosition2]));
            } else {
                return [substationPosition2].concat(positions.concat([substationPosition1]));
            }
        } else {
            const substationPosition1 = this.getSubstationPosition(voltageLevel1.substationId);
            const substationPosition2 = this.getSubstationPosition(voltageLevel2.substationId);
            return [ substationPosition1, substationPosition2 ];
        }
    };
}
