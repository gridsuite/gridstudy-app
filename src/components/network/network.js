/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RemoteRessourceHandler } from '../util/remote-ressource-handler';

const elementIdIndexer = (map, element) => {
    map.set(element.id, element);
    return map;
};

export default class Network {
    substations;

    lines;

    twoWindingsTransformers;

    threeWindingsTransformers;

    generators;

    loads;

    batteries;

    danglingLines;

    hvdcLines;

    lccConverterStations;

    vscConverterStations;

    shuntCompensators;

    staticVarCompensators;

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
        this.substations.values.forEach((substation) => {
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

        this.voltageLevels = this.substations.values.flatMap(
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

    updateEquipments(currentEquipments, newEquipements) {
        if (currentEquipments.values === undefined) return;
        currentEquipments.values.forEach((equipment1, index) => {
            const found = newEquipements.filter(
                (equipment2) => equipment2.id === equipment1.id
            );
            currentEquipments.values[index] =
                found.length > 0
                    ? found[0]
                    : {
                          ...currentEquipments.values[index],
                          ...equipment1,
                      };
        });
    }

    updateSubstations(substations) {
        this.updateEquipments(this.substations, substations);

        // add more infos
        this.completeSubstationsInfos();
    }

    completeLinesInfos(lines) {
        this.linesById = lines.reduce(elementIdIndexer, new Map());
    }

    updateLines(lines) {
        this.updateEquipments(this.lines, lines);
    }

    completeTwoWindingsTransformersInfos(twoWindingsTransformers) {
        this.twoWindingsTransformersById = twoWindingsTransformers.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateTwoWindingsTransformers(twoWindingsTransformers) {
        this.updateEquipments(
            this.twoWindingsTransformers,
            twoWindingsTransformers
        );
    }

    completeThreeWindingsTransformersInfos(threeWindingsTransformers) {
        this.threeWindingsTransformersById = threeWindingsTransformers.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateThreeWindingsTransformers(threeWindingsTransformers) {
        this.updateEquipments(
            this.threeWindingsTransformers,
            threeWindingsTransformers
        );
    }

    completeGeneratorsInfos(generators) {
        this.generatorsById = generators.reduce(elementIdIndexer, new Map());
    }

    updateGenerators(generators) {
        this.updateEquipments(this.generators, generators);
    }

    updateBatteries(batteries) {
        this.updateEquipments(this.batteries, batteries);
    }

    updateLoads(loads) {
        this.updateEquipments(this.loads, loads);
    }

    updateDanglingLines(danglingLines) {
        this.updateEquipments(this.danglingLines, danglingLines);
    }

    updateShuntCompensators(shuntCompensators) {
        this.updateEquipments(this.shuntCompensators, shuntCompensators);
    }

    updateStaticVarCompensators(staticVarCompensators) {
        this.updateEquipments(
            this.staticVarCompensators,
            staticVarCompensators
        );
    }

    updateHvdcLines(hvdcLines) {
        this.updateEquipments(this.hvdcLines, hvdcLines);
    }

    updateLccConverterStations(lccConverterStations) {
        this.updateEquipments(this.lccConverterStations, lccConverterStations);
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

    makeEquipmentHandler(cb, errHandler, postUpdateCB) {
        return new RemoteRessourceHandler(cb, errHandler, postUpdateCB);
    }
    constructor(
        substations,
        lines,
        twoWindingsTransformers,
        threeWindingsTransformers,
        generators,
        loads,
        batteries,
        danglingLines,
        hvdcLines,
        lccConverterStations,
        vscConverterStations,
        shuntCompensators,
        staticVarCompensators,
        errHandler
    ) {
        this.substations = this.makeEquipmentHandler(
            substations,
            errHandler,
            this.completeSubstationsInfos
        );

        this.lines = this.makeEquipmentHandler(
            lines,
            errHandler,
            this.completeLinesInfos
        );
        this.twoWindingsTransformers = this.makeEquipmentHandler(
            twoWindingsTransformers,
            errHandler,
            this.completeTwoWindingsTransformersInfos
        );
        this.threeWindingsTransformers = this.makeEquipmentHandler(
            threeWindingsTransformers,
            errHandler,
            this.completeThreeWindingsTransformersInfos
        );
        this.generators = this.makeEquipmentHandler(
            generators,
            errHandler,
            this.completeGeneratorsInfos
        );
        this.loads = this.makeEquipmentHandler(loads, errHandler);
        this.batteries = this.makeEquipmentHandler(batteries, errHandler);
        this.danglingLines = this.makeEquipmentHandler(
            danglingLines,
            errHandler
        );
        this.hvdcLines = this.makeEquipmentHandler(hvdcLines, errHandler);
        this.lccConverterStations = this.makeEquipmentHandler(
            lccConverterStations,
            errHandler
        );
        this.vscConverterStations = this.makeEquipmentHandler(
            vscConverterStations,
            errHandler
        );
        this.shuntCompensators = this.makeEquipmentHandler(
            shuntCompensators,
            errHandler
        );
        this.staticVarCompensators = this.makeEquipmentHandler(
            staticVarCompensators,
            errHandler
        );
    }
}
