/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// index voltage level by id and add substation id property
const voltageLevelNominalVoltageIndexer = (map, voltageLevel) => {
    let list = map.get(voltageLevel.nominalVoltage);
    if (!list) {
        list = [];
        map.set(voltageLevel.nominalVoltage, list);
    }
    list.push(voltageLevel);
    return map;
};

const voltageLevelIdIndexer = (map, voltageLevel) => {
    map.set(voltageLevel.id, voltageLevel);
    return map;
};

const substationPositionByIdIndexer = (map, substation) => {
    map.set(substation.id, substation.coordinate);
    return map;
};

const linePositionIndexer = (map, line) => {
    map.set(line.id, line.coordinates);
    return map;
};

export default class Network {

    substations = [];

    lines = [];

    voltageLevelsByNominalVoltage = new Map();

    voltageLevelsById = new Map();

    substationPositionsById = new Map();

    linePositions = new Map();

    setSubstations(substations) {
        this.substations = substations;

        // add more infos
        substations.forEach(substation => {
            // sort voltage levels inside substations by nominal voltage
            substation.voltageLevels = substation.voltageLevels.sort((voltageLevel1, voltageLevel2) => voltageLevel1.nominalVoltage - voltageLevel2.nominalVoltage);

            substation.voltageLevels.forEach((voltageLevel, index) => {
                // add substation id
                voltageLevel.substationId = substation.id;

                // add index in substation
                voltageLevel.voltageLevelIndex = index;

                // add count in substation
                voltageLevel.voltageLevelCount = substation.voltageLevels.length;
            });
        });

        this.voltageLevels = this.substations.flatMap(substation => substation.voltageLevels);

        this.voltageLevelsByNominalVoltage = this.voltageLevels.reduce(voltageLevelNominalVoltageIndexer, new Map());

        this.voltageLevelsById = this.voltageLevels.reduce(voltageLevelIdIndexer, new Map());
    }

    setLines(lines) {
        this.lines = lines;
    }

    setSubstationPositions(positions) {
        // index positions by substation id
        this.substationPositionsById = positions.reduce(substationPositionByIdIndexer, new Map());
    }

    getSubstationPosition(substation) {
        const position = this.substationPositionsById.get(substation);
        if (!position) {
            return [0, 0, 0];
            //throw new Error(`Position not found for ${substation}`);
        }
        return [position.lon, position.lat, 0];
    }

    getVoltageLevels() {
        return Array.from(this.voltageLevelsById.values());
    }

    setLinePositions(positions) {
        // index positions by line id
        this.linePositions = positions.reduce(linePositionIndexer, new Map());
    }

    getLinePositions(line) {
        const linePosition = this.linePositions.get(line.id);
        if (linePosition) {
            return linePosition.map(c => [c.lon, c.lat]);
        } else {
            const voltageLevel1 = this.getVoltageLevel(line.voltageLevelId1);
            const voltageLevel2 = this.getVoltageLevel(line.voltageLevelId2);
            const substationPosition1 = this.getSubstationPosition(voltageLevel1.substationId);
            const substationPosition2 = this.getSubstationPosition(voltageLevel2.substationId);
            return [ substationPosition1, substationPosition2 ];
        }
    };

    getVoltageLevel(id) {
        const voltageLevel = this.voltageLevelsById.get(id);
        if (!voltageLevel) {
            throw new Error(`Voltage level ${id} not found`);
        }
        return voltageLevel;
    }
}
