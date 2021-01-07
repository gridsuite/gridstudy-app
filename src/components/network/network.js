/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const elementIdIndexer = (map, element) => {
    map.set(element.id, element);
    return map;
};

export default class Network {
    substations = [];

    lines = [];

    twoWindingsTransformers = [];

    threeWindingsTransformers = [];

    generators = [];

    voltageLevelsById = new Map();

    substationsById = new Map();

    linesById = new Map();

    twoWindingsTransformersById = new Map();

    threeWindingsTransformersById = new Map();

    generatorsById = new Map();

    nominalVoltages = [];

    completeSubstationsInfos = () => {
        const nominalVoltagesSet = new Set();
        this.substations.forEach((substation) => {
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
            elementIdIndexer,
            new Map()
        );

        this.nominalVoltages = Array.from(nominalVoltagesSet).sort(
            (a, b) => b - a
        );
    };

    setSubstations(substations) {
        this.substations = substations;

        // add more infos
        this.completeSubstationsInfos();
    }

    updateSubstations(substations) {
        this.substations.forEach((substation1, index) => {
            const found = substations.filter(
                (substation2) => substation2.id === substation1.id
            );
            this.substations[index] = found.length > 0 ? found[0] : substation1;
        });

        // add more infos
        this.completeSubstationsInfos();
    }

    setLines(lines) {
        this.lines = lines;
        this.linesById = this.lines.reduce(elementIdIndexer, new Map());
    }

    updateLines(lines) {
        this.lines.forEach((line1, index) => {
            const found = lines.filter((line2) => line2.id === line1.id);
            this.lines[index] = found.length > 0 ? found[0] : line1;
        });
    }

    setTwoWindingsTransformers(twoWindingsTransformers) {
        this.twoWindingsTransformers = twoWindingsTransformers;
        this.twoWindingsTransformersById = this.twoWindingsTransformers.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateTwoWindingsTransformers(twoWindingsTransformers) {
        this.twoWindingsTransformers.forEach((t1, index) => {
            const found = twoWindingsTransformers.filter(
                (t2) => t2.id === t1.id
            );
            this.twoWindingsTransformers[index] =
                found.length > 0 ? found[0] : t1;
        });
    }

    setThreeWindingsTransformers(threeWindingsTransformers) {
        this.threeWindingsTransformers = threeWindingsTransformers;
        this.threeWindingsTransformersById = this.threeWindingsTransformers.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateThreeWindingsTransformers(threeWindingsTransformers) {
        this.threeWindingsTransformers.forEach((t1, index) => {
            const found = threeWindingsTransformers.filter(
                (t2) => t2.id === t1.id
            );
            this.threeWindingsTransformers[index] =
                found.length > 0 ? found[0] : t1;
        });
    }

    setGenerators(generators) {
        this.generators = generators;
        this.generatorsById = this.generators.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateGenerators(generators) {
        this.generators.forEach((g1, index) => {
            const found = generators.filter((g2) => g2.id === g1.id);
            this.generators[index] = found.length > 0 ? found[0] : g1;
        });
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

    getLine(id) {
        return this.linesById.get(id);
    }

    getTwoWindingsTransformer(id) {
        return this.twoWindingsTransformersById.get(id);
    }

    getThreeWindingsTransformer(id) {
        return this.threeWindingsTransformersById.get(id);
    }

    getGenerator(id) {
        return this.generatorsById.get(id);
    }

    getLineOrTransformer(id) {
        return (
            this.getLine(id) ||
            this.getTwoWindingsTransformer(id) ||
            this.getThreeWindingsTransformer(id)
        );
    }
}
