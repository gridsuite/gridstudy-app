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

export default class Network {

    substations = [];

    lines = [];

    voltageLevelsByNominalVoltage = new Map();

    voltageLevelsById = new Map();

    substationsById = new Map();

    linesByNominalVoltage = new Map();

    nominalVoltages = [];

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

                // add the current item into the VL map by id
                this.substationsById.set(substation.id, substation);
            });
        });

        this.voltageLevels = this.substations.flatMap(substation => substation.voltageLevels);

        this.voltageLevelsByNominalVoltage = this.voltageLevels.reduce(voltageLevelNominalVoltageIndexer, new Map());

        this.voltageLevelsById = this.voltageLevels.reduce(voltageLevelIdIndexer, new Map());

        this.nominalVoltages = Array.from(this.voltageLevelsByNominalVoltage.keys()).sort((a, b) => b - a)
    }

    setLines(lines) {
        this.lines = lines;
        this.lines.forEach(line => {
            const vl = this.getVoltageLevel(line.voltageLevelId1) || this.getVoltageLevel(line.voltageLevelId2);
            if (vl) {
                let list = this.linesByNominalVoltage.get(vl.nominalVoltage);
                if (!list) {
                    list = [];
                    this.linesByNominalVoltage.set(vl.nominalVoltage, list);
                }
                list.push(line);
            }
        })
    }

    getVoltageLevels() {
        return Array.from(this.voltageLevelsById.values());
    }

    getVoltageLevel(id) {
        return this.voltageLevelsById.get(id);
    }

    getSubstations() {
        return Array.from(this.substationsById.values());
    }

    getSubstation(id) {
        return this.substationsById.get(id);
    }

    getNominalVoltages() {
        return this.nominalVoltages;
    }
}
