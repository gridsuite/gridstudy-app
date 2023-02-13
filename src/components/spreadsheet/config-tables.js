/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from '../network/network-equipments';
import {
    NumericalField,
    NameField,
    EnumField,
    BooleanListField,
    TapChangerSelector,
} from '../network/equipment-table-editors';
import { FluxConventions } from '../dialogs/parameters/network-parameters';
import { ENERGY_SOURCES, LOAD_TYPES } from '../network/constants';
import NumericCellEditor from '../network/numericCellEditor.jsx';
import { Checkbox } from '@mui/material';
import { booleanCellRender } from './cell-renderers';

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
    return Array.from(
        Array(params.highTapPosition - params.lowTapPosition + 1).keys()
    );
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
                dataKey: 'id',
                filter: true,
                editable: true,
            },
            {
                field: 'name',
                id: 'Name',
                dataKey: 'name',
                filter: true,
                editable: true,
            },
            {
                field: 'countryName',
                id: 'Country',
                dataKey: 'countryName',
                filter: true,
                editable: true,
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
                field: 'id',
                dataKey: 'id',
            },
            {
                id: 'Name',
                field: 'name',
                dataKey: 'name',
            },
            {
                id: 'SubstationId',
                field: 'substationId',
                dataKey: 'substationId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                dataKey: 'nominalVoltage',
                numeric: true,
                fractionDigits: 0,
                editable: true,
                cellEditor: NumericCellEditor,
                cellEditorPopup: true,
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        resource: equipments.lines,
        columns: [
            {
                field: 'id',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                headerName: 'ID',
                filter: true,
            },
            {
                field: 'name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                headerName: 'Name',
                filter: true,
            },
            {
                field: 'voltageLevelId1',
                dataKey: 'voltageLevelId1',
                headerName: 'VoltageLevelIdSide1',
                filter: true,
            },
            {
                field: 'voltageLevelId2',
                dataKey: 'voltageLevelId2',
                headerName: 'VoltageLevelIdSide2',
                filter: true,
            },
            {
                field: 'nominalVoltage1',
                dataKey: 'nominalVoltage1',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(
                        network,
                        cellData.data.voltageLevelId1
                    );
                },
                numeric: true,
                fractionDigits: 0,
                headerName: 'NominalVoltageSide1',
                filter: true,
            },
            {
                field: 'nominalVoltage2',
                dataKey: 'nominalVoltage2',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId2);
                },
                numeric: true,
                fractionDigits: 0,
                headerName: 'NominalVoltageSide2',
                filter: true,
            },
            {
                field: 'p1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                headerName: 'ActivePowerSide1',
                filter: true,
            },
            {
                field: 'p2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                headerName: 'ActivePowerSide2',
                filter: true,
            },
            {
                field: 'q1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                headerName: 'ReactivePowerSide1',
                filter: true,
            },
            {
                field: 'q2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                headerName: 'ReactivePowerSide2',
                filter: true,
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
                field: 'id',
                dataKey: 'id',
                filter: true,
            },
            {
                id: 'Name',
                field: 'name',
                dataKey: 'name',
                filter: true,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
                dataKey: 'voltageLevelId1',
                filter: true,
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
                dataKey: 'voltageLevelId2',
                filter: true,
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                dataKey: 'nominalVoltage1',
                valueGetter: (cellData, network) => {
                    cellData.data.nominalVoltage1 = network
                        ? nominalVoltage(network, cellData.data.voltageLevelId1)
                        : undefined;
                    return cellData.data.nominalVoltage1;
                },
                numeric: true,
                fractionDigits: 0,
                filter: 'agNumberColumnFilter',
                sortable: true,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                dataKey: 'nominalVoltage2',
                valueGetter: (cellData, network) => {
                    return network
                        ? nominalVoltage(network, cellData.data.voltageLevelId2)
                        : undefined;
                },
                numeric: true,
                fractionDigits: 0,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'LoadTapChangingCapabilities',
                field: 'loadTapChangingCapabilities',
                dataKey: 'loadTapChangingCapabilities',
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger
                        ?.loadTapChangingCapabilities;
                },
                boolean: true,
                filter: true,
                cellRenderer: booleanCellRender,
            },
            {
                id: 'RegulatingRatio',
                field: 'regulatingRatio',
                dataKey: 'regulatingRatio',
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger?.regulating;
                },
                boolean: true,
                filter: true,
                cellRenderer: booleanCellRender,
            },
            {
                id: 'TargetVPoint',
                field: 'targetV',
                dataKey: 'targetV',
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger?.targetV;
                },
                numeric: true,
                fractionDigits: 1,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'RatioTap',
                field: 'ratioTapChanger',
                dataKey: 'ratioTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger?.tapPosition;
                },
                valueSetter: (cellData) => {
                    cellData.data.ratioTapChanger.tapPosition =
                        cellData.newValue;
                    return cellData;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.ratioTapChanger
                        ),
                    };
                },
                filter: 'agNumberColumnFilter',
                editable: true,
            },
            {
                id: 'RegulatingMode',
                field: 'regulationMode',
                dataKey: 'regulationMode',
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulationMode;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                filter: true,
            },
            {
                id: 'RegulatingPhase',
                field: 'regulatingPhase',
                dataKey: 'regulatingPhase',
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulating;
                },
                boolean: true,
                filter: true,
                cellRenderer: booleanCellRender,
            },
            {
                id: 'PhaseTap',
                field: 'phaseTapChanger',
                dataKey: 'phaseTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.tapPosition;
                },
                valueSetter: (cellData) => {
                    cellData.data.phaseTapChanger.tapPosition =
                        cellData.newValue;
                    return cellData;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data.phaseTapChanger
                        ),
                    };
                },
                filter: 'agNumberColumnFilter',
                editable: true,
            },
            {
                id: 'RegulatingValue',
                field: 'regulationValue',
                dataKey: 'regulationValue',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulationValue;
                },
                filter: 'agNumberColumnFilter',
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
                field: 'ID',
                dataKey: 'id',
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelIdSide1',
                dataKey: 'voltageLevelId1',
            },
            {
                field: 'VoltageLevelIdSide2',
                dataKey: 'voltageLevelId2',
            },
            {
                field: 'VoltageLevelIdSide3',
                dataKey: 'voltageLevelId3',
            },
            {
                field: 'NominalVoltageSide1',
                dataKey: 'nominalVoltage1',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId1);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'NominalVoltageSide2',
                dataKey: 'nominalVoltage2',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId2);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'NominalVoltageSide3',
                dataKey: 'nominalVoltage3',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId3);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'ActivePowerSide1',
                dataKey: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ActivePowerSide2',
                dataKey: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ActivePowerSide3',
                dataKey: 'p3',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePowerSide1',
                dataKey: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePowerSide2',
                dataKey: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePowerSide3',
                dataKey: 'q3',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'LoadTapChanging1Capabilities',
                dataKey: 'loadTapChanging1Capabilities',
                boolean: true,
            },
            {
                field: 'RegulatingRatio1',
                dataKey: 'regulatingRatio1',
                boolean: true,
            },
            {
                field: 'TargetVPoint1',
                dataKey: 'targetV1',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'RatioTap1',
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
                field: 'LoadTapChanging2Capabilities',
                dataKey: 'loadTapChanging2Capabilities',
                boolean: true,
            },
            {
                field: 'RegulatingRatio2',
                dataKey: 'regulatingRatio2',
                boolean: true,
            },
            {
                field: 'TargetVPoint2',
                dataKey: 'targetV2',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'RatioTap2',
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
                field: 'LoadTapChanging3Capabilities',
                dataKey: 'loadTapChanging3Capabilities',
                boolean: true,
            },
            {
                field: 'RegulatingRatio3',
                dataKey: 'regulatingRatio3',
                boolean: true,
            },
            {
                field: 'TargetVPoint3',
                dataKey: 'targetV3',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'RatioTap3',
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
                field: 'RegulatingMode1',
                dataKey: 'regulatingMode1',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'RegulatingPhase1',
                dataKey: 'regulatingPhase1',
                boolean: true,
            },
            {
                field: 'PhaseTap1',
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
                field: 'RegulatingValue1',
                dataKey: 'regulatingValue1',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                field: 'RegulatingMode2',
                dataKey: 'regulatingMode2',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'RegulatingPhase2',
                dataKey: 'regulatingPhase2',
                boolean: true,
            },
            {
                field: 'PhaseTap2',
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
                field: 'RegulatingValue2',
                dataKey: 'regulatingValue2',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            {
                field: 'RegulatingMode3',
                dataKey: 'regulatingMode3',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'RegulatingPhase3',
                dataKey: 'regulatingPhase3',
                boolean: true,
            },
            {
                field: 'PhaseTap3',
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
                field: 'RegulatingValue3',
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
                field: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'Name',
                dataKey: 'name',
                changeCmd: "equipment.setName('{}')\n",
                editor: NameField,
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'Type',
                dataKey: 'energySource',
                changeCmd: 'equipment.setEnergySource(EnergySource.{})\n',
                editor: ({ equipment, ...props }) =>
                    EnumField({
                        enumList: ENERGY_SOURCES,
                        ...props,
                    }),
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                field: 'ActivePowerControl',
                dataKey: 'activePowerControlOn',
                boolean: true,
            },
            {
                field: 'MinP',
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
                field: 'MaxP',
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
                field: 'TargetP',
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
                field: 'TargetQ',
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
                field: 'VoltageRegulatorOn',
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
                field: 'TargetV',
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
                field: 'RegulatingTerminal',
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
                field: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                changeCmd: "equipment.setName('{}')\n",
                editor: NameField,
            },
            {
                field: 'LoadType',
                dataKey: 'type',
                changeCmd: 'equipment.setLoadType(LoadType.{})\n',
                editor: ({ equipment, ...props }) =>
                    EnumField({
                        enumList: [
                            ...LOAD_TYPES,
                            {
                                field: 'UNDEFINED',
                                label: 'UndefinedDefaultValue',
                            },
                        ],
                        ...props,
                    }),
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ConstantP',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
                changeCmd: 'equipment.setP0({})\n',
                editor: NumericalField,
            },
            {
                field: 'ConstantQ',
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
                field: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                field: 'TargetV',
                dataKey: 'targetV',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'TargetDeadband',
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
                field: 'ID',
                dataKey: 'id',
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'VoltageSetpoint',
                dataKey: 'voltageSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'ReactivePowerSetpoint',
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
                field: 'ID',
                dataKey: 'id',
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
            },
            {
                field: 'TargetP',
                dataKey: 'targetP',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'TargetQ',
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
                field: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'Name',
                dataKey: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'ConvertersMode',
                dataKey: 'convertersMode',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                field: 'ConverterStationId1',
                dataKey: 'converterStationId1',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                field: 'ConverterStationId2',
                dataKey: 'converterStationId2',
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                field: 'R',
                dataKey: 'r',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'ActivePowerSetpoint',
                dataKey: 'activePowerSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'MaxP',
                dataKey: 'maxP',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'OprFromCS1toCS2',
                dataKey: 'oprFromCS1toCS2',
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                field: 'OprFromCS2toCS1',
                dataKey: 'oprFromCS2toCS1',
                numeric: true,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
            },
            {
                field: 'AcEmulation',
                dataKey: 'isEnabled',
                boolean: true,
            },
            {
                field: 'K',
                dataKey: 'k',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'P0',
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
                field: 'ID',
                dataKey: 'id',
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'PowerFactor',
                dataKey: 'powerFactor',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'LossFactor',
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
                field: 'ID',
                dataKey: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'HvdcLineId',
                dataKey: 'hvdcLineId',
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'LossFactor',
                dataKey: 'lossFactor',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'VoltageRegulatorOn',
                dataKey: 'voltageRegulatorOn',
                boolean: true,
            },
            {
                field: 'VoltageSetpointKV',
                dataKey: 'voltageSetpoint',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'ReactivePowerSetpointMVAR',
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
                field: 'ID',
                dataKey: 'id',
            },
            {
                field: 'Name',
                dataKey: 'name',
            },
            {
                field: 'VoltageLevelId',
                dataKey: 'voltageLevelId',
            },
            {
                field: 'NominalV',
                dataKey: 'nominalVoltage',
                cellDataGetter: (cellData, network) => {
                    return nominalVoltage(network, cellData.voltageLevelId);
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                field: 'UcteXnodeCode',
                dataKey: 'ucteXnodeCode',
            },
            {
                field: 'ActivePower',
                dataKey: 'p',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ReactivePower',
                dataKey: 'q',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                field: 'ConstantActivePower',
                dataKey: 'p0',
                numeric: true,
                fractionDigits: 1,
            },
            {
                field: 'ConstantReactivePower',
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
