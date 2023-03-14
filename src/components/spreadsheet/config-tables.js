/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from '../network/network-equipments';
import { BooleanCellRenderer, NumericCellRenderer } from './cell-renderers';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';
import { BooleanListField, NumericalField } from './equipment-table-editors';
import { ENERGY_SOURCES, LOAD_TYPES } from 'components/network/constants';
import { FluxConventions } from 'components/dialogs/parameters/network-parameters';

/**
 * Used for boolean cell data value to render a checkbox
 * @param {any} rowData data of row
 * @param {any} columnDefinition definition of column
 * @param {any} key key of element
 * @param {any} style style for table cell element
 * @param {any} rowIndex rowIndex of element
 * @returns {JSX.Element} Component template
 */

const generateTapPositions = (params) => {
    return params
        ? Array.from(
              Array(params.highTapPosition - params.lowTapPosition + 1).keys()
          )
        : [];
};

const nominalVoltage = (network, voltageLevelId) => {
    return network.getVoltageLevel(voltageLevelId)?.nominalVoltage;
};

const applyFluxConvention = (convention, val) => {
    if (convention === FluxConventions.TARGET && val !== undefined) return -val;
    return val;
};

export const ROW_HEIGHT = 38;
export const HEADER_ROW_HEIGHT = 64;
export const MIN_COLUMN_WIDTH = 160;
export const MEDIUM_COLUMN_WIDTH = 220;
export const LARGE_COLUMN_WIDTH = 340;
export const EDIT_CELL_WIDTH = 65;
export const MAX_LOCKS_PER_TAB = 5;

