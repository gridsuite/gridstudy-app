/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const elementIdIndexer = (map, element) => {
    map.set(element.id, element);
    return map;
};

export class EquipmentHandler {
    fetcher = undefined;
    errorHandler = undefined;
    postUpdate = undefined;

    constructor(fetcher, errorHandler, postUpdate) {
        this.fetcher = fetcher;
        this.errorHandler = errorHandler;
        this.postUpdate = postUpdate;
    }

    values = undefined;
    updating = undefined;

    cbUpdateDone = new Set();

    get(cbUpdateDone) {
        if (this.values === undefined) {
            if (cbUpdateDone) this.cbUpdateDone.add(cbUpdateDone);
            if (!this.updating) {
                this.updating = true;
                Promise.all([this.fetcher()])
                    .then((val) => {
                        this.values = val[0];
                        if (this.postUpdate) this.postUpdate(this.values);
                        this.updating = false;
                        this.cbUpdateDone.forEach((cb) => cb());
                        this.cbUpdateDone.clear();
                    })
                    .catch((error) => this.errorHandler(error));
            }
            return undefined;
        }
        if (cbUpdateDone) cbUpdateDone();
        return this.values;
    }

    length(cbUpdateDone) {
        return (
            (this.values !== undefined && this.values.length) ||
            this.get(cbUpdateDone)
        );
    }
}

export default class Network {
    substations;

    lines = undefined;

    twoWindingsTransformers = undefined;

    threeWindingsTransformers = undefined;

    generators = undefined;

    loads = undefined;

    batteries = undefined;

    danglingLines = undefined;

    hvdcLines = undefined;

    lccConverterStations = undefined;

    vscConverterStations = undefined;

    shuntCompensators = undefined;

    staticVarCompensators = undefined;

    voltageLevelsByNominalVoltage = new Map();

    voltageLevelsById = new Map();

    substationsById = new Map();

    linesById = new Map();

    twoWindingsTransformersById = new Map();

    threeWindingsTransformersById = new Map();

    generatorsById = new Map();

    nominalVoltages = [];

    completeSubstationsInfos = (substations) => {
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

        this.voltageLevels = this.substations
            .get()
            .flatMap((substation) => substation.voltageLevels);

        this.voltageLevelsById = this.voltageLevels.reduce(
            elementIdIndexer,
            new Map()
        );

        this.nominalVoltages = Array.from(nominalVoltagesSet).sort(
            (a, b) => b - a
        );
    };

    updateEquipments(currentEquipments, newEquipements) {
        currentEquipments.values.forEach((equipment1, index) => {
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

    makeEqHandler(cb, errHandler, postUpdateCB) {
        return new EquipmentHandler(cb, errHandler, postUpdateCB);
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
        this.substations = this.makeEqHandler(
            substations,
            errHandler,
            this.completeSubstationsInfos
        );

        this.lines = this.makeEqHandler(
            lines,
            errHandler,
            this.completeLinesInfos
        );
        this.twoWindingsTransformers = this.makeEqHandler(
            twoWindingsTransformers,
            errHandler,
            this.completeTwoWindingsTransformersInfos
        );
        this.threeWindingsTransformers = this.makeEqHandler(
            threeWindingsTransformers,
            errHandler,
            this.completeThreeWindingsTransformersInfos
        );
        this.generators = this.makeEqHandler(
            generators,
            errHandler,
            this.completeGeneratorsInfos
        );
        this.loads = this.makeEqHandler(loads, errHandler);
        this.batteries = this.makeEqHandler(batteries, errHandler);
        this.danglingLines = this.makeEqHandler(danglingLines, errHandler);
        this.hvdcLines = this.makeEqHandler(hvdcLines, errHandler);
        this.lccConverterStations = this.makeEqHandler(
            lccConverterStations,
            errHandler
        );
        this.vscConverterStations = this.makeEqHandler(
            vscConverterStations,
            errHandler
        );
        this.shuntCompensators = this.makeEqHandler(
            shuntCompensators,
            errHandler
        );
        this.staticVarCompensators = this.makeEqHandler(
            staticVarCompensators,
            errHandler
        );
    }
}
