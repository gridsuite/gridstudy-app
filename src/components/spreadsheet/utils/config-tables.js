/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BooleanCellRenderer, PropertiesCellRenderer } from './cell-renderers';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { SitePropertiesEditor } from './equipement-table-popup-editors';
import {
    GeneratorRegulatingTerminalEditor,
    NumericalField,
    SelectCountryField,
    BooleanListField,
    TWTRegulatingTerminalEditor,
} from './equipment-table-editors';
import {
    ENERGY_SOURCES,
    LOAD_TYPES,
    PHASE_REGULATION_MODES,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SHUNT_COMPENSATOR_TYPES,
    SIDE,
} from 'components/network/constants';
import { FluxConventions } from 'components/dialogs/parameters/network-parameters';
import { EQUIPMENT_FETCHERS } from 'components/utils/equipment-fetchers';
import {
    kiloUnitToUnit,
    unitToKiloUnit,
    unitToMicroUnit,
} from '../../../utils/unit-converter';
import {
    getComputedRegulationMode,
    getComputedRegulationType,
    getComputedTapSideId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    computeHighTapPosition,
    getTapChangerRegulationTerminalValue,
} from 'components/utils/utils';
import {
    getComputedPhaseRegulationType,
    getPhaseTapRegulationSideId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';

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
    if (isEditable(params)) {
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

export const EDIT_COLUMN = 'edit';

const defaultTextFilterConfig = {
    filter: 'agTextColumnFilter',
    customFilterParams: {
        filterDataType: FILTER_DATA_TYPES.TEXT,
        filterComparators: [
            FILTER_TEXT_COMPARATORS.STARTS_WITH,
            FILTER_TEXT_COMPARATORS.CONTAINS,
        ],
    },
};

const defaultNumericFilterConfig = {
    filter: 'agNumberColumnFilter',
    customFilterParams: {
        filterDataType: FILTER_DATA_TYPES.NUMBER,
        filterComparators: [
            FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
            FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
            FILTER_NUMBER_COMPARATORS.NOT_EQUAL,
        ],
    },
};

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

const isEditableRegulatingTerminalCell = (params) => {
    return (
        params.node.rowIndex === 0 &&
        params.node.rowPinned === 'top' &&
        (params.data.RegulationTypeText === REGULATION_TYPES.DISTANT.id ||
            params.data?.regulatingTerminalVlId ||
            params.data?.regulatingTerminalConnectableId)
    );
};

const getTwtRatioRegulationTypeId = (twt) => {
    //regulationType is set by the user (in edit mode)
    if (twt?.ratioTapChanger?.regulationType) {
        return twt.ratioTapChanger.regulationType;
    }
    //otherwise, we compute it
    const computedRegulationType = getComputedRegulationType(twt);
    return computedRegulationType?.id || null;
};

const getTwtRatioRegulationModeId = (twt) => {
    //regulationMode is set by the user (in edit mode)
    if (twt?.ratioTapChanger?.regulationMode !== undefined) {
        return twt.ratioTapChanger.regulationMode;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(twt);
    return computedRegulationMode?.id || null;
};

const getTwtPhaseRegulationTypeId = (twt) => {
    const phaseTapValues = twt?.phaseTapChanger;
    if (phaseTapValues && phaseTapValues.regulationType) {
        //this is the case where the regulation type is set by the user (in edit mode)
        return phaseTapValues.regulationType;
    }
    //otherwise, we compute it
    const computedRegulationType = getComputedPhaseRegulationType(twt);
    return computedRegulationType?.id || null;
};

const isEditableTwtPhaseRegulationSideCell = (params) => {
    return (
        isEditable(params) &&
        getTwtPhaseRegulationTypeId(params.data) === REGULATION_TYPES.LOCAL.id
    );
};

const isEditableTwtRatioRegulationSideCell = (params) => {
    return (
        isEditable(params) &&
        getTwtRatioRegulationTypeId(params.data) === REGULATION_TYPES.LOCAL.id
    );
};

const isEditableTwtRatioRegulatingTerminalCell = (params) => {
    return (
        isEditable(params) &&
        getTwtRatioRegulationTypeId(params.data) === REGULATION_TYPES.DISTANT.id
    );
};

const isEditableTwtPhaseRegulatingTerminalCell = (params) => {
    return (
        isEditable(params) &&
        getTwtPhaseRegulationTypeId(params.data) === REGULATION_TYPES.DISTANT.id
    );
};

const RegulatingTerminalCellGetter = (params) => {
    const {
        regulatingTerminalConnectableId,
        regulatingTerminalVlId,
        regulatingTerminalConnectableType,
    } = params?.data || {};

    if (
        regulatingTerminalVlId &&
        regulatingTerminalConnectableId &&
        regulatingTerminalConnectableType.trim() !== '' &&
        regulatingTerminalConnectableId.trim() !== ''
    ) {
        return `${regulatingTerminalConnectableType} (${regulatingTerminalConnectableId})`;
    }

    return null;
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
        ...defaultNumericFilterConfig,
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
                rowData: params.data,
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
                ...defaultTextFilterConfig,
                isDefaultSort: true,
            },
            {
                id: 'Name',
                field: 'name',
                editable: isEditable,
                cellStyle: editableCellStyle,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Country',
                field: 'countryName',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: SelectCountryField,
                valueSetter: (params) => {
                    params.data.countryCode = params?.newValue?.countryCode;
                    params.data.countryName = params?.newValue?.countryName;
                    return params;
                },
                ...defaultTextFilterConfig,
            },
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter, // valueFormatter does not work here
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                cellEditor: SitePropertiesEditor,
                cellEditorParams: (params) => {
                    return {
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                cellEditorPopup: true,
                ...defaultTextFilterConfig,
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                editable: isEditable,
                cellStyle: editableCellStyle,
                ...defaultTextFilterConfig,
            },
            {
                id: 'SubstationId',
                field: 'substationId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: unitToKiloUnit(
                            params.data?.identifiableShortCircuit?.ipMin
                        ),
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
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
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'IpMax',
                field: 'identifiableShortCircuit.ipMax',
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: unitToKiloUnit(
                            params.data?.identifiableShortCircuit?.ipMax
                        ),
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
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
                            dependencyColumn: 'identifiableShortCircuit.ipMin',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'r',
                field: 'r',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'x',
                field: 'x',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'g1',
                field: 'g1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g1),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'g2',
                field: 'g2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g2),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'b1',
                field: 'b1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.b1),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'b2',
                field: 'b2',
                numeric: true,
                ...defaultNumericFilterConfig,
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
        columns: [
            {
                id: 'ID',
                field: 'id',
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'ratedVoltage1',
                field: 'ratedU1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.ratedU1,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ratedVoltage2',
                field: 'ratedU2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.ratedU2,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LoadTapChangingCapabilities',
                field: 'ratioTapChanger.loadTapChangingCapabilities',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger?.loadTapChangingCapabilities,
                cellRenderer: BooleanCellRenderer,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data.ratioTapChanger || {}),
                        loadTapChangingCapabilities: params.newValue,
                        regulationMode: !!params.newValue
                            ? getTwtRatioRegulationModeId(params.data) ||
                              RATIO_REGULATION_MODES.FIXED_RATIO.id
                            : null,
                    };
                    return params;
                },
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.ratioTapChanger
                                ?.loadTapChangingCapabilities != null
                                ? +params.data?.ratioTapChanger
                                      ?.loadTapChangingCapabilities
                                : '',
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulationMode',
                field: 'ratioTapChanger.regulationMode',
                valueGetter: (params) =>
                    getTwtRatioRegulationModeId(params?.data),
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationMode: params.newValue,
                    };

                    return params;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: Object.values(RATIO_REGULATION_MODES).map(
                            (regulationMode) => regulationMode.id
                        ),
                    };
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn:
                            'ratioTapChanger.loadTapChangingCapabilities',
                        columnValue: 1,
                    },
                },
                ...defaultTextFilterConfig,
            },
            {
                id: 'TargetVPoint',
                field: 'ratioTapChanger.targetV',
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data?.ratioTapChanger?.targetV,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        targetV: params.newValue,
                    };
                    return params;
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioDeadBand',
                field: 'ratioTapChanger.targetDeadband',
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data.ratioTapChanger.targetDeadband,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        targetDeadband: params.newValue,
                    };
                    return params;
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulationTypeText',
                field: 'ratioTapChanger.regulationType',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    getTwtRatioRegulationTypeId(params?.data),
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationType: params.newValue,
                    };
                    return params;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [
                            ...Object.values(REGULATION_TYPES).map(
                                (type) => type.id
                            ),
                        ],
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulatedSide',
                field: 'ratioTapChanger.regulationSide',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    params.data?.ratioTapChanger?.regulationSide ??
                    getComputedTapSideId(params?.data),
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationSide: params.newValue,
                    };
                    return params;
                },
                editable: isEditableTwtRatioRegulationSideCell,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [...Object.values(SIDE).map((side) => side.id)],
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulatingTerminal',
                field: 'RatioRegulatingTerminal',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    getTapChangerRegulationTerminalValue(
                        params?.data?.ratioTapChanger
                    ),
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                cellStyle: (params) =>
                    isEditableTwtRatioRegulatingTerminalCell(params)
                        ? editableCellStyle(params)
                        : {},
                editable: isEditableTwtRatioRegulatingTerminalCell,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
                },
                cellEditor: TWTRegulatingTerminalEditor,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: getTapChangerRegulationTerminalValue,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                cellEditorPopup: true,
            },
            {
                id: 'RatioLowTapPosition',
                field: 'ratioTapChanger.lowTapPosition',
                getQuickFilterText: excludeFromGlobalFilter,
                ...defaultNumericFilterConfig,
                numeric: true,
                fractionDigits: 0,
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.ratioTapChanger?.steps?.length > 0,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data?.ratioTapChanger
                        ),
                    };
                },
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        lowTapPosition: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.steps',
                    },
                },
            },
            {
                id: 'RatioHighTapPosition',
                field: 'ratioTapChanger.highTapPosition',
                ...defaultNumericFilterConfig,
                valueGetter: (params) =>
                    computeHighTapPosition(
                        params?.data?.ratioTapChanger?.steps
                    ),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap',
                field: 'ratioTapChanger.tapPosition',
                ...defaultNumericFilterConfig,
                numeric: true,
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
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.ratioTapChanger?.steps?.length > 0,
                cellStyle: editableCellStyle,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.steps',
                    },
                },
            },
            {
                id: 'RegulatingMode',
                field: 'phaseTapChanger.regulationMode',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationMode,
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationMode: params.newValue,
                    };
                    return params;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: Object.values(PHASE_REGULATION_MODES).map(
                            (regulationMode) => regulationMode.id
                        ),
                    };
                },
            },
            {
                id: 'RegulatingValue',
                field: 'phaseTapChanger.regulationValue',
                ...defaultNumericFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                valueGetter: (params) =>
                    params?.data?.phaseTapChanger?.regulationValue,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.phaseTapChanger?.regulationMode !==
                        PHASE_REGULATION_MODES.FIXED_TAP.id,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.phaseTapChanger?.regulationValue,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationValue: params.newValue,
                    };
                    return params;
                },
            },
            {
                id: 'PhaseDeadBand',
                field: 'phaseTapChanger.targetDeadband',
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.phaseTapChanger?.regulationMode !==
                        PHASE_REGULATION_MODES.FIXED_TAP.id,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.phaseTapChanger?.targetDeadband,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        targetDeadband: params.newValue,
                    };
                    return params;
                },
            },
            {
                id: 'PhaseRegulationTypeText',
                field: 'phaseTapChanger.regulationType',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    getTwtPhaseRegulationTypeId(params?.data),
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationType: params.newValue,
                    };
                    return params;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [
                            ...Object.values(REGULATION_TYPES).map(
                                (type) => type.id
                            ),
                        ],
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseRegulatedSide',
                field: 'ratioTapChanger.regulationSide',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    params.data?.phaseTapChanger?.regulationSide ||
                    getPhaseTapRegulationSideId(params?.data),
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationSide: params.newValue,
                    };
                    return params;
                },
                editable: isEditableTwtPhaseRegulationSideCell,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [...Object.values(SIDE).map((side) => side.id)],
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseRegulatingTerminal',
                field: 'PhaseRegulatingTerminal',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    getTapChangerRegulationTerminalValue(
                        params?.data?.phaseTapChanger
                    ),
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                cellStyle: (params) =>
                    isEditableTwtPhaseRegulatingTerminalCell(params)
                        ? editableCellStyle(params)
                        : {},
                editable: isEditableTwtPhaseRegulatingTerminalCell,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
                },
                cellEditor: TWTRegulatingTerminalEditor,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: (params) => {
                            getTapChangerRegulationTerminalValue(params);
                        },
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                cellEditorPopup: true,
            },
            {
                id: 'PhaseLowTapPosition',
                field: 'phaseTapChanger.lowTapPosition',
                getQuickFilterText: excludeFromGlobalFilter,
                ...defaultNumericFilterConfig,
                numeric: true,
                fractionDigits: 0,
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.phaseTapChanger?.steps?.length > 0,
                cellStyle: editableCellStyle,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: generateTapPositions(
                            params.data?.phaseTapChanger
                        ),
                    };
                },
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        lowTapPosition: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.steps',
                    },
                },
            },
            {
                id: 'PhaseHighTapPosition',
                field: 'phaseTapChanger.highTapPosition',
                ...defaultNumericFilterConfig,
                valueGetter: (params) =>
                    computeHighTapPosition(
                        params?.data?.phaseTapChanger?.steps
                    ),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseTap',
                field: 'phaseTapChanger.tapPosition',
                ...defaultNumericFilterConfig,
                numeric: true,
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
                            params.data?.phaseTapChanger
                        ),
                    };
                },
                editable: (params) =>
                    isEditable(params) &&
                    params.data?.phaseTapChanger?.steps?.length > 0,
                cellStyle: editableCellStyle,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.steps',
                    },
                },
            },
            {
                id: 'r',
                field: 'r',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'x',
                field: 'x',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'g',
                field: 'g',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.g),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'b',
                field: 'b',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                valueGetter: (params) => unitToMicroUnit(params.data.b),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ratedNominalPower',
                field: 'ratedS',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdT3WSide1',
                field: 'voltageLevelId1',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdT3WSide2',
                field: 'voltageLevelId2',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelIdT3WSide3',
                field: 'voltageLevelId3',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalVoltageT3WSide1',
                field: 'nominalVoltage1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageT3WSide2',
                field: 'nominalVoltage2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageT3WSide3',
                field: 'nominalVoltage3',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerT3WSide1',
                field: 'p1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerT3WSide2',
                field: 'p2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerT3WSide3',
                field: 'p3',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide1',
                field: 'q1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide2',
                field: 'q2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerT3WSide3',
                field: 'q3',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap1',
                field: 'ratioTapChanger1',
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap2',
                field: 'ratioTapChanger2',
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioTap3',
                field: 'ratioTapChanger3',
                ...defaultNumericFilterConfig,
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
                ...defaultTextFilterConfig,
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
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode2',
                field: 'regulatingMode2',
                ...defaultTextFilterConfig,
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
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingMode3',
                field: 'regulatingMode3',
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
                changeCmd: "equipment.setName('{}')\n",
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'energySource',
                field: 'energySource',
                ...defaultTextFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                                ?.activePowerControlOn != null
                                ? +params.data?.activePowerControl
                                      ?.activePowerControlOn
                                : '',
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerRegulationDroop',
                field: 'activePowerControl.droop',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                id: 'reactivePowerSetpoint',
                field: 'targetQ',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                id: 'voltageSetpoint',
                field: 'targetV',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                id: 'ReactivePercentageVoltageRegulation',
                field: 'coordinatedReactiveControl.qPercent',
                ...defaultNumericFilterConfig,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                numeric: true,
                fractionDigits: 1,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    const qPercent =
                        params.data?.coordinatedReactiveControl?.qPercent;
                    return {
                        defaultValue: isNaN(qPercent) ? 0 : qPercent,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) => {
                    const qPercent =
                        params.data?.coordinatedReactiveControl?.qPercent;
                    return isNaN(qPercent) ? 0 : qPercent;
                },
                valueSetter: (params) => {
                    params.data.coordinatedReactiveControl = {
                        ...params.data.coordinatedReactiveControl,
                        qPercent: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'transientReactance',
                field: 'generatorShortCircuit.transientReactance',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.generatorShortCircuit
                                ?.transientReactance || 0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorShortCircuit?.transientReactance,
                valueSetter: (params) => {
                    params.data.generatorShortCircuit = {
                        ...params.data.generatorShortCircuit,
                        transientReactance: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'stepUpTransformerReactance',
                field: 'generatorShortCircuit.stepUpTransformerReactance',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.generatorShortCircuit
                                ?.stepUpTransformerReactance || 0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorShortCircuit
                        ?.stepUpTransformerReactance,
                valueSetter: (params) => {
                    params.data.generatorShortCircuit = {
                        ...params.data.generatorShortCircuit,
                        stepUpTransformerReactance: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'plannedActivePowerSetPoint',
                field: 'generatorStartup.plannedActivePowerSetPoint',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.generatorStartup
                                ?.plannedActivePowerSetPoint,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorStartup?.plannedActivePowerSetPoint,
                valueSetter: (params) => {
                    params.data.generatorStartup = {
                        ...params.data?.generatorStartup,
                        plannedActivePowerSetPoint: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'marginalCost',
                field: 'generatorStartup.marginalCost',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.generatorStartup?.marginalCost,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorStartup?.marginalCost,
                valueSetter: (params) => {
                    params.data.generatorStartup = {
                        ...params.data?.generatorStartup,
                        marginalCost: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'plannedOutageRate',
                field: 'generatorStartup.plannedOutageRate',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 2,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.generatorStartup?.plannedOutageRate ||
                            0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                crossValidation: {
                    optional: true,
                    maxExpression: 1,
                    minExpression: 0,
                },
                valueGetter: (params) =>
                    params.data?.generatorStartup?.plannedOutageRate,
                valueSetter: (params) => {
                    params.data.generatorStartup = {
                        ...params.data?.generatorStartup,
                        plannedOutageRate: params.newValue,
                    };
                    return params;
                },
            },
            {
                id: 'forcedOutageRate',
                field: 'generatorStartup.forcedOutageRate',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 2,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data.generatorStartup?.forcedOutageRate,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                crossValidation: {
                    optional: true,
                    maxExpression: 1,
                    minExpression: 0,
                },
                valueGetter: (params) =>
                    params.data?.generatorStartup?.forcedOutageRate,
                valueSetter: (params) => {
                    params.data.generatorStartup = {
                        ...params.data?.generatorStartup,
                        forcedOutageRate: params.newValue,
                    };
                    return params;
                },
            },
            {
                id: 'connected',
                field: 'terminalConnected',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulationTypeText',
                field: 'RegulationTypeText',
                ...defaultTextFilterConfig,
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: (params) =>
                    params.data.RegulationTypeText ??
                    (params.data?.regulatingTerminalVlId ||
                    params.data?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id),
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: () => {
                    return {
                        values: [
                            ...Object.values(REGULATION_TYPES).map(
                                (type) => type.id
                            ),
                        ],
                    };
                },
            },
            {
                id: 'RegulatingTerminalGenerator',
                field: 'RegulatingTerminalGenerator',
                ...defaultTextFilterConfig,
                valueGetter: RegulatingTerminalCellGetter,
                cellStyle: (params) =>
                    isEditableRegulatingTerminalCell(params)
                        ? editableCellStyle(params)
                        : {},
                editable: (params) => isEditableRegulatingTerminalCell(params),
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'RegulationTypeText',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
                },
                cellEditor: GeneratorRegulatingTerminalEditor,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: RegulatingTerminalCellGetter,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                cellEditorPopup: true,
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                changeCmd: "equipment.setName('{}')\n",
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'loadType',
                field: 'type',
                ...defaultTextFilterConfig,
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
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'p0',
                field: 'p0',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'q0',
                field: 'q0',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
                editable: isEditable,
                cellStyle: editableCellStyle,
                columnWidth: MIN_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'maximumSectionCount',
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
                        rowData: params.data,
                    };
                },
                ...defaultNumericFilterConfig,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 1,
                },
            },
            {
                id: 'sectionCount',
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
                        rowData: params.data,
                    };
                },
                ...defaultNumericFilterConfig,
                getQuickFilterText: excludeFromGlobalFilter,
                crossValidation: {
                    minExpression: 0,
                    maxExpression: 'maximumSectionCount',
                },
            },
            {
                id: 'Type',
                field: 'type',
                ...defaultTextFilterConfig,
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
                        rowData: params.data,
                    };
                },
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'maxSusceptance',
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
                        rowData: params.data,
                    };
                },
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 5,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'VoltageSetpointKV',
                field: 'voltageSetpoint',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSetpointMVAR',
                field: 'reactivePowerSetpoint',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
                editable: isEditable,
                cellStyle: editableCellStyle,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                normed: applyFluxConvention,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                                ?.activePowerControlOn != null
                                ? +params.data?.activePowerControl
                                      ?.activePowerControlOn
                                : '',
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
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
                id: 'reactivePowerSetpoint',
                field: 'targetQ',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                        rowData: params.data,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
                ...defaultTextFilterConfig,
            },
            {
                id: 'ConvertersMode',
                field: 'convertersMode',
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                ...defaultTextFilterConfig,
            },
            {
                id: 'ConverterStationId1',
                field: 'converterStationId1',
                columnWidth: LARGE_COLUMN_WIDTH,
                ...defaultTextFilterConfig,
            },
            {
                id: 'ConverterStationId2',
                field: 'converterStationId2',
                columnWidth: LARGE_COLUMN_WIDTH,
                ...defaultTextFilterConfig,
            },
            {
                id: 'R',
                field: 'r',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ActivePowerSetpoint',
                field: 'activePowerSetpoint',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'maxActivePower',
                field: 'maxP',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS1toCS2',
                field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'OprFromCS2toCS1',
                field: 'hvdcOperatorActivePowerRange.oprFromCS1toCS2',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'P0',
                field: 'hvdcAngleDroopActivePowerControl.p0',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PowerFactor',
                field: 'powerFactor',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'HvdcLineId',
                field: 'hvdcLineId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'LossFactor',
                field: 'lossFactor',
                numeric: true,
                ...defaultNumericFilterConfig,
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
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePowerSetpointMVAR',
                field: 'reactivePowerSetpoint',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Name',
                field: 'name',
                ...defaultTextFilterConfig,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'UcteXnodeCode',
                field: 'ucteXnodeCode',
                getQuickFilterText: excludeFromGlobalFilter,
                ...defaultTextFilterConfig,
            },
            {
                id: 'activePower',
                field: 'p',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'ReactivePower',
                field: 'q',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                canBeInvalidated: true,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'p0',
                field: 'p0',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'q0',
                field: 'q0',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'connected',
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
