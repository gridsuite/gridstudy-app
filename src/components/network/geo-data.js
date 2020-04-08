/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import getDistance from "geolib/es/getDistance";

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
            const distSub1 = getDistance({latitude : substationPosition1[1],longitude : substationPosition1[0]}, {latitude : positions[0][1],longitude : positions[0][0]});
            const distSub2 = getDistance({latitude : substationPosition2[1],longitude : substationPosition2[0]}, {latitude : positions[0][1],longitude : positions[0][0]});

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
