/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from '../../network/network-equipments';
import { BooleanCellRenderer } from './cell-renderers';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { BooleanListField, NumericalField } from './equipment-table-editors';
import { ENERGY_SOURCES, LOAD_TYPES } from 'components/network/constants';
import { FluxConventions } from 'components/dialogs/parameters/network-parameters';

const generateTapPositions = (params) => {
    return params
        ? Array.from(
              Array(params.highTapPosition - params.lowTapPosition + 1).keys()
          )
        : [];
};

const applyFluxConvention = (convention, val) => {
    if (convention === FluxConventions.TARGET && val !== undefined) {
        return -val;
    }
    return val;
};

//this function enables us to exclude some columns from the computation of the spreadsheet global filter
const excludeFromGlobalFilter = () => '';

export const MIN_COLUMN_WIDTH = 160;
export const MEDIUM_COLUMN_WIDTH = 220;
export const LARGE_COLUMN_WIDTH = 340;
export const MAX_LOCKS_PER_TAB = 5;

export const DEFAULT_SORT_ORDER = 'asc';

export const EDIT_COLUMN = 'edit';

export const TABLES_DEFINITIONS = {
    SUBSTATIONS: {
        index: 0,
        name: 'Substations',
        resource: equipments.substations,
        type: EQUIPMENT_TYPES.SUBSTATION,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'Country',
                field: 'countryName',
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        resource: equipments.voltageLevels,
        type: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        modifiableEquipmentType: EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'SubstationId',
                field: 'substationId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        resource: equipments.lines,
        type: EQUIPMENT_TYPES.LINE,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        resource: equipments.twoWindingsTransformers,
        type: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
        modifiableEquipmentType: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
        groovyEquipmentGetter: 'getTwoWindingsTransformer',
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LoadTapChangingCapabilities',
                field: 'loadTapChangingCapabilities',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.loadTapChangingCapabilities,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio',
                field: 'regulatingRatio',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.regulating,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetVPoint',
                field: 'ratioTapChanger.targetV',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap',
                field: 'ratioTapChanger',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger.tapPosition = params.newValue;
                    return params;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data?.ratioTapChanger
                        ),
                    };
                },
                editable: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode',
                field: 'regulationMode',
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationMode,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase',
                field: 'regulatingPhase',
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulating,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseTap',
                field: 'phaseTapChanger',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger.tapPosition = params.newValue;
                    return params;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger
                        ),
                    };
                },
                editable: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingValue',
                field: 'regulationValue',
                numeric: true,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationValue,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    THREE_WINDINGS_TRANSFORMERS: {
        index: 4,
        name: 'ThreeWindingsTransformers',
        resource: equipments.threeWindingsTransformers,
        type: EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
        modifiableEquipmentType:
            EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type,
        groovyEquipmentGetter: 'getThreeWindingsTransformer',
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
            },
            {
                id: 'VoltageLevelIdSide3',
                field: 'voltageLevelId3',
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide3',
                field: 'nominalVoltage3',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide3',
                field: 'p3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide3',
                field: 'q3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LoadTapChanging1Capabilities',
                field: 'loadTapChanging1Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio1',
                field: 'regulatingRatio1',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetVPoint1',
                field: 'targetV1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap1',
                field: 'ratioTapChanger1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger1?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger1.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger1
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LoadTapChanging2Capabilities',
                field: 'loadTapChanging2Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio2',
                field: 'regulatingRatio2',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetVPoint2',
                field: 'targetV2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap2',
                field: 'ratioTapChanger2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger2?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger2.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger2
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LoadTapChanging3Capabilities',
                field: 'loadTapChanging3Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio3',
                field: 'regulatingRatio3',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetVPoint3',
                field: 'targetV3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap3',
                field: 'ratioTapChanger3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger3?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger3.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger3
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode1',
                field: 'regulatingMode1',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase1',
                field: 'regulatingPhase1',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseTap1',
                field: 'phaseTapChanger1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger1?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger1.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger1
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingValue1',
                field: 'regulatingValue1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode2',
                field: 'regulatingMode2',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase2',
                field: 'regulatingPhase2',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseTap2',
                field: 'phaseTapChanger2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger2?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger2.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger1
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingValue2',
                field: 'regulatingValue2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode3',
                field: 'regulatingMode3',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase3',
                field: 'regulatingPhase3',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseTap3',
                field: 'phaseTapChanger3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger3?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger3.tapPosition = params.newValue;
                    return params;
                },
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger3
                        ),
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingValue3',
                field: 'regulatingValue3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    GENERATORS: {
        index: 5,
        name: 'Generators',
        resource: equipments.generators,
        modifiableEquipmentType: EQUIPMENT_TYPES.GENERATOR.type,
        type: EQUIPMENT_TYPES.GENERATOR,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                changeCmd: "equipment.setName('{}')\n",
                editable: true,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'Type',
                field: 'energySource',
                changeCmd: 'equipment.setEnergySource(EnergySource.{})\n',
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: ENERGY_SOURCES.map(
                            (energySource) => energySource.id
                        ),
                    };
                },
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerControl',
                field: 'activePowerControlOn',
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MinP',
                field: 'minP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setMinP({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        maxExpression: 'maxP',
                        defaultValue: params.data.minP,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MaxP',
                field: 'maxP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setMaxP({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        minExpression: 'minP',
                        defaultValue: params.data.maxP,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetP',
                field: 'targetP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd:
                    'if (equipment.getMinP() <= {} && {} <= equipment.getMaxP() ) { \n' +
                    '    equipment.setTargetP({})\n' +
                    '} else {\n' +
                    "    throw new Exception('incorrect value')\n" +
                    ' }\n',

                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        minExpression: 'minP',
                        maxExpression: 'maxP',
                        defaultValue: params.data.targetP,
                    };
                },
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetQ({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetQ,
                    };
                },
                editableCondition: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: false,
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'VoltageRegulatorOn',
                field: 'voltageRegulatorOn',
                cellRenderer: BooleanCellRenderer,
                changeCmd: 'equipment.setVoltageRegulatorOn({})\n',
                editable: true,
                cellEditor: BooleanListField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.voltageRegulatorOn | 0,
                    };
                },
                resetColumnsInError: [
                    {
                        dependencyColumn: 'targetQ',
                        value: true,
                    },
                    {
                        dependencyColumn: 'targetV',
                        value: false,
                    },
                ],
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetV',
                field: 'targetV',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetV({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetV,
                    };
                },
                editableCondition: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: true,
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingTerminal',
                field: 'regulatingTerminal',
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },
    LOADS: {
        index: 6,
        name: 'Loads',
        resource: equipments.loads,
        type: EQUIPMENT_TYPES.LOAD,
        modifiableEquipmentType: EQUIPMENT_TYPES.LOAD.type,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                changeCmd: "equipment.setName('{}')\n",
                editable: true,
            },
            {
                id: 'LoadType',
                field: 'type',
                changeCmd: 'equipment.setLoadType(LoadType.{})\n',
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [
                            ...LOAD_TYPES.map((loadType) => loadType.id),
                            'UNDEFINED',
                        ],
                    };
                },
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConstantP',
                field: 'p0',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setP0({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.p0,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConstantQ',
                field: 'q0',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setQ0({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.q0,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    SHUNT_COMPENSATORS: {
        index: 7,
        name: 'ShuntCompensators',
        resource: equipments.shuntCompensators,
        type: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetV',
                field: 'targetV',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetDeadband',
                field: 'targetDeadband',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    STATIC_VAR_COMPENSATORS: {
        index: 8,
        name: 'StaticVarCompensators',
        resource: equipments.staticVarCompensators,
        type: EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'VoltageSetpoint',
                field: 'voltageSetpoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSetpoint',
                field: 'reactivePowerSetpoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    BATTERIES: {
        index: 9,
        name: 'Batteries',
        resource: equipments.batteries,
        type: EQUIPMENT_TYPES.BATTERY,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetP',
                field: 'targetP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    HVDC_LINES: {
        index: 10,
        name: 'HvdcLines',
        resource: equipments.hvdcLines,
        type: EQUIPMENT_TYPES.HVDC_LINE,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'ConvertersMode',
                field: 'convertersMode',
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConverterStationId1',
                field: 'converterStationId1',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'ConverterStationId2',
                field: 'converterStationId2',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'R',
                field: 'r',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSetpoint',
                field: 'activePowerSetpoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MaxP',
                field: 'maxP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS1toCS2',
                field: 'oprFromCS1toCS2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS2toCS1',
                field: 'oprFromCS2toCS1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'AcEmulation',
                field: 'isEnabled',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'K',
                field: 'k',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'P0',
                field: 'p0',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    LCC_CONVERTER_STATIONS: {
        index: 11,
        name: 'LccConverterStations',
        resource: equipments.lccConverterStations,
        type: EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PowerFactor',
                field: 'powerFactor',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    VSC_CONVERTER_STATIONS: {
        index: 12,
        name: 'VscConverterStations',
        resource: equipments.vscConverterStations,
        type: EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'VoltageRegulatorOn',
                field: 'voltageRegulatorOn',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'VoltageSetpointKV',
                field: 'voltageSetpoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSetpointMVAR',
                field: 'reactivePowerSetpoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    DANGLING_LINES: {
        index: 13,
        name: 'DanglingLines',
        resource: equipments.danglingLines,
        type: EQUIPMENT_TYPES.DANGLING_LINE,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                valueGetter: (params) => 'toChangeAfterBackendUpdate', //TODO: need update from backend to receive this data directly
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'UcteXnodeCode',
                field: 'ucteXnodeCode',
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConstantActivePower',
                field: 'p0',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConstantReactivePower',
                field: 'q0',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },
};

export const DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE =
    'displayedColumns.';
export const LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE = 'lockedColumns.';
export const REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE =
    'reorderedColumns.';

export const TABLES_COLUMNS_NAMES = Object.values(TABLES_DEFINITIONS)
    .map((table) => table.columns)
    .map((cols) => new Set(cols.map((c) => c.id)));

export const TABLES_COLUMNS_NAMES_JSON = TABLES_COLUMNS_NAMES.map((cols) =>
    JSON.stringify([...cols])
);

export const TABLES_NAMES = Object.values(TABLES_DEFINITIONS).map(
    (table) => table.name
);

export const TABLES_NAMES_INDEXES = new Map(
    Object.values(TABLES_DEFINITIONS).map((table) => [table.name, table.index])
);

export const TABLES_DEFINITION_INDEXES = new Map(
    Object.values(TABLES_DEFINITIONS).map((table) => [table.index, table])
);

function generateTapRequest(type, leg) {
    const getLeg = leg !== undefined ? '.getLeg' + leg + '()' : '';
    return (
        'tap = equipment' +
        getLeg +
        '.get' +
        type +
        'TapChanger()\n' +
        'if (tap.getLowTapPosition() <= {} && {} <= tap.getHighTapPosition() ) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}

export const ALLOWED_KEYS = [
    'Escape',
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
];
