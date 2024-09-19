/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { UUID } from 'crypto';
import { mixed, string } from 'yup';
import { EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { APP_NAME } from 'utils/config-params';
import yup from 'components/utils/yup-config';

const MAX_SEARCH_EQUIPMENT_HISTORY_SIZE = 5;

const LOCAL_STORAGE_SEARCH_EQUIPMENT_HISTORY_KEY = (APP_NAME + '_SEARCH_EQUIPMENT_HISTORY_').toUpperCase();

const getLocalStorageSearchEquipmentHistoryKey = (studyUuid: UUID) => {
    return LOCAL_STORAGE_SEARCH_EQUIPMENT_HISTORY_KEY + studyUuid;
};

const equipmentSchema = yup.object().shape({
    id: string().required(),
    name: string(),
    label: string().required(),
    key: string().required(),
    type: mixed<EquipmentType>().oneOf(Object.values(EquipmentType)).required(),
    voltageLevelLabel: string(),
    voltageLevelId: string(),
});

const equipmentListSchema = yup.array(equipmentSchema).required();

export const addToLocalStorageSearchEquipmentHistory = (studyUuid: UUID, equipmentToAdd: EquipmentInfos) => {
    const currentHistory = getLocalStorageSearchEquipmentHistory(studyUuid);
    // if local storage not existing yet or empty, creating it
    if (currentHistory.length === 0) {
        saveLocalStorageSearchEquipmentHistory(studyUuid, [equipmentToAdd]);
        return;
    }

    // check if element we are trying to add to history is already in history
    const equipmentToAddIndex = currentHistory
        .map((historyEquipment) => historyEquipment.id)
        .indexOf(equipmentToAdd.id);

    // if element is already in history, we remove it before adding it to the start of the list
    if (equipmentToAddIndex >= 0) {
        currentHistory.splice(equipmentToAddIndex, 1);
    }

    // add the equipment at the beginning of the list
    currentHistory.unshift(equipmentToAdd);

    // then we keep only first {MAX_SEARCH_EQUIPMENT_HISTORY_SIZE} elements
    saveLocalStorageSearchEquipmentHistory(studyUuid, currentHistory.slice(0, MAX_SEARCH_EQUIPMENT_HISTORY_SIZE));
};

export const excludeElementFromCurrentSearchHistory = (studyUuid: UUID, excludedElement: EquipmentInfos) => {
    const filteredHistory = getLocalStorageSearchEquipmentHistory(studyUuid).filter(
        (item) => item.id !== excludedElement.id
    );
    saveLocalStorageSearchEquipmentHistory(studyUuid, filteredHistory);
};

export const getLocalStorageSearchEquipmentHistory = (studyUuid: UUID) => {
    const currentHistoryJson = localStorage.getItem(getLocalStorageSearchEquipmentHistoryKey(studyUuid));
    // if local storage not existing yet, return empty
    if (!currentHistoryJson) {
        return [];
    }
    try {
        const currentHistory = JSON.parse(currentHistoryJson);
        const validatedCurrentHistory: EquipmentInfos[] = equipmentListSchema.validateSync(currentHistory);

        return validatedCurrentHistory;
    } catch (e) {
        console.error(
            'An error occured while getting search equipments history - Linked local storage has been emptied.'
        );
        console.error(e);
        // if an error is caught when validating or parsing JSON, emptying local storage to prevent blocking bug
        saveLocalStorageSearchEquipmentHistory(studyUuid, []);
        return [];
    }
};

const saveLocalStorageSearchEquipmentHistory = (studyUuid: UUID, equipments: EquipmentInfos[]) => {
    localStorage.setItem(getLocalStorageSearchEquipmentHistoryKey(studyUuid), JSON.stringify(equipments));
};
