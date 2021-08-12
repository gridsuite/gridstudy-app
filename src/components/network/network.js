/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RemoteResourceHandler } from '../util/remote-resource-handler';
import { networkCreated, networkEquipmentLoaded } from '../../redux/actions';
import {
    fetchBatteries,
    fetchDanglingLines,
    fetchGenerators,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchLines,
    fetchLoads,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTwoWindingsTransformers,
    fetchVscConverterStations,
} from '../../utils/rest-api';
import { equipments } from './network-equipments';

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
                // add substation id and name
                voltageLevel.substationId = substation.id;
                voltageLevel.substationName = substation.name;

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

        // add more infos
        this.completeLinesInfos();
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

        // add more infos
        this.completeTwoWindingsTransformersInfos();
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

        // add more infos
        this.completeThreeWindingsTransformersInfos();
    }

    completeGeneratorsInfos() {
        this.generatorsById = this.generators.reduce(
            elementIdIndexer,
            new Map()
        );
    }

    updateGenerators(generators) {
        this.updateEquipments(this.generators, generators);

        // add more infos
        this.completeGeneratorsInfos();
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

    generateEquipementHandler({ errHandler, ...equipment }) {
        for (const [key, value] of Object.entries(equipment)) {
            this.lazyLoaders.set(
                key,
                new RemoteResourceHandler(
                    value,
                    (data) => this.dispatch(networkEquipmentLoaded(key, data)),
                    (key) => errHandler(key)
                )
            );
        }
    }

    // TODO investigate turn this into a custom hook ?
    useEquipment(equipment) {
        const fetcher = this.lazyLoaders.get(equipment);
        if (fetcher) return fetcher.fetch();
        else {
            console.error('not found ' + equipment);
        }
    }

    isResourceFetched(equipement) {
        const fetcher = this.lazyLoaders.get(equipement);
        if (fetcher) return fetcher.isFetched();
        else {
            console.error('not found ' + equipement);
        }
    }

    newSharedForUpdate(updatedEquipements, newEquipements) {
        /* shallow clone of the network https://stackoverflow.com/a/44782052 */
        let newNetwork = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        );
        newNetwork.setEquipment(updatedEquipements, newEquipements);
        return newNetwork;
    }

    setEquipment(equipment, values) {
        this[equipment] = values;
        switch (equipment) {
            case equipments.substations:
                this.completeSubstationsInfos();
                break;
            case equipments.lines:
                this.completeLinesInfos();
                break;
            case equipments.generators:
                this.completeGeneratorsInfos();
                break;
            case equipments.twoWindingsTransformers:
                this.completeTwoWindingsTransformersInfos();
                break;
            case equipments.threeWindingsTransformers:
                this.completeThreeWindingsTransformersInfos();
                break;
            default:
                break;
        }
    }

    prefetch(equipments) {
        let fetchers = [];
        // TODO: here, instead of calling fetcher() method of the lazy loader (instead of method fetch() which fetches and dispatches equipment update)
        //  and modifying directly its "fetched" attribute, some refactoring should be done in remote-resource-handler in order to allow
        //  equipment loading without necessarily dispatch update
        equipments.forEach((equipment) => {
            const fetcher = this.lazyLoaders.get(equipment);
            if (fetcher)
                fetchers.push(
                    fetcher.fetcher().then((values) => {
                        return { values: values, equipment: equipment };
                    })
                );
        });
        Promise.all(fetchers).then((values) => {
            values.forEach((value) => {
                this.lazyLoaders.get(value.equipment).fetched = true;
                this.setEquipment(value.equipment, value.values);
            });
            this.dispatch(networkCreated(this));
        });
    }

    constructor(studyUuid, errHandler, dispatch, prefetch) {
        this.generateEquipementHandler({
            substations: () => fetchSubstations(studyUuid),
            loads: () => fetchLoads(studyUuid),
            lines: () => fetchLines(studyUuid),
            twoWindingsTransformers: () =>
                fetchTwoWindingsTransformers(studyUuid),
            threeWindingsTransformers: () =>
                fetchThreeWindingsTransformers(studyUuid),
            generators: () => fetchGenerators(studyUuid),
            batteries: () => fetchBatteries(studyUuid),
            danglingLines: () => fetchDanglingLines(studyUuid),
            hvdcLines: () => fetchHvdcLines(studyUuid),
            lccConverterStations: () => fetchLccConverterStations(studyUuid),
            vscConverterStations: () => fetchVscConverterStations(studyUuid),
            shuntCompensators: () => fetchShuntCompensators(studyUuid),
            staticVarCompensators: () => fetchStaticVarCompensators(studyUuid),
            errHandler,
        });
        this.lazyLoaders.set(
            equipments.voltageLevels,
            this.lazyLoaders.get(equipments.substations)
        );

        this.dispatch = dispatch;

        if (prefetch !== undefined) {
            this.prefetch(prefetch.equipments);
        }
    }
}
