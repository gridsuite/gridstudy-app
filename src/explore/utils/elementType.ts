/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum ElementType {
    DIRECTORY = 'DIRECTORY',
    STUDY = 'STUDY',
    FILTER = 'FILTER',
    CONTINGENCY_LIST = 'CONTINGENCY_LIST',
    CASE = 'CASE',
    VOLTAGE_INIT_PARAMETERS = 'VOLTAGE_INIT_PARAMETERS',
}

export const FilterType = {
    CRITERIA_BASED: { id: 'CRITERIA', label: 'CriteriaBased' },
    EXPLICIT_NAMING: { id: 'IDENTIFIER_LIST', label: 'ExplicitNaming' },
};

export const ContingencyListType = {
    CRITERIA_BASED: { id: 'FORM', label: 'CriteriaBased' },
    EXPLICIT_NAMING: { id: 'IDENTIFIERS', label: 'ExplicitNaming' },
    SCRIPT: { id: 'SCRIPT', label: 'SCRIPT' },
};