export const TABLES_DEFINITIONS = {
    SUBSTATIONS: {
        index: 0,
        name: 'Substations',
        resource: equipments.substations,
        columns: [
            {
                field: 'id',
                id: 'ID',
                filter: true,
                editable: true,
            },
            {
                field: 'name',
                id: 'Name',
                filter: true,
                editable: true,
            },
            {
                field: 'countryName',
                id: 'Country',
                filter: true,
                editable: true,
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        resource: equipments.voltageLevels,
        modifiableEquipmentType: EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
        getter: (network) => network.getVoltageLevels(),
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        resource: equipments.lines,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId1
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId2
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        resource: equipments.twoWindingsTransformers,
        modifiableEquipmentType: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
        groovyEquipmentGetter: 'getTwoWindingsTransformer',
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId1
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId2
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LoadTapChangingCapabilities',
                field: 'loadTapChangingCapabilities',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.loadTapChangingCapabilities,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'RegulatingRatio',
                field: 'regulatingRatio',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.regulating,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'TargetVPoint',
                field: 'ratioTapChanger.targetV',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'RatioTap',
                field: 'ratioTapChanger',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'RegulatingMode',
                field: 'regulationMode',
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationMode,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase',
                field: 'regulatingPhase',
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulating,
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'PhaseTap',
                field: 'phaseTapChanger',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'RegulatingValue',
                field: 'regulationValue',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationValue,
            },
        ],
    },

    THREE_WINDINGS_TRANSFORMERS: {
        index: 4,
        name: 'ThreeWindingsTransformers',
        resource: equipments.threeWindingsTransformers,
        modifiableEquipmentType:
            EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type,
        groovyEquipmentGetter: 'getThreeWindingsTransformer',
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId1
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId2
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide3',
                field: 'nominalVoltage3',
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId3
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide3',
                field: 'p3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide3',
                field: 'q3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LoadTapChanging1Capabilities',
                field: 'loadTapChanging1Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'RegulatingRatio1',
                field: 'regulatingRatio1',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'TargetVPoint1',
                field: 'targetV1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'RatioTap1',
                field: 'ratioTapChanger1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
                valueGetter: (params) => params?.ratioTapChanger1?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger1
                        ),
                    };
                },
            },
            {
                id: 'LoadTapChanging2Capabilities',
                field: 'loadTapChanging2Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'RegulatingRatio2',
                field: 'regulatingRatio2',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'TargetVPoint2',
                field: 'targetV2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'RatioTap2',
                field: 'ratioTapChanger2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
                valueGetter: (params) => params?.ratioTapChanger2?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger2
                        ),
                    };
                },
            },
            {
                id: 'LoadTapChanging3Capabilities',
                field: 'loadTapChanging3Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'RegulatingRatio3',
                field: 'regulatingRatio3',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'TargetVPoint3',
                field: 'targetV3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'RatioTap3',
                field: 'ratioTapChanger3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
                valueGetter: (params) => params?.ratioTapChanger3?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger3
                        ),
                    };
                },
            },
            {
                id: 'RegulatingMode1',
                field: 'regulatingMode1',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase1',
                field: 'regulatingPhase1',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'PhaseTap1',
                field: 'phaseTapChanger1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
                valueGetter: (params) => params?.phaseTapChanger1?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger1
                        ),
                    };
                },
            },
            {
                id: 'RegulatingValue1',
                field: 'regulatingValue1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                id: 'RegulatingMode2',
                field: 'regulatingMode2',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase2',
                field: 'regulatingPhase2',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'PhaseTap2',
                field: 'phaseTapChanger2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
                valueGetter: (params) => params?.phaseTapChanger2?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger1
                        ),
                    };
                },
            },
            {
                id: 'RegulatingValue2',
                field: 'regulatingValue2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                id: 'RegulatingMode3',
                field: 'regulatingMode3',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase3',
                field: 'regulatingPhase3',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'PhaseTap3',
                field: 'phaseTapChanger3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
                valueGetter: (params) => params?.phaseTapChanger3?.tapPosition,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger3
                        ),
                    };
                },
            },
            {
                id: 'RegulatingValue3',
                field: 'regulatingValue3',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
        ],
    },

    GENERATORS: {
        index: 5,
        name: 'Generators',
        resource: equipments.generators,
        modifiableEquipmentType: EQUIPMENT_TYPES.GENERATOR.type,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerControl',
                field: 'activePowerControlOn',
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'MinP',
                field: 'minP',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                forceUpdateOnChange: true,
                changeCmd: 'equipment.setMinP({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        maxExpression: 'maxP',
                        defaultValue: params.data.minP,
                    };
                },
            },
            {
                id: 'MaxP',
                field: 'maxP',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                forceUpdateOnChange: true,
                changeCmd: 'equipment.setMaxP({})\n',
                editable: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        minExpression: 'minP',
                        defaultValue: params.data.maxP,
                    };
                },
            },
            {
                id: 'TargetP',
                field: 'targetP',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'VoltageRegulatorOn',
                field: 'voltageRegulatorOn',
                cellRenderer: BooleanCellRenderer,
                forceUpdateOnChange: true,
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
            },
            {
                id: 'TargetV',
                field: 'targetV',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'RegulatingTerminal',
                field: 'regulatingTerminal',
            },
        ],
    },
    LOADS: {
        index: 6,
        name: 'Loads',
        resource: equipments.loads,
        modifiableEquipmentType: EQUIPMENT_TYPES.LOAD.type,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ConstantP',
                field: 'p0',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
            {
                id: 'ConstantQ',
                field: 'q0',
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
            },
        ],
    },

    SHUNT_COMPENSATORS: {
        index: 7,
        name: 'ShuntCompensators',
        resource: equipments.shuntCompensators,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'TargetV',
                field: 'targetV',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'TargetDeadband',
                field: 'targetDeadband',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
        ],
    },

    STATIC_VAR_COMPENSATORS: {
        index: 8,
        name: 'StaticVarCompensators',
        resource: equipments.staticVarCompensators,
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'VoltageSetpoint',
                field: 'voltageSetpoint',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'ReactivePowerSetpoint',
                field: 'reactivePowerSetpoint',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        ],
    },

    BATTERIES: {
        index: 9,
        name: 'Batteries',
        resource: equipments.batteries,
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'TargetP',
                field: 'targetP',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
        ],
    },

    HVDC_LINES: {
        index: 10,
        name: 'HvdcLines',
        resource: equipments.hvdcLines,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'ActivePowerSetpoint',
                field: 'activePowerSetpoint',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'MaxP',
                field: 'maxP',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'OprFromCS1toCS2',
                field: 'oprFromCS1toCS2',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'OprFromCS2toCS1',
                field: 'oprFromCS2toCS1',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'AcEmulation',
                field: 'isEnabled',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'K',
                field: 'k',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'P0',
                field: 'p0',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
        ],
    },

    LCC_CONVERTER_STATIONS: {
        index: 11,
        name: 'LccConverterStations',
        resource: equipments.lccConverterStations,
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'PowerFactor',
                field: 'powerFactor',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
        ],
    },

    VSC_CONVERTER_STATIONS: {
        index: 12,
        name: 'VscConverterStations',
        resource: equipments.vscConverterStations,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
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
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'VoltageRegulatorOn',
                field: 'voltageRegulatorOn',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
            },
            {
                id: 'VoltageSetpointKV',
                field: 'voltageSetpoint',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'ReactivePowerSetpointMVAR',
                field: 'reactivePowerSetpoint',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
        ],
    },

    DANGLING_LINES: {
        index: 13,
        name: 'DanglingLines',
        resource: equipments.danglingLines,
        columns: [
            {
                id: 'ID',
                field: 'id',
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
                valueGetter: (params) =>
                    nominalVoltage(
                        params.context.network,
                        params.data.voltageLevelId
                    ),
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'UcteXnodeCode',
                field: 'ucteXnodeCode',
            },
            {
                id: 'ActivePower',
                field: 'p',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ConstantActivePower',
                field: 'p0',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
            },
            {
                id: 'ConstantReactivePower',
                field: 'q0',
                numeric: true,
                cellRenderer: NumericCellRenderer,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
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
