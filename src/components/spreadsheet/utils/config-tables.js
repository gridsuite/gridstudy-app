/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BooleanCellRenderer, PropertiesCellRenderer } from './cell-renderers';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { BooleanListField, NumericalField } from './equipment-table-editors';
import { ENERGY_SOURCES, LOAD_TYPES } from 'components/network/constants';
import { SHUNT_COMPENSATOR_TYPES } from 'components/utils/field-constants';
import { FluxConventions } from 'components/dialogs/parameters/network-parameters';
import { EQUIPMENT_FETCHERS } from 'components/utils/equipment-fetchers';
import {
    kiloUnitToUnit,
    unitToKiloUnit,
    unitToMicroUnit,
} from '../../../utils/rounding';

const generateTapPositions = (params) => {
    return params
        ? Array.from(
              Array(params.highTapPosition - params.lowTapPosition + 1).keys()
          )
        : [];
};

const isEditable = (params) => {
    return params.context.isEditing && params.node.rowPinned === 'top';
};

const editableCellStyle = (params) => {
    if (params.context.isEditing && params.node.rowPinned === 'top') {
        if (
            Object.keys(params.context.editErrors).includes(params.column.colId)
        ) {
            return params.context.theme.editableCellError;
        } else {
            return params.context.theme.editableCell;
        }
    }
    return null;
};

const applyFluxConvention = (convention, val) => {
    if (convention === FluxConventions.TARGET && val !== undefined) {
        return -val;
    }
    return val;
};

//this function enables us to exclude some columns from the computation of the spreadsheet global filter
// The columns we want to include in the global filter at the date of this comment : ID (all), Name, Country, Type and Nominal Voltage (all).
// All the others should be excluded.
const excludeFromGlobalFilter = () => '';

export const MIN_COLUMN_WIDTH = 160;
export const MEDIUM_COLUMN_WIDTH = 220;
export const LARGE_COLUMN_WIDTH = 340;
export const MAX_LOCKS_PER_TAB = 5;

export const DEFAULT_SORT_ORDER = 'asc';

export const EDIT_COLUMN = 'edit';

const propertiesGetter = (params) => {
    const properties = params?.data?.properties;
    if (properties && Object.keys(properties).length) {
        return Object.keys(properties)
            .map((property) => property + ' : ' + properties[property])
            .join(' | ');
    } else {
        return null;
    }
};

const handleGSubstationPropertiesCellClick = (event) => {
    const { context: { isEditing, handleCellClick } = {} } = event || {};
    if (
        isEditing &&
        event.node.rowIndex === 0 &&
        event.node.rowPinned === 'top'
    ) {
        handleCellClick?.openPropertiesDialog();
    }
};

const generateEditableNumericColumnDefinition = (
    id,
    field,
    fractionDigits,
    changeCmd,
    optional,
    minExpression,
    maxExpression,
    excludeFromGlobalFilter,
    extraDef
) => {
    return {
        id: id,
        field: field,
        numeric: true,
        filter: 'agNumberColumnFilter',
        fractionDigits: fractionDigits,
        changeCmd: changeCmd,
        editable: isEditable,
        cellStyle: editableCellStyle,
        cellEditor: NumericalField,
        cellEditorParams: (params) => {
            return {
                defaultValue: params.data[field],
                gridContext: params.context,
                gridApi: params.api,
                colDef: params.colDef,
            };
        },
        crossValidation: {
            optional: optional,
            minExpression: minExpression,
            maxExpression: maxExpression,
        },
        ...(excludeFromGlobalFilter && {
            getQuickFilterText: excludeFromGlobalFilter,
        }),
        ...extraDef,
    };
};

