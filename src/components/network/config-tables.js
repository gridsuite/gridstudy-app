/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from './network-equipments';
import {
    NumericalField,
    NameField,
    EnumField,
    BooleanListField,
    TapChangerSelector,
} from './equipment-table-editors';
import { FluxConventions } from '../dialogs/parameters/network-parameters';
import { ENERGY_SOURCES, LOAD_TYPES } from './constants';

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
                id: 'ID',
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'Country',
                dataKey: 'countryName',
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        resource: equipments.voltageLevels,
        getter: (network) => network.getVoltageLevels(),
        columns: [
            {
                id: 'ID',
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'SubstationId',
                dataKey: 'substationId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                numeric: true,
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
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                id: 'NominalVoltageSide1',
                dataKey: 'nominalVoltage1',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId1);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                dataKey: 'nominalVoltage2',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId2);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        resource: equipments.twoWindingsTransformers,
        modifiableEquipmentType: 'twoWindingsTransformer',
        columns: [
            {
                id: 'ID',
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                id: 'NominalVoltageSide1',
                dataKey: 'nominalVoltage1',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId1);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                dataKey: 'nominalVoltage2',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId2);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LoadTapChangingCapabilities',
                dataKey: 'loadTapChangingCapabilities',
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger
                        ?.loadTapChangingCapabilities;
                },
                boolean: true,
            },
            {
                id: 'RegulatingRatio',
                dataKey: 'regulatingRatio',
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger?.regulating;
                },
                boolean: true,
            },
            {
                id: 'TargetVPoint',
                dataKey: 'targetV',
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger?.targetV;
                },
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'RatioTap',
                dataKey: 'ratioTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingMode',
                dataKey: 'regulationMode',
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger?.regulationMode;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase',
                dataKey: 'regulatingPhase',
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger?.regulating;
                },
                boolean: true,
            },
            {
                id: 'PhaseTap',
                dataKey: 'phaseTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingValue',
                dataKey: 'regulatingValue',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger?.regulatingValue;
                },
            },
        ],
    },

    THREE_WINDINGS_TRANSFORMERS: {
        index: 4,
        name: 'ThreeWindingsTransformers',
        resource: equipments.threeWindingsTransformers,
        modifiableEquipmentType: 'threeWindingsTransformer',
        columns: [
            {
                id: 'ID',
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                id: 'VoltageLevelIdSide3',
                dataKey: 'voltageLevelId3',
            },
            {
                id: 'NominalVoltageSide1',
                dataKey: 'nominalVoltage1',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId1);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                dataKey: 'nominalVoltage2',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId2);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide3',
                dataKey: 'nominalVoltage3',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId3);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide3',
                dataKey: 'p3',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide3',
                dataKey: 'q3',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LoadTapChanging1Capabilities',
                dataKey: 'loadTapChanging1Capabilities',
                boolean: true,
            },
            {
                id: 'RegulatingRatio1',
                dataKey: 'regulatingRatio1',
                boolean: true,
            },
            {
                id: 'TargetVPoint1',
                dataKey: 'targetV1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'RatioTap1',
                dataKey: 'ratioTapChanger1',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger1?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger1,
                        ...props,
                    }),
            },
            {
                id: 'LoadTapChanging2Capabilities',
                dataKey: 'loadTapChanging2Capabilities',
                boolean: true,
            },
            {
                id: 'RegulatingRatio2',
                dataKey: 'regulatingRatio2',
                boolean: true,
            },
            {
                id: 'TargetVPoint2',
                dataKey: 'targetV2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'RatioTap2',
                dataKey: 'ratioTapChanger2',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger2?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger2,
                        ...props,
                    }),
            },
            {
                id: 'LoadTapChanging3Capabilities',
                dataKey: 'loadTapChanging3Capabilities',
                boolean: true,
            },
            {
                id: 'RegulatingRatio3',
                dataKey: 'regulatingRatio3',
                boolean: true,
            },
            {
                id: 'TargetVPoint3',
                dataKey: 'targetV3',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'RatioTap3',
                dataKey: 'ratioTapChanger3',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.ratioTapChanger3?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger3,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingMode1',
                dataKey: 'regulatingMode1',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase1',
                dataKey: 'regulatingPhase1',
                boolean: true,
            },
            {
                id: 'PhaseTap1',
                dataKey: 'phaseTapChanger1',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger1?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger1,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingValue1',
                dataKey: 'regulatingValue1',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                id: 'RegulatingMode2',
                dataKey: 'regulatingMode2',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase2',
                dataKey: 'regulatingPhase2',
                boolean: true,
            },
            {
                id: 'PhaseTap2',
                dataKey: 'phaseTapChanger2',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger2?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger2,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingValue2',
                dataKey: 'regulatingValue2',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                id: 'RegulatingMode3',
                dataKey: 'regulatingMode3',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'RegulatingPhase3',
                dataKey: 'regulatingPhase3',
                boolean: true,
            },
            {
                id: 'PhaseTap3',
                dataKey: 'phaseTapChanger3',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
                cellDataGetter: (cellData) => {
                    return cellData?.phaseTapChanger3?.tapPosition;
                },
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger3,
                        ...props,
                    }),
            },
            {
                id: 'RegulatingValue3',
                dataKey: 'regulatingValue3',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
        ],
    },

    GENERATORS: {
        index: 5,
        name: 'Generators',
        resource: equipments.generators,
        modifiableEquipmentType: 'generator',
        columns: [
            {
                id: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
                changeCmd: "equipment.setName('{}')\n",
                editor: NameField,
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'Type',
                dataKey: 'energySource',
                changeCmd: 'equipment.setEnergySource(EnergySource.{})\n',
                editor: ({ equipment, ...props }) =>
                    EnumField({
                        enumList: ENERGY_SOURCES,
                        ...props,
                    }),
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerControl',
                dataKey: 'activePowerControlOn',
                boolean: true,
            },
            {
                id: 'MinP',
                dataKey: 'minP',
                numeric: true,
                fractionDigits: 1,
                forceUpdateOnChange: true,
                changeCmd: 'equipment.setMinP({})\n',
                editor: ({ equipment, ...props }) =>
                    NumericalField({
                        max: equipment.maxP,
                        ...props,
                    }),
            },
            {
                id: 'MaxP',
                dataKey: 'maxP',
                numeric: true,
                fractionDigits: 1,
                forceUpdateOnChange: true,
                changeCmd: 'equipment.setMaxP({})\n',
                editor: ({ equipment, ...props }) =>
                    NumericalField({
                        min: equipment.minP,
                        ...props,
                    }),
            },
            {
                id: 'TargetP',
                dataKey: 'targetP',
                numeric: true,
                changeCmd:
                    'if (equipment.getMinP() <= {} && {} <= equipment.getMaxP() ) { \n' +
                    '    equipment.setTargetP({})\n' +
                    '} else {\n' +
                    "    throw new Exception('incorrect value')\n" +
                    ' }\n',
                editor: ({ equipment, ...props }) =>
                    NumericalField({
                        min: equipment.minP,
                        max: equipment.maxP,
                        ...props,
                    }),
                fractionDigits: 1,
            },
            {
                id: 'TargetQ',
                dataKey: 'targetQ',
                numeric: true,
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetQ({})\n',
                editor: NumericalField,
                editableCondition: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: false,
                },
            },
            {
                id: 'VoltageRegulatorOn',
                dataKey: 'voltageRegulatorOn',
                boolean: true,
                forceUpdateOnChange: true,
                changeCmd: 'equipment.setVoltageRegulatorOn({})\n',
                editor: BooleanListField,
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
                dataKey: 'targetV',
                numeric: true,
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetV({})\n',
                editor: NumericalField,
                editableCondition: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: true,
                },
            },
            {
                id: 'RegulatingTerminal',
                dataKey: 'regulatingTerminal',
            },
        ],
    },

    LOADS: {
        index: 6,
        name: 'Loads',
        resource: equipments.loads,
        modifiableEquipmentType: 'load',
        columns: [
            {
                id: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                changeCmd: "equipment.setName('{}')\n",
                editor: NameField,
            },
            {
                id: 'LoadType',
                dataKey: 'type',
                changeCmd: 'equipment.setLoadType(LoadType.{})\n',
                editor: ({ equipment, ...props }) =>
                    EnumField({
                        enumList: LOAD_TYPES,
                        ...props,
                    }),
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ConstantP',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
                changeCmd: 'equipment.setP0({})\n',
                editor: NumericalField,
            },
            {
                id: 'ConstantQ',
                dataKey: 'q0',
                numeric: true,
                fractionDigits: 1,
                changeCmd: 'equipment.setQ0({})\n',
                editor: NumericalField,
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
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'TargetV',
                dataKey: 'targetV',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'TargetDeadband',
                dataKey: 'targetDeadband',
                numeric: true,
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
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'VoltageSetpoint',
                dataKey: 'voltageSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'ReactivePowerSetpoint',
                dataKey: 'reactivePowerSetpoint',
                numeric: true,
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
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                id: 'TargetP',
                dataKey: 'targetP',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'TargetQ',
                dataKey: 'targetQ',
                numeric: true,
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
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'ConvertersMode',
                dataKey: 'convertersMode',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'ConverterStationId1',
                dataKey: 'converterStationId1',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'ConverterStationId2',
                dataKey: 'converterStationId2',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'R',
                dataKey: 'r',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'ActivePowerSetpoint',
                dataKey: 'activePowerSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'MaxP',
                dataKey: 'maxP',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'OprFromCS1toCS2',
                dataKey: 'oprFromCS1toCS2',
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'OprFromCS2toCS1',
                dataKey: 'oprFromCS2toCS1',
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                id: 'AcEmulation',
                dataKey: 'isEnabled',
                boolean: true,
            },
            {
                id: 'K',
                dataKey: 'k',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'P0',
                dataKey: 'p0',
                numeric: true,
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
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'PowerFactor',
                dataKey: 'powerFactor',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'LossFactor',
                dataKey: 'lossFactor',
                numeric: true,
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
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'LossFactor',
                dataKey: 'lossFactor',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'VoltageRegulatorOn',
                dataKey: 'voltageRegulatorOn',
                boolean: true,
            },
            {
                id: 'VoltageSetpointKV',
                dataKey: 'voltageSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'ReactivePowerSetpointMVAR',
                dataKey: 'reactivePowerSetpoint',
                numeric: true,
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
                dataKey: 'id',
            },
            {
                id: 'Name',
                dataKey: 'name',
            },
            {
                id: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'UcteXnodeCode',
                dataKey: 'ucteXnodeCode',
            },
            {
                id: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ConstantActivePower',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
            },
            {
                id: 'ConstantReactivePower',
                dataKey: 'q0',
                numeric: true,
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
