/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVATED,
    CONTINGENCIES,
    STAGES_DEFINITION,
    GENERATION_STAGES_KIND,
    GENERATION_STAGES_PERCENT_MAXP_1,
    GENERATION_STAGES_PERCENT_MAXP_2,
    GENERATION_STAGES_PERCENT_MAXP_3,
    STAGES_SELECTION,
    GENERATORS_CAPPINGS,
    GENERATORS_CAPPINGS_FILTER,
    GENERATORS_CAPPINGS_KIND,
    MONITORED_BRANCHES,
    MONITORED_BRANCHES_COEFF_N,
    MONITORED_BRANCHES_COEFF_N_1,
    MONITORED_BRANCHES_IST_N,
    MONITORED_BRANCHES_IST_N_1,
    MONITORED_BRANCHES_LIMIT_NAME_N,
    MONITORED_BRANCHES_LIMIT_NAME_N_1,
    BRANCHES,
    NAME,
    STAGES_DEFINITION_GENERATORS,
} from '../../../utils/field-constants';
import { ElementType } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { ISensiParameters } from '../sensi/columns-definitions';

export const MONITORED_BRANCHES_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.LINE, EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER];

export const INJECTIONS_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.GENERATOR];

export const GENERATION_KINDS = [
    { id: 'WIND', label: 'Wind' },
    { id: 'SOLAR', label: 'Solar' },
    { id: 'HYDRO', label: 'Hydro' },
];

export const COLUMNS_DEFINITIONS_STAGES = [
    {
        label: 'GenerationStageKind',
        dataKey: GENERATION_STAGES_KIND,
        initialValue: GENERATION_KINDS[0].id,
        editable: true,
        menuItems: true,
        equipmentTypes: GENERATION_KINDS,
        width: '20%',
    },
    {
        label: 'GenerationStageFilter',
        dataKey: STAGES_DEFINITION_GENERATORS,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: INJECTIONS_EQUIPMENT_TYPES,
        elementType: ElementType.FILTER,
        titleId: 'FiltersListsSelection',
        width: '40%',
    },
    {
        label: 'PercentMaxP1',
        dataKey: GENERATION_STAGES_PERCENT_MAXP_1,
        initialValue: 100,
        editable: true,
        floatItems: true,
        width: '13%',
    },
    {
        label: 'PercentMaxP2',
        dataKey: GENERATION_STAGES_PERCENT_MAXP_2,
        initialValue: 100,
        editable: true,
        floatItems: true,
        width: '13%',
    },
    {
        label: 'PercentMaxP3',
        dataKey: GENERATION_STAGES_PERCENT_MAXP_3,
        initialValue: 100,
        editable: true,
        floatItems: true,
        width: '13%',
    },
];

export const COLUMNS_DEFINITIONS_STAGES_SELECTION = [
    {
        label: 'StageName',
        dataKey: NAME,
        initialValue: '',
        editable: false,
        textItems: true,
        width: '60%',
    },
    {
        label: 'Active',
        dataKey: ACTIVATED,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
];

export const COLUMNS_DEFINITIONS_GENERATORS_CAPPINGS = [
    {
        label: 'GeneratorsCappingsKind',
        dataKey: GENERATORS_CAPPINGS_KIND,
        equipmentTypes: GENERATION_KINDS,
        initialValue: GENERATION_KINDS[0].id,
        editable: true,
        menuItems: true,
        width: '20%',
    },
    {
        label: 'GeneratorsCappingsFilter',
        dataKey: GENERATORS_CAPPINGS_FILTER,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: INJECTIONS_EQUIPMENT_TYPES,
        elementType: ElementType.FILTER,
        titleId: 'FiltersListsSelection',
        width: '40%',
    },
    {
        label: 'Active',
        dataKey: ACTIVATED,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
];

export const COLUMNS_DEFINITIONS_MONITORED_BRANCHES = [
    {
        label: 'MonitoredBranchesFilter',
        dataKey: BRANCHES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        elementType: ElementType.FILTER,
        titleId: 'FiltersListsSelection',
        width: '30%',
    },
    {
        label: 'istN',
        dataKey: MONITORED_BRANCHES_IST_N,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
    {
        label: 'limitNameN',
        dataKey: MONITORED_BRANCHES_LIMIT_NAME_N,
        initialValue: '',
        editable: true,
        textItems: true,
        width: '13%',
    },
    {
        label: 'coeffN',
        dataKey: MONITORED_BRANCHES_COEFF_N,
        initialValue: 100,
        editable: true,
        floatItems: true,
        width: '13%',
    },
    {
        label: 'istNm1',
        dataKey: MONITORED_BRANCHES_IST_N_1,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
    {
        label: 'limitNameNm1',
        dataKey: MONITORED_BRANCHES_LIMIT_NAME_N_1,
        initialValue: '',
        editable: true,
        textItems: true,
        width: '13%',
    },
    {
        label: 'coeffNm1',
        dataKey: MONITORED_BRANCHES_COEFF_N_1,
        initialValue: 100,
        editable: true,
        floatItems: true,
        width: '13%',
    },
    {
        label: 'Active',
        dataKey: ACTIVATED,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
];

export const COLUMNS_DEFINITIONS_CONTINGENCIES = [
    {
        label: 'Contingencies',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: ElementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
        width: '40%',
    },
    {
        label: 'Active',
        dataKey: ACTIVATED,
        initialValue: true,
        checkboxItems: true,
        editable: true,
        width: '10%',
    },
];

export const NonEvacuatedEnergyGenerationStages: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_STAGES,
    name: STAGES_DEFINITION,
};

export const NonEvacuatedEnergyStagesSelection: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_STAGES_SELECTION,
    name: STAGES_SELECTION,
};

export const NonEvacuatedEnergyGeneratorsCappings: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_GENERATORS_CAPPINGS,
    name: `${GENERATORS_CAPPINGS}.${GENERATORS_CAPPINGS}`,
};

export const NonEvacuatedEnergyMonitoredBranches: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_MONITORED_BRANCHES,
    name: MONITORED_BRANCHES,
};

export const NonEvacuatedEnergyContingencies: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_CONTINGENCIES,
    name: CONTINGENCIES,
};

export enum TAB_VALUES {
    'GenerationStages' = 0,
    'GeneratorsCappings' = 1,
    'MonitoredBranches' = 2,
    'Contingencies' = 3,
}
