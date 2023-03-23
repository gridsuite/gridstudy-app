/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RemoteResourceHandler } from '../util/remote-resource-handler';
import {
    networkCreated,
    networkEquipmentLoaded,
    isNetworkEquipmentsFetched,
} from '../../redux/actions';
import {
    fetchAllEquipments,
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
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';

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

    voltageLevels = [];

    substationsById = new Map();

    linesById = new Map();

    twoWindingsTransformersById = new Map();

    threeWindingsTransformersById = new Map();

    generatorsById = new Map();

    nominalVoltages = [];

    completeSubstationsInfos() {
        const nominalVoltagesSet = new Set();
        this.substationsById = new Map();
        this.voltageLevelsById = new Map();
        this.substations.forEach((substation) => {
            // sort voltage levels inside substations by nominal voltage
            substation.voltageLevels = substation.voltageLevels.sort(
                (voltageLevel1, voltageLevel2) =>
                    voltageLevel1.nominalVoltage - voltageLevel2.nominalVoltage
            );

            this.substationsById.set(substation.id, substation);

            substation.voltageLevels.forEach((voltageLevel, index) => {
                // add substation id and name
                voltageLevel.substationId = substation.id;
                voltageLevel.substationName = substation.name;

                // add the current item into the VL map by id
                this.voltageLevelsById.set(voltageLevel.id, voltageLevel);

                nominalVoltagesSet.add(voltageLevel.nominalVoltage);
            });
        });

        this.voltageLevels = Array.from(this.voltageLevelsById.values());

        this.nominalVoltages = Array.from(nominalVoltagesSet).sort(
            (a, b) => b - a
        );
    }

    updateEquipments(currentEquipments, newEquipements, equipmentType) {
        // replace current modified equipments
        currentEquipments.forEach((equipment1, index) => {
            const found = newEquipements.filter(
                (equipment2) => equipment2.id === equipment1.id
            );
            currentEquipments[index] = found.length > 0 ? found[0] : equipment1;
        });

        // add newly created equipments
        let equipmentsAdded = false;
        if (this.isResourceFetched(equipmentType)) {
            newEquipements.forEach((equipment1) => {
                const found = currentEquipments.find(
                    (equipment2) => equipment2.id === equipment1.id
                );
                if (found === undefined) {
                    currentEquipments.push(equipment1);
                    equipmentsAdded = true;
                }
            });
        }

        return equipmentsAdded === true
            ? [...currentEquipments]
            : currentEquipments;
    }

    updateSubstations(substations) {
        // replace current modified substations
        let voltageLevelAdded = false;
        this.substations.forEach((substation1, index) => {
            const found = substations.filter(
                (substation2) => substation2.id === substation1.id
            );
            if (found.length > 0) {
                if (
                    found[0].voltageLevels.length >
                    substation1.voltageLevels.length
                ) {
                    voltageLevelAdded = true;
                }
                this.substations[index] = found[0];
            }
        });

        // add newly created substations
        let substationAdded = false;
        substations.forEach((substation1) => {
            const found = this.substations.find(
                (substation2) => substation2.id === substation1.id
            );
            if (found === undefined) {
                this.substations.push(substation1);
                substationAdded = true;
            }
        });

        if (substationAdded === true || voltageLevelAdded === true) {
            this.substations = [...this.substations];
        }

        // add more infos
        this.completeSubstationsInfos();
    }

    completeLinesInfos() {
        this.linesById = this.lines.reduce(elementIdIndexer, new Map());
    }

    updateLines(lines) {
        this.lines = this.updateEquipments(this.lines, lines, equipments.lines);

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
        this.twoWindingsTransformers = this.updateEquipments(
            this.twoWindingsTransformers,
            twoWindingsTransformers,
            equipments.twoWindingsTransformers
        );

        // add more infos
        this.completeTwoWindingsTransformersInfos();
    }

    completeThreeWindingsTransformersInfos() {
        this.threeWindingsTransformersById =
            this.threeWindingsTransformers.reduce(elementIdIndexer, new Map());
    }

    updateThreeWindingsTransformers(threeWindingsTransformers) {
        this.threeWindingsTransformers = this.updateEquipments(
            this.threeWindingsTransformers,
            threeWindingsTransformers,
            equipments.threeWindingsTransformers
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
        this.generators = this.updateEquipments(
            this.generators,
            generators,
            equipments.generators
        );

        // add more infos
        this.completeGeneratorsInfos();
    }

    updateBatteries(batteries) {
        this.batteries = this.updateEquipments(
            this.batteries,
            batteries,
            equipments.batteries
        );
    }

    updateLoads(loads) {
        this.loads = this.updateEquipments(this.loads, loads, equipments.loads);
    }

    updateDanglingLines(danglingLines) {
        this.danglingLines = this.updateEquipments(
            this.danglingLines,
            danglingLines,
            equipments.danglingLines
        );
    }

    updateShuntCompensators(shuntCompensators) {
        this.shuntCompensators = this.updateEquipments(
            this.shuntCompensators,
            shuntCompensators,
            equipments.shuntCompensators
        );
    }

    updateStaticVarCompensators(staticVarCompensators) {
        this.staticVarCompensators = this.updateEquipments(
            this.staticVarCompensators,
            staticVarCompensators,
            equipments.staticVarCompensators
        );
    }

    updateHvdcLines(hvdcLines) {
        this.hvdcLines = this.updateEquipments(
            this.hvdcLines,
            hvdcLines,
            equipments.hvdcLines
        );
    }

    updateLccConverterStations(lccConverterStations) {
        this.lccConverterStations = this.updateEquipments(
            this.lccConverterStations,
            lccConverterStations,
            equipments.lccConverterStations
        );
    }

    updateVscConverterStations(vscConverterStations) {
        this.vscConverterStations = this.updateEquipments(
            this.vscConverterStations,
            vscConverterStations,
            equipments.vscConverterStations
        );
    }

    getVoltageLevels() {
        return this.voltageLevels;
    }

    getVoltageLevel(id) {
        return this.voltageLevelsById.get(id);
    }

    getSubstations() {
        return this.substations;
    }

    getSubstation(id) {
        return this.substationsById.get(id);
    }

    getNominalVoltages() {
        return this.nominalVoltages;
    }

    getLines() {
        return this.lines;
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

    prefetch(equipments, currentNodeRef) {
        let fetchers = [];
        // TODO: here, instead of calling fetcher() method of the lazy loader (instead of method fetch() which fetches and dispatches equipment update)
        //  and modifying directly its "fetched" attribute, some refactoring should be done in remote-resource-handler in order to allow
        //  equipment loading without necessarily dispatch update

        // we keep the node id before fetching, so we can check if it changed when retrieving data
        const nodeBeforeFetch = currentNodeRef.current;
        equipments.forEach((equipment) => {
            const fetcher = this.lazyLoaders.get(equipment);
            if (fetcher)
                fetchers.push(
                    fetcher.fetcher().then((values) => {
                        this.dispatch(isNetworkEquipmentsFetched(false));
                        if (nodeBeforeFetch === currentNodeRef.current) {
                            return { values: values, equipment: equipment };
                        }
                    })
                );
        });

        Promise.all(fetchers).then((values) => {
            const allValidValues = values.every((v) => v);

            if (allValidValues && nodeBeforeFetch === currentNodeRef.current) {
                values.forEach((value) => {
                    this.lazyLoaders.get(value.equipment).fetched = true;
                    this.setEquipment(value.equipment, value.values);
                });
                this.dispatch(isNetworkEquipmentsFetched(true));
                this.dispatch(networkCreated(this));
            }
        });
    }

    constructor(studyUuid, currentNodeRef, errHandler, dispatch, prefetch) {
        const currentNodeUuid = currentNodeRef?.current?.id;
        this.generateEquipementHandler({
            substations: () => fetchSubstations(studyUuid, currentNodeUuid),
            loads: () => fetchLoads(studyUuid, currentNodeUuid),
            lines: () => fetchLines(studyUuid, currentNodeUuid),
            twoWindingsTransformers: () =>
                fetchTwoWindingsTransformers(studyUuid, currentNodeUuid),
            threeWindingsTransformers: () =>
                fetchThreeWindingsTransformers(studyUuid, currentNodeUuid),
            generators: () => fetchGenerators(studyUuid, currentNodeUuid),
            batteries: () => fetchBatteries(studyUuid, currentNodeUuid),
            danglingLines: () => fetchDanglingLines(studyUuid, currentNodeUuid),
            hvdcLines: () => fetchHvdcLines(studyUuid, currentNodeUuid),
            lccConverterStations: () =>
                fetchLccConverterStations(studyUuid, currentNodeUuid),
            vscConverterStations: () =>
                fetchVscConverterStations(studyUuid, currentNodeUuid),
            shuntCompensators: () =>
                fetchShuntCompensators(studyUuid, currentNodeUuid),
            staticVarCompensators: () =>
                fetchStaticVarCompensators(studyUuid, currentNodeUuid),
            errHandler,
        });
        this.lazyLoaders.set(
            equipments.voltageLevels,
            this.lazyLoaders.get(equipments.substations)
        );

        this.dispatch = dispatch;

        if (prefetch !== undefined) {
            this.prefetch(prefetch.equipments, currentNodeRef);
        }
    }

    removeInjectionOfVoltageLevel(injectionsList, voltageLevelId) {
        return injectionsList.filter(
            (l) => l.voltageLevelId !== voltageLevelId
        );
    }

    removeBranchesOfVoltageLevel(branchesList, voltageLevelId) {
        return branchesList.filter(
            (l) =>
                l.voltageLevelId1 !== voltageLevelId &&
                l.voltageLevelId2 !== voltageLevelId
        );
    }

    checkAndGetValues(equipments) {
        return equipments ? equipments : [];
    }

    reloadImpactedSubstationsEquipments(
        studyUuid,
        currentNode,
        substationsIds
    ) {
        if (substationsIds) {
            const updatedEquipments = fetchAllEquipments(
                studyUuid,
                currentNode?.id,
                substationsIds
            );
            updatedEquipments
                .then((values) => {
                    this.updateSubstations(
                        this.checkAndGetValues(values.substations)
                    );
                    this.updateLines(this.checkAndGetValues(values.lines));
                    this.updateTwoWindingsTransformers(
                        this.checkAndGetValues(values.twoWindingsTransformers)
                    );
                    this.updateThreeWindingsTransformers(
                        this.checkAndGetValues(values.threeWindingsTransformers)
                    );
                    this.updateGenerators(
                        this.checkAndGetValues(values.generators)
                    );
                    this.updateLoads(this.checkAndGetValues(values.loads));
                    this.updateBatteries(
                        this.checkAndGetValues(values.batteries)
                    );
                    this.updateDanglingLines(
                        this.checkAndGetValues(values.danglingLines)
                    );
                    this.updateLccConverterStations(
                        this.checkAndGetValues(values.lccConverterStations)
                    );
                    this.updateVscConverterStations(
                        this.checkAndGetValues(values.vscConverterStations)
                    );
                    this.updateHvdcLines(
                        this.checkAndGetValues(values.hvdcLines)
                    );
                    this.updateShuntCompensators(
                        this.checkAndGetValues(values.shuntCompensators)
                    );
                    this.updateStaticVarCompensators(
                        this.checkAndGetValues(values.staticVarCompensators)
                    );
                })
                .catch(function (error) {
                    console.error(error.message);
                    if (this.errHandler) this.errHandler(error);
                });
        }
    }

    removeEquipment(equipmentType, equipmentId) {
        switch (equipmentType) {
            case EQUIPMENT_TYPES.LINE.type:
                this.lines = this.lines.filter((l) => l.id !== equipmentId);
                this.completeLinesInfos();
                break;
            case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type:
                this.twoWindingsTransformers =
                    this.twoWindingsTransformers.filter(
                        (l) => l.id !== equipmentId
                    );
                this.completeTwoWindingsTransformersInfos();
                break;
            case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type:
                this.threeWindingsTransformers =
                    this.threeWindingsTransformers.filter(
                        (l) => l.id !== equipmentId
                    );
                this.completeThreeWindingsTransformersInfos();
                break;
            case EQUIPMENT_TYPES.GENERATOR.type:
                this.generators = this.generators.filter(
                    (l) => l.id !== equipmentId
                );
                this.completeGeneratorsInfos();
                break;
            case EQUIPMENT_TYPES.LOAD.type:
                this.loads = this.loads.filter((l) => l.id !== equipmentId);
                break;
            case EQUIPMENT_TYPES.BATTERY.type:
                this.batteries = this.batteries.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.DANGLING_LINE.type:
                this.danglingLines = this.danglingLines.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.HVDC_LINE.type:
                this.hvdcLines = this.hvdcLines.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.LCC_CONVERTER_STATION.type:
                this.lccConverterStations = this.lccConverterStations.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.VSC_CONVERTER_STATION.type:
                this.vscConverterStations = this.vscConverterStations.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type:
                this.shuntCompensators = this.shuntCompensators.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.type:
                this.staticVarCompensators = this.staticVarCompensators.filter(
                    (l) => l.id !== equipmentId
                );
                break;
            case EQUIPMENT_TYPES.VOLTAGE_LEVEL.type:
                const substationId =
                    this.voltageLevelsById.get(equipmentId)?.substationId;
                const substation = this.substationsById.get(substationId);
                if (substation) {
                    substation.voltageLevels = substation.voltageLevels.filter(
                        (vl) => vl.id !== equipmentId
                    );
                }

                this.generators = this.removeInjectionOfVoltageLevel(
                    this.generators,
                    equipmentId
                );
                this.completeGeneratorsInfos();
                this.loads = this.removeInjectionOfVoltageLevel(
                    this.loads,
                    equipmentId
                );
                this.batteries = this.removeInjectionOfVoltageLevel(
                    this.batteries,
                    equipmentId
                );
                this.shuntCompensators = this.removeInjectionOfVoltageLevel(
                    this.shuntCompensators,
                    equipmentId
                );
                this.lccConverterStations = this.removeInjectionOfVoltageLevel(
                    this.lccConverterStations,
                    equipmentId
                );
                this.vscConverterStations = this.removeInjectionOfVoltageLevel(
                    this.vscConverterStations,
                    equipmentId
                );
                this.staticVarCompensators = this.removeInjectionOfVoltageLevel(
                    this.staticVarCompensators,
                    equipmentId
                );
                this.danglingLines = this.removeInjectionOfVoltageLevel(
                    this.danglingLines,
                    equipmentId
                );

                this.removeBranchesOfVoltageLevel(this.hvdcLines, equipmentId);

                this.removeBranchesOfVoltageLevel(this.lines, equipmentId);
                this.completeLinesInfos();

                this.removeBranchesOfVoltageLevel(
                    this.twoWindingsTransformers,
                    equipmentId
                );
                this.completeTwoWindingsTransformersInfos();

                this.threeWindingsTransformers =
                    this.threeWindingsTransformers.filter(
                        (l) =>
                            l.voltageLevelId1 !== equipmentId &&
                            l.voltageLevelId2 !== equipmentId &&
                            l.voltageLevelId3 !== equipmentId
                    );
                this.completeThreeWindingsTransformersInfos();

                //New reference on substations to trigger reload of NetworkExplorer and NetworkMap
                this.substations = [...this.substations];
                break;
            case EQUIPMENT_TYPES.SUBSTATION.type:
                this.substations = this.substations.filter(
                    (l) => l.id !== equipmentId
                );

                this.substationsById
                    .get(equipmentId)
                    ?.voltageLevels.map((vl) =>
                        this.removeEquipment(
                            EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
                            vl.id
                        )
                    );
                this.completeSubstationsInfos();
                break;
            default:
        }
    }
}
