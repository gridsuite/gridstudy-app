/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AG_GRID_ROW_UUID,
    CONTINGENCY_LIST_TYPE,
    CONTINGENCY_NAME,
    COUNTRIES,
    COUNTRIES_1,
    COUNTRIES_2,
    CRITERIA_BASED,
    EQUIPMENT_IDS,
    EQUIPMENT_TABLE,
    EQUIPMENT_TYPE,
    NAME,
    NOMINAL_VOLTAGE,
    NOMINAL_VOLTAGE_1,
    NOMINAL_VOLTAGE_2,
    SCRIPT,
} from '../../utils/field-constants';
import { ContingencyListType } from '../../../utils/elementType';
import { prepareContingencyListForBackend } from '../contingency-list-helper';

import { getCriteriaBasedFormData } from '../commons/criteria-based/criteria-based-utils';

export const makeDefaultRowData = () => ({
    [AG_GRID_ROW_UUID]: crypto.randomUUID(),
    [CONTINGENCY_NAME]: '',
    [EQUIPMENT_IDS]: [],
});

export const makeDefaultTableRows = () => [
    makeDefaultRowData(),
    makeDefaultRowData(),
    makeDefaultRowData(),
];

export const getContingencyListEmptyFormData = (name = '') => ({
    [NAME]: name,
    [EQUIPMENT_TABLE]: makeDefaultTableRows(),
    [CONTINGENCY_LIST_TYPE]: ContingencyListType.CRITERIA_BASED.id,
    [SCRIPT]: '',
    [EQUIPMENT_TYPE]: null,
    ...getCriteriaBasedFormData(),
});

export const getCriteriaBasedFormDataFromFetchedElement = (response, name) => {
    return {
        [NAME]: name,
        [CONTINGENCY_LIST_TYPE]: ContingencyListType.CRITERIA_BASED.id,
        [EQUIPMENT_TYPE]: response.equipmentType,
        ...getCriteriaBasedFormData(response),
    };
};

export const getExplicitNamingFormDataFromFetchedElement = (response) => {
    let result;
    if (response.identifierContingencyList?.identifiers?.length) {
        result = response.identifierContingencyList?.identifiers?.map(
            (identifiers) => {
                return {
                    [AG_GRID_ROW_UUID]: crypto.randomUUID(),
                    [CONTINGENCY_LIST_TYPE]:
                        ContingencyListType.EXPLICIT_NAMING.id,
                    [CONTINGENCY_NAME]: identifiers.contingencyId,
                    [EQUIPMENT_IDS]: identifiers.identifierList.map(
                        (identifier) => identifier.identifier
                    ),
                };
            }
        );
    } else {
        result = makeDefaultTableRows();
    }

    return {
        [EQUIPMENT_TABLE]: result,
    };
};

export const getScriptFormDataFromFetchedElement = (response) => {
    return {
        [SCRIPT]: response.script,
    };
};

export const getFormContent = (contingencyListId, contingencyList) => {
    switch (contingencyList[CONTINGENCY_LIST_TYPE]) {
        case ContingencyListType.EXPLICIT_NAMING.id: {
            return prepareContingencyListForBackend(
                contingencyListId,
                contingencyList
            );
        }
        case ContingencyListType.CRITERIA_BASED.id: {
            const criteriaBaseForm = contingencyList[CRITERIA_BASED];
            return {
                equipmentType: contingencyList[EQUIPMENT_TYPE],
                countries: criteriaBaseForm[COUNTRIES],
                countries1: criteriaBaseForm[COUNTRIES_1],
                countries2: criteriaBaseForm[COUNTRIES_2],
                nominalVoltage: criteriaBaseForm[NOMINAL_VOLTAGE],
                nominalVoltage1: criteriaBaseForm[NOMINAL_VOLTAGE_1],
                nominalVoltage2: criteriaBaseForm[NOMINAL_VOLTAGE_2],
            };
        }
        case ContingencyListType.SCRIPT.id: {
            return { script: contingencyList[SCRIPT] };
        }
        default: {
            console.info(
                "Unknown contingency list type '" +
                    contingencyList[CONTINGENCY_LIST_TYPE] +
                    "'"
            );
            return null;
        }
    }
};
