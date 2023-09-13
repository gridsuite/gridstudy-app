import {
    CONTINGENCIES,
    DISTRIBUTION_TYPE,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    HVDC_LINES,
    INJECTIONS,
    MONITORED_BRANCHES,
    PARAMETER_SENSI_HVDC,
    PARAMETER_SENSI_INJECTION,
    PARAMETER_SENSI_INJECTIONS_SET,
    PARAMETER_SENSI_NODES,
    PARAMETER_SENSI_PST,
    PSTS,
    SENSITIVITY_TYPE,
    SUPERVISED_VOLTAGE_LEVELS,
} from '../../../utils/field-constants';
import { elementType } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';

export const MONITORED_BRANCHES_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.LINE,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
];
export const INJECTION_DISTRIBUTION_TYPES = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'PROPORTIONAL_MAXP', label: 'ProportionalMaxP' },
    { id: 'REGULAR', label: 'Regular' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const SENSITIVITY_TYPES = [
    { id: 'DELTA_MW', label: 'DeltaMW' },
    { id: 'DELTA_A', label: 'DeltaA' },
];

export const PSTS_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER];

export const MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
];
export const INJECTIONS_EQUIPMENT_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.LOAD,
];

export const EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
    EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
    EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
];
export const HVDC_EQUIPMENT_TYPES = [EQUIPMENT_TYPES.HVDC_LINE];
export interface ISensiParameters {
    columnsDef: IColumnsDef[];
    name: string;
}

interface IColumnsDef {
    label: string;
    dataKey: string;
    initialValue: string | string[];
    editable?: boolean;
    directoryItems?: boolean;
    menuItems?: boolean;
    equipmentTypes?: any[];
    elementType?: string;
    titleId?: string;
}
export const COLUMNS_DEFINITIONS_INJECTIONS_SET = [
    {
        label: 'SupervisedBranches',
        dataKey: MONITORED_BRANCHES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'Injections',
        dataKey: INJECTIONS,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: INJECTIONS_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'DistributionType',
        dataKey: DISTRIBUTION_TYPE,
        equipmentTypes: INJECTION_DISTRIBUTION_TYPES,
        initialValue: INJECTION_DISTRIBUTION_TYPES[0].id,
        menuItem: true,
        editable: true,
    },
    {
        label: 'ContingencyLists',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
    },
];
export const COLUMNS_DEFINITIONS_INJECTIONS = [
    {
        label: 'SupervisedBranches',
        dataKey: MONITORED_BRANCHES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'Injections',
        dataKey: INJECTIONS,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: INJECTIONS_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'ContingencyLists',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
    },
];
export const COLUMNS_DEFINITIONS_HVDCS = [
    {
        label: 'SupervisedBranches',
        dataKey: MONITORED_BRANCHES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'SensitivityType',
        dataKey: SENSITIVITY_TYPE,
        equipmentTypes: SENSITIVITY_TYPES,
        initialValue: SENSITIVITY_TYPES[0].id,
        menuItem: true,
        editable: true,
    },
    {
        label: 'HvdcLines',
        dataKey: HVDC_LINES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: HVDC_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'ContingencyLists',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
    },
];
export const COLUMNS_DEFINITIONS_PSTS = [
    {
        label: 'SupervisedBranches',
        dataKey: MONITORED_BRANCHES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_BRANCHES_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'SensitivityType',
        dataKey: SENSITIVITY_TYPE,
        equipmentTypes: SENSITIVITY_TYPES,
        initialValue: SENSITIVITY_TYPES[0].id,
        menuItem: true,
        editable: true,
    },
    {
        label: 'PSTS',
        dataKey: PSTS,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: PSTS_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'ContingencyLists',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
    },
];
export const COLUMNS_DEFINITIONS_NODES = [
    {
        label: 'MonitoredVoltageLevels',
        dataKey: SUPERVISED_VOLTAGE_LEVELS,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: MONITORED_VOLTAGE_LEVELS_EQUIPMENT_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'EquipmentsInVoltageRegulation',
        dataKey: EQUIPMENTS_IN_VOLTAGE_REGULATION,
        initialValue: [],
        editable: true,
        directoryItems: true,
        equipmentTypes: EQUIPMENTS_IN_VOLTAGE_REGULATION_TYPES,
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
    },
    {
        label: 'ContingencyLists',
        dataKey: CONTINGENCIES,
        initialValue: [],
        editable: true,
        directoryItems: true,
        elementType: elementType.CONTINGENCY_LIST,
        titleId: 'ContingencyListsSelection',
    },
];

export const SensiInjectionsSet: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_INJECTIONS_SET,
    name: PARAMETER_SENSI_INJECTIONS_SET,
};

export const SensiInjection: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_INJECTIONS,
    name: PARAMETER_SENSI_INJECTION,
};

export const SensiHvdcs: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_HVDCS,
    name: PARAMETER_SENSI_HVDC,
};

export const SensiPsts: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_PSTS,
    name: PARAMETER_SENSI_PST,
};

export const SensiNodes: ISensiParameters = {
    columnsDef: COLUMNS_DEFINITIONS_NODES,
    name: PARAMETER_SENSI_NODES,
};

export enum TAB_VALUES {
    'SensitivityBranches' = 0,
    'SensitivityNodes' = 1,
    'SensiInjectionsSet' = 0,
    'SensiInjection' = 1,
    'SensiHVDC' = 2,
    'SensiPST' = 3,
}
