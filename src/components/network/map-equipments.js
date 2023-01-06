/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { mapEquipmentsCreated } from '../../redux/actions';
import { fetchMapEquipments } from '../../utils/rest-api';
import { equipments } from './network-equipments';

const elementIdIndexer = (map, element) => {
    map.set(element.id, element);
    return map;
};

export default class MapEquipments {
    substations = [];

    substationsById = new Map();

    lines = [];

    linesById = new Map();

    voltageLevels = [];

    voltageLevelsById = new Map();

    nominalVoltages = [];

    intlRef = undefined;

    initEquipments(studyUuid, currentNodeUuid) {
        fetchMapEquipments(studyUuid, currentNodeUuid, undefined, false)
            .then((val) => {
                this.substations = val.substations;
                this.completeSubstationsInfos();

                this.lines = val.lines;
                this.completeLinesInfos();
                this.dispatch(mapEquipmentsCreated(this));
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler(
                        this.intlRef.current.formatMessage({
                            id: 'MapEquipmentsLoadError',
                        })
                    );
                }
            });
    }

    checkAndGetValues(equipments) {
        return equipments ? equipments : [];
    }

    constructor(studyUuid, currentNodeUuid, errHandler, dispatch, intlRef) {
        this.dispatch = dispatch;
        this.errHandler = errHandler;
        this.intlRef = intlRef;
        this.initEquipments(studyUuid, currentNodeUuid);
    }

    reloadImpactedSubstationsEquipments(
        studyUuid,
        currentNode,
        substationsIds,
        handleUpdatedLines
    ) {
        const updatedEquipments = fetchMapEquipments(
            studyUuid,
            currentNode?.id,
            substationsIds
        );
        const isFullReload = substationsIds ? false : true;

        updatedEquipments
            .then((values) => {
                this.updateSubstations(
                    this.checkAndGetValues(values.substations),
                    isFullReload
                );
                this.updateLines(
                    this.checkAndGetValues(values.lines),
                    isFullReload
                );
                handleUpdatedLines(values.lines);
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler(
                        this.intlRef.current.formatMessage({
                            id: 'MapEquipmentsLoadError',
                        })
                    );
                }
            });
    }

    completeSubstationsInfos(equipementsToIndex) {
        const nominalVoltagesSet = new Set();
        if (equipementsToIndex?.length === 0) {
            this.substationsById = new Map();
            this.voltageLevelsById = new Map();
        }
        const substations =
            equipementsToIndex?.length > 0
                ? equipementsToIndex
                : this.substations;

        substations.forEach((substation) => {
            // sort voltage levels inside substations by nominal voltage
            substation.voltageLevels = substation.voltageLevels.sort(
                (voltageLevel1, voltageLevel2) =>
                    voltageLevel1.nominalVoltage - voltageLevel2.nominalVoltage
            );

            this.substationsById.set(substation.id, substation);
            substation.voltageLevels.forEach((voltageLevel, index) => {
                voltageLevel.substationId = substation.id;
                voltageLevel.substationName = substation.name;

                this.voltageLevelsById.set(voltageLevel.id, voltageLevel);
                nominalVoltagesSet.add(voltageLevel.nominalVoltage);
            });
        });

        this.voltageLevels = Array.from(this.voltageLevelsById.values());
        this.nominalVoltages = Array.from(nominalVoltagesSet).sort(
            (a, b) => b - a
        );
    }

    updateEquipments(currentEquipments, newEquipements) {
        // replace current modified equipments
        currentEquipments.forEach((equipment1, index) => {
            const found = newEquipements.filter(
                (equipment2) => equipment2.id === equipment1.id
            );
            currentEquipments[index] = found.length > 0 ? found[0] : equipment1;
        });

        // add newly created equipments
        const eqptsToAdd = newEquipements.filter(
            (eqpt) =>
                !currentEquipments.some((otherEqpt) => otherEqpt.id === eqpt.id)
        );
        if (eqptsToAdd.length === 0) return currentEquipments;
        return [...currentEquipments, ...eqptsToAdd];
    }

    updateSubstations(substations, fullReload) {
        if (fullReload) {
            this.substations = [];
        }

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
        this.completeSubstationsInfos(fullReload ? [] : substations);
    }

    completeLinesInfos(equipementsToIndex) {
        if (equipementsToIndex?.length > 0) {
            equipementsToIndex.forEach((line) => {
                this.linesById?.set(line.id, line);
            });
        } else {
            this.linesById = this.lines.reduce(elementIdIndexer, new Map());
        }
    }

    updateLines(lines, fullReload) {
        if (fullReload) {
            this.lines = [];
        }
        this.lines = this.updateEquipments(this.lines, lines, equipments.lines);
        this.completeLinesInfos(fullReload ? [] : lines);
    }

    removeBranchesOfVoltageLevel(branchesList, voltageLevelId) {
        const remainingLines = branchesList.filter(
            (l) =>
                l.voltageLevelId1 !== voltageLevelId &&
                l.voltageLevelId2 !== voltageLevelId
        );
        branchesList
            .filter((l) => !remainingLines.includes(l))
            .map((l) => this.linesById.delete(l.id));

        return remainingLines;
    }

    removeEquipment(equipmentType, equipmentId) {
        switch (equipmentType) {
            case 'LINE':
                this.lines = this.lines.filter((l) => l.id !== equipmentId);
                this.linesById.delete(equipmentId);
                break;
            case 'VOLTAGE_LEVEL':
                const substationId =
                    this.voltageLevelsById.get(equipmentId).substationId;
                let voltageLevelsOfSubstation =
                    this.substationsById.get(substationId).voltageLevels;
                voltageLevelsOfSubstation = voltageLevelsOfSubstation.filter(
                    (l) => l.id !== equipmentId
                );
                this.substationsById.get(substationId).voltageLevels =
                    voltageLevelsOfSubstation;

                this.removeBranchesOfVoltageLevel(this.lines, equipmentId);
                //New reference on substations to trigger reload of NetworkExplorer and NetworkMap
                this.substations = [...this.substations];
                break;
            case 'SUBSTATION':
                this.substations = this.substations.filter(
                    (l) => l.id !== equipmentId
                );

                const substation = this.substationsById.get(equipmentId);
                substation.voltageLevels.map((vl) =>
                    this.removeEquipment('VOLTAGE_LEVEL', vl.id)
                );
                this.completeSubstationsInfos([...substation]);
                break;
            default:
        }
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
}
