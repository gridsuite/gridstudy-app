/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from './network-equipments';
import { NumericalField, TapChangerSelector } from './equipment-table-editors';
import { FluxConventions } from '../parameters';

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
                id: 'RatioTap',
                dataKey: 'ratioTapChangerPosition',
                numeric: true,
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger,
                        ...props,
                    }),
            },
            {
                id: 'PhaseTap',
                dataKey: 'phaseTapChangerPosition',
                numeric: true,
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger,
                        ...props,
                    }),
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
                id: 'RatioTap1',
                dataKey: 'ratioTapChanger1Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger1,
                        ...props,
                    }),
            },
            {
                id: 'RatioTap2',
                dataKey: 'ratioTapChanger2Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger2,
                        ...props,
                    }),
            },
            {
                id: 'RatioTap3',
                dataKey: 'ratioTapChanger3Position',
                numeric: true,
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.ratioTapChanger3,
                        ...props,
                    }),
            },
            {
                id: 'PhaseTap1',
                dataKey: 'phaseTapChanger1Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger1,
                        ...props,
                    }),
            },
            {
                id: 'PhaseTap2',
                dataKey: 'phaseTapChanger2Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger2,
                        ...props,
                    }),
            },
            {
                id: 'PhaseTap3',
                dataKey: 'phaseTapChanger3Position',
                numeric: true,
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
                editor: ({ equipment, ...props }) =>
                    TapChangerSelector({
                        tapChanger: equipment.phaseTapChanger3,
                        ...props,
                    }),
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
                changeCmd: 'equipment.setTargetP({})',
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
            },
        ],
    },

    LOADS: {
        index: 6,
        name: 'Loads',
        resource: equipments.loads,
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
                id: 'LoadType',
                dataKey: 'type',
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
        'if (tap.getLowTapPosition() <= {} && {} < tap.getHighTapPosition() ) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}
