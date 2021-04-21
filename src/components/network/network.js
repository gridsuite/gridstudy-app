/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RemoteResourceHandler } from '../util/remote-resource-handler';
import { updateNetwork } from '../../redux/actions';

const elementIdIndexer = (map, element) => {
    map.set(element.id, element);
    return map;
};

export const equipements = {
    substations: 'substations',
    voltageLevels: 'voltageLevels',
    lines: 'lines',
    twoWindingsTransformers: 'twoWindingsTransformers',
    threeWindingsTransformers: 'threeWindingsTransformers',
    generators: 'generators',
    loads: 'loads',
    batteries: 'batteries',
    danglingLines: 'danglingLines',
    hvdcLines: 'hvdcLines',
    lccConverterStations: 'lccConverterStations',
    vscConverterStations: 'vscConverterStations',
    shuntCompensators: 'shuntCompensators',
    staticVarCompensators: 'staticVarCompensators',
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

    lazyLoaders = new Map();

    voltageLevelsByNominalVoltage = new Map();

    voltageLevelsById = new Map();

    substationsById = new Map();

    linesById = new Map();

    twoWindingsTransformersById = new Map();

    threeWindingsTransformersById = new Map();

    generatorsById = new Map();

    nominalVoltages = [];

    completeSubstationsInfos() {
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
    }

    updateEquipments(currentEquipments, newEquipements) {
        currentEquipments.forEach((equipment1, index) => {
            const found = newEquipements.filter(
                (equipment2) => equipment2.id === equipment1.id
            );
            currentEquipments[index] = found.length > 0 ? found[0] : equipment1;
        });
        console.info('updatedEquipements');
        console.info(newEquipements);
    }

    updateSubstations(substations) {
        this.updateEquipments(this.substations, substations);

        // add more infos
        this.completeSubstationsInfos();
    }

    completeLinesInfos() {
        this.linesById = this.lines.reduce(elementIdIndexer, new Map());
    }

    updateLines(lines) {
        this.updateEquipments(this.lines, lines);
    }

    completeTwoWindingsTransformersInfos() {
        this.twoWindingsTransformersById = this.twoWindingsTransformers.reduce(
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

    completeThreeWindingsTransformersInfos() {
        this.threeWindingsTransformersById = this.threeWindingsTransformers.reduce(
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

    completeGeneratorsInfos() {
        this.generatorsById = this.generators.reduce(
            elementIdIndexer,
            new Map()
        );
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

    generateEquipementHandler({ errHandler, postUpdate, ...equipment }) {
        for (const [key, value] of Object.entries(equipment)) {
            console.log(key, value, postUpdate);
            this.lazyLoaders.set(
                key,
                new RemoteResourceHandler(
                    value,
                    (value) =>
                        this.dispatch(updateNetwork(key, value, postUpdate)),
                    (key) => errHandler(key)
                )
            );
        }
    }

    fetchEquipment(equipement, cb) {
        const fetcher = this.lazyLoaders.get(equipement);
        if (fetcher) return fetcher.fetch(cb);
        else {
            console.error('not found ' + equipement);
        }
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
        errHandler,
        dispatch
    ) {
        this.generateEquipementHandler({
            substations,
            errHandler,
            postUpdate: (net) => net.completeSubstationsInfos(),
        });
        this.lazyLoaders.set(
            equipements.voltageLevels,
            this.lazyLoaders.get(equipements.substations)
        );
        this.generateEquipementHandler({
            lines,
            errHandler,
            postUpdate: (net) => net.completeLinesInfos(),
        });

        this.generateEquipementHandler({
            twoWindingsTransformers,
            errHandler,
            postUpdate: (net) => net.completeTwoWindingsTransformersInfos(),
        });

        this.generateEquipementHandler({
            threeWindingsTransformers,
            errHandler,
            postUpdate: (net) => net.completeThreeWindingsTransformersInfos(),
        });

        this.generateEquipementHandler({
            generators,
            errHandler,
            postUpdate: (net) => net.completeGeneratorsInfos(),
        });

        this.generateEquipementHandler({
            loads,
            batteries,
            danglingLines,
            hvdcLines,
            lccConverterStations,
            vscConverterStations,
            shuntCompensators,
            staticVarCompensators,
            errHandler,
            postUpdate: undefined,
        });

        this.dispatch = dispatch;
    }
}
