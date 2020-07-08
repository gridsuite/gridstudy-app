/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

    nominalVoltages = [];

    setSubstations(substations) {
        this.substations = substations;

        // add more infos
        const nominalVoltagesSet = new Set();
        substations.forEach((substation) => {
            // sort voltage levels inside substations by nominal voltage
            substation.voltageLevels = substation.voltageLevels.sort(
                (voltageLevel1, voltageLevel2) =>
                    voltageLevel1.nominalVoltage - voltageLevel2.nominalVoltage
            );

            substation.voltageLevels.forEach((voltageLevel, index) => {
                // add substation id
                voltageLevel.substationId = substation.id;

                // add the current item into the VL map by id
                this.substationsById.set(substation.id, substation);

                nominalVoltagesSet.add(voltageLevel.nominalVoltage);
            });
        });

        this.voltageLevels = this.substations.flatMap(
            (substation) => substation.voltageLevels
        );

        this.voltageLevelsById = this.voltageLevels.reduce(
            voltageLevelIdIndexer,
            new Map()
        );

        this.nominalVoltages = Array.from(nominalVoltagesSet).sort(
            (a, b) => b - a
        );
    }

    setLines(lines) {
        this.lines = lines;
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