export const TABLES_DEFINITIONS = {
    SUBSTATIONS: {
        index: 0,
        name: 'Substations',
        type: EQUIPMENT_TYPES.SUBSTATION,
        fetchers: EQUIPMENT_FETCHERS.SUBSTATION,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'Country',
                field: 'countryName',
            },
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter, // valueFormatter does not work here
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                onCellClicked: handleGSubstationPropertiesCellClick,
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        type: EQUIPMENT_TYPES.VOLTAGE_LEVEL,
        fetchers: EQUIPMENT_FETCHERS.VOLTAGE_LEVEL,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.nominalVoltage,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
            },
            generateEditableNumericColumnDefinition(
                'LowVoltageLimitkV',
                'lowVoltageLimit',
                1,
                'equipment.setLowVoltageLimit({})\n',
                true,
                undefined,
                'highVoltageLimit',
                excludeFromGlobalFilter
            ),
            generateEditableNumericColumnDefinition(
                'HighVoltageLimitkV',
                'highVoltageLimit',
                1,
                'equipment.setHighVoltageLimit({})\n',
                true,
                'lowVoltageLimit',
                undefined,
                excludeFromGlobalFilter
            ),
            {
                id: 'IpMin',
                field: 'identifiableShortCircuit.ipMin',
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: (params) =>
                    unitToKiloUnit(
                        params.data?.identifiableShortCircuit?.ipMin
                    ),
                valueSetter: (params) => {
                    params.data.identifiableShortCircuit = {
                        ...params.data.identifiableShortCircuit,
                        ipMin: kiloUnitToUnit(params.newValue),
                    };
                    return params;
                },
                ...(excludeFromGlobalFilter && {
                    getQuickFilterText: excludeFromGlobalFilter,
                }),
            },
            {
                id: 'IpMax',
                field: 'identifiableShortCircuit.ipMax',
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: (params) =>
                    unitToKiloUnit(
                        params.data?.identifiableShortCircuit?.ipMax
                    ),
                valueSetter: (params) => {
                    params.data.identifiableShortCircuit = {
                        ...params.data.identifiableShortCircuit,
                        ipMax: kiloUnitToUnit(params.newValue),
                    };
                    return params;
                },
                ...(excludeFromGlobalFilter && {
                    getQuickFilterText: excludeFromGlobalFilter,
                }),
                ...{
                    crossValidation: {
                        requiredOn: {
                            dependencyColumn: 'ipMin',
                        },
                    },
                },
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        type: EQUIPMENT_TYPES.LINE,
        fetchers: EQUIPMENT_FETCHERS.LINE,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
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
                id: 'SeriesResistance',
                field: 'r',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'SeriesReactance',
                field: 'x',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ShuntConductance1',
                field: 'g1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g1),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ShuntConductance2',
                field: 'g2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g2),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ShuntSusceptance1',
                field: 'b1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.b1),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ShuntSusceptance2',
                field: 'b2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.b2),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedSide1',
                field: 'terminal1Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedSide2',
                field: 'terminal2Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        type: EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
        fetchers: EQUIPMENT_FETCHERS.TWO_WINDINGS_TRANSFORMER,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...params.data.ratioTapChanger,
                        tapPosition: params.newValue,
                    };

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
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...params.data.phaseTapChanger,
                        tapPosition: params.newValue,
                    };
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
                editable: isEditable,
                cellStyle: editableCellStyle,
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
            {
                id: 'SeriesResistance',
                field: 'r',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'SeriesReactance',
                field: 'x',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MagnetizingConductanceWithUnit',
                field: 'g',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MagnetizingSusceptanceWithUnit',
                field: 'b',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.b),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatedNominalPower',
                field: 'ratedS',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedSide1',
                field: 'terminal1Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedSide2',
                field: 'terminal2Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    THREE_WINDINGS_TRANSFORMERS: {
        index: 4,
        name: 'ThreeWindingsTransformers',
        type: EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
        fetchers: EQUIPMENT_FETCHERS.THREE_WINDINGS_TRANSFORMER,
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
                id: 'VoltageLevelIdT3WSide1',
                field: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdT3WSide2',
                field: 'voltageLevelId2',
            },
            {
                id: 'VoltageLevelIdT3WSide3',
                field: 'voltageLevelId3',
            },
            {
                id: 'NominalVoltageT3WSide1',
                field: 'nominalVoltage1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageT3WSide2',
                field: 'nominalVoltage2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageT3WSide3',
                field: 'nominalVoltage3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerT3WSide1',
                field: 'p1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerT3WSide2',
                field: 'p2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerT3WSide3',
                field: 'p3',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide1',
                field: 'q1',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide2',
                field: 'q2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide3',
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 1),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger1?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger1 = {
                        ...params.data.ratioTapChanger1,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 2),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger2?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger2 = {
                        ...params.data.ratioTapChanger2,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger3?.tapPosition,
                valueSetter: (params) => {
                    params.data.ratioTapChanger3 = {
                        ...params.data.ratioTapChanger3,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger1?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger1 = {
                        ...params.data.phaseTapChanger1,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger2?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger2 = {
                        ...params.data.phaseTapChanger2,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                filter: 'agNumberColumnFilter',
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger3?.tapPosition,
                valueSetter: (params) => {
                    params.data.phaseTapChanger3 = {
                        ...params.data.phaseTapChanger3,
                        tapPosition: params.newValue,
                    };
                    return params;
                },
                editable: isEditable,
                cellStyle: editableCellStyle,
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
            {
                id: 'ConnectedT3WSide1',
                field: 'terminal1Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedT3WSide2',
                field: 'terminal2Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ConnectedT3WSide3',
                field: 'terminal3Connected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    GENERATORS: {
        index: 5,
        name: 'Generators',
        type: EQUIPMENT_TYPES.GENERATOR,
        fetchers: EQUIPMENT_FETCHERS.GENERATOR,
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
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'Type',
                field: 'energySource',
                changeCmd: 'equipment.setEnergySource(EnergySource.{})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                id: 'activePower',
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
                field: 'activePowerControl.activePowerControlOn',
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'minActivePower',
                field: 'minP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setMinP({})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.minP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    maxExpression: 'maxP',
                },
            },
            {
                id: 'maxActivePower',
                field: 'maxP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setMaxP({})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.maxP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 'minP',
                },
            },
            {
                id: 'activePowerSetpoint',
                field: 'targetP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                changeCmd:
                    'if ((equipment.getMinP() <= {} && {} <= equipment.getMaxP()) || {} == 0) { \n' +
                    '    equipment.setTargetP({})\n' +
                    '} else {\n' +
                    "    throw new Exception('incorrect value')\n" +
                    ' }\n',

                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 'minP',
                    maxExpression: 'maxP',
                    allowZero: true,
                },
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetQ({})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetQ,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'voltageRegulatorOn',
                        //the following value is matched against the input of a boolean input, so 1 convey the following value : false
                        columnValue: 0,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'voltageRegulationOn',
                field: 'voltageRegulatorOn',
                cellRenderer: BooleanCellRenderer,
                changeCmd: 'equipment.setVoltageRegulatorOn({})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.voltageRegulatorOn | 0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetV',
                field: 'targetV',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                changeCmd: 'equipment.setTargetV({})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetV,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'voltageRegulatorOn',
                        //the following value is matched against the input of a boolean input, so 1 convey the following value : true
                        columnValue: 1,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingTerminal',
                field: 'regulatingTerminal',
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TransientReactance',
                field: 'generatorShortCircuit.transientReactance',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TransformerReactance',
                field: 'generatorShortCircuit.stepUpTransformerReactance',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PlannedActivePowerSetPoint',
                field: 'generatorStartup.plannedActivePowerSetPoint',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'StartupCost',
                field: 'generatorStartup.marginalCost',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PlannedOutageRate',
                field: 'generatorStartup.plannedOutageRate',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 2,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ForcedOutageRate',
                field: 'generatorStartup.forcedOutageRate',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 2,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },
    LOADS: {
        index: 6,
        name: 'Loads',
        type: EQUIPMENT_TYPES.LOAD,
        fetchers: EQUIPMENT_FETCHERS.LOAD,
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
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'LoadType',
                field: 'type',
                changeCmd: 'equipment.setLoadType(LoadType.{})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'activePower',
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
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.p0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
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
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.q0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    SHUNT_COMPENSATORS: {
        index: 7,
        name: 'ShuntCompensators',
        type: EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
        fetchers: EQUIPMENT_FETCHERS.SHUNT_COMPENSATOR,
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
                editable: isEditable,
                cellStyle: editableCellStyle,
                columnWidth: MIN_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
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
                id: 'MaximumSectionCount',
                field: 'maximumSectionCount',
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.maximumSectionCount,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                filter: 'agNumberColumnFilter',
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 0,
                },
            },
            {
                id: 'ShuntSectionCount',
                field: 'sectionCount',
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.sectionCount,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                filter: 'agNumberColumnFilter',
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 0,
                    maxExpression: 'maximumSectionCount',
                },
            },
            {
                id: 'Type',
                field: 'type',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: (params) =>
                    params?.data?.maxSusceptance > 0
                        ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                        : SHUNT_COMPENSATOR_TYPES.REACTOR.id,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [
                            ...Object.values(SHUNT_COMPENSATOR_TYPES).map(
                                (shuntType) => shuntType.id
                            ),
                        ],
                    };
                },
            },
            {
                id: 'maxQAtNominalV',
                field: 'maxQAtNominalV',
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.maxQAtNominalV,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 0,
                },
            },
            {
                id: 'SwitchedOnMaxQAtNominalV',
                field: 'switchedOnQAtNominalV',
                numeric: true,
                valueGetter: (params) =>
                    (params?.data?.maxQAtNominalV /
                        params?.data?.maximumSectionCount) *
                    params?.data?.sectionCount,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'MaxShuntSusceptance',
                editable: isEditable,
                cellStyle: editableCellStyle,
                field: 'maxSusceptance',
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.maxSusceptance,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                filter: 'agNumberColumnFilter',
                fractionDigits: 5,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'SwitchedOnMaxSusceptance',
                field: 'switchedOnSusceptance',
                numeric: true,
                valueGetter: (params) =>
                    (params?.data?.maxSusceptance /
                        params?.data?.maximumSectionCount) *
                    params?.data?.sectionCount,
                filter: 'agNumberColumnFilter',
                fractionDigits: 5,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    STATIC_VAR_COMPENSATORS: {
        index: 8,
        name: 'StaticVarCompensators',
        type: EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
        fetchers: EQUIPMENT_FETCHERS.STATIC_VAR_COMPENSATOR,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'activePower',
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
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    BATTERIES: {
        index: 9,
        name: 'Batteries',
        type: EQUIPMENT_TYPES.BATTERY,
        fetchers: EQUIPMENT_FETCHERS.BATTERY,
        columns: [
            {
                id: 'ID',
                field: 'id',
                sort: DEFAULT_SORT_ORDER,
            },
            {
                id: 'Name',
                field: 'name',
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'activePower',
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
                field: 'activePowerControl.activePowerControlOn',
                cellRenderer: BooleanCellRenderer,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                valueSetter: (params) => {
                    params.data.activePowerControl = {
                        ...(params.data.activePowerControl || {}),
                        activePowerControlOn: params.newValue,
                    };

                    return params;
                },
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.activePowerControl
                                ?.activePowerControlOn | 0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'DroopColumnName',
                field: 'activePowerControl.droop',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.activePowerControl?.droop,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                valueGetter: (params) => params.data?.activePowerControl?.droop,
                valueSetter: (params) => {
                    params.data.activePowerControl = {
                        ...(params.data.activePowerControl || {}),
                        droop: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn:
                            'activePowerControl.activePowerControlOn',
                        columnValue: 1,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'minActivePower',
                field: 'minP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.minP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                crossValidation: {
                    maxExpression: 'maxP',
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'maxActivePower',
                field: 'maxP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.maxP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                crossValidation: {
                    minExpression: 'minP',
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'activePowerSetpoint',
                field: 'targetP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetP,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                crossValidation: {
                    minExpression: 'minP',
                    maxExpression: 'maxP',
                    allowZero: true,
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'TargetQ',
                field: 'targetQ',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.targetQ,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    HVDC_LINES: {
        index: 10,
        name: 'HvdcLines',
        type: EQUIPMENT_TYPES.HVDC_LINE,
        fetchers: EQUIPMENT_FETCHERS.HVDC_LINE,
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
                id: 'maxActivePower',
                field: 'maxP',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS1toCS2',
                field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS2toCS1',
                field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'AcEmulation',
                field: 'hvdcAngleDroopActivePowerControl.isEnabled',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'K',
                field: 'hvdcAngleDroopActivePowerControl.droop',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'P0',
                field: 'hvdcAngleDroopActivePowerControl.p0',
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
        type: EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
        fetchers: EQUIPMENT_FETCHERS.LCC_CONVERTER_STATION,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
            },
            {
                id: 'activePower',
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
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    VSC_CONVERTER_STATIONS: {
        index: 12,
        name: 'VscConverterStations',
        type: EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
        fetchers: EQUIPMENT_FETCHERS.VSC_CONVERTER_STATION,
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
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
            },
            {
                id: 'activePower',
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
                id: 'voltageRegulationOn',
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
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
        ],
    },

    DANGLING_LINES: {
        index: 13,
        name: 'DanglingLines',
        type: EQUIPMENT_TYPES.DANGLING_LINE,
        fetchers: EQUIPMENT_FETCHERS.DANGLING_LINE,
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
                id: 'activePower',
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
            {
                id: 'Connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
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

export const TABLES_DEFINITION_TYPES = new Map(
    Object.values(TABLES_DEFINITIONS).map((table) => [table.type, table])
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
