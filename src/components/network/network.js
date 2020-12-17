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

    loads = [];

    batteries = [];

    danglingLines = [];

    hvdcLines = [];

    lccConverterStations = [];

    vscConverterStations = [];

    shuntCompensators = [];

    staticVarCompensators = [];

    voltageLevelsByNominalVoltage = new Map();

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

    updateEquipments(currentEquipments, newEquipements) {
        currentEquipments.forEach((equipment1, index) => {
            const found = newEquipements.filter(
                (equipment2) => equipment2.id === equipment1.id
            );
            currentEquipments[index] = found.length > 0 ? found[0] : equipment1;
        });
    }

    updateSubstations(substations) {
        this.updateEquipments(this.substations, substations);

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

    updateLines(lines) {
        this.updateEquipments(this.lines, lines);
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

    updateTwoWindingsTransformers(twoWindingsTransformers) {
        this.updateEquipments(
            this.twoWindingsTransformers,
            twoWindingsTransformers
        );
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

    updateThreeWindingsTransformers(threeWindingsTransformers) {
        this.updateEquipments(
            this.threeWindingsTransformers,
            threeWindingsTransformers
        );
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

    updateGenerators(generators) {
        this.updateEquipments(this.generators, generators);
    }

    setBatteries(batteries) {
        this.batteries = batteries;
    }

    updateBatteries(batteries) {
        this.updateEquipments(this.batteries, batteries);
    }

    setLoads(loads) {
        this.loads = loads;
    }

    updateLoads(loads) {
        this.updateEquipments(this.loads, loads);
    }

    setDanglingLines(danglingLines) {
        this.danglingLines = danglingLines;
    }

    updateDanglingLines(danglingLines) {
        this.updateEquipments(this.danglingLines, danglingLines);
    }

    setShuntCompensators(shuntCompensators) {
        this.shuntCompensators = shuntCompensators;
    }

    updateShuntCompensators(shuntCompensators) {
        this.updateEquipments(this.shuntCompensators, shuntCompensators);
    }

    setStaticVarCompensators(staticVarCompensators) {
        this.staticVarCompensators = staticVarCompensators;
    }

    updateStaticVarCompensators(staticVarCompensators) {
        this.updateEquipments(
            this.staticVarCompensators,
            staticVarCompensators
        );
    }

    setHvdcLines(hvdcLines) {
        this.hvdcLines = hvdcLines;
    }

    updateHvdcLines(hvdcLines) {
        this.updateEquipments(this.hvdcLines, hvdcLines);
    }

    setLccConverterStations(lccConverterStations) {
        this.lccConverterStations = lccConverterStations;
    }

    updateLccConverterStations(lccConverterStations) {
        this.updateEquipments(this.lccConverterStations, lccConverterStations);
    }

    setVscConverterStations(vscConverterStations) {
        this.vscConverterStations = vscConverterStations;
    }

    updateVscConverterStations(vscConverterStations) {
        this.updateEquipments(this.vscConverterStations, vscConverterStations);
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
