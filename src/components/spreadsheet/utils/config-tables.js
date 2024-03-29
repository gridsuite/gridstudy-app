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
    BooleanListField,
    EnumListField,
    GeneratorRegulatingTerminalEditor,
    NumericalField,
    SelectCountryField,
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
import { getComputedRegulationMode } from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    computeHighTapPosition,
    getEnumLabelById,
    getTapChangerRegulationTerminalValue,
} from 'components/utils/utils';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from 'components/custom-aggrid/custom-aggrid-header.type';
import { NOMINAL_V } from '../../utils/field-constants';
import CountryCellRenderer from '../country-cell-render';
import EnumCellRenderer from '../enum-cell-renderer';

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

/**
 * Default configuration for an enum filter
 * a new filter option is added to the default ag-grid filter
 */
const defaultEnumFilterConfig = {
    filter: 'agTextColumnFilter',
    agGridFilterParams: {
        filterOptions: [
            {
                displayKey: 'customInRange',
                displayName: 'customInRange',
                predicate: ([filterValue], cellValue) => {
                    // We receive here the filter enum values as a string (filterValue)
                    return filterValue.includes(cellValue);
                },
            },
        ],
    },
    customFilterParams: {
        filterDataType: FILTER_DATA_TYPES.TEXT,
    },
    isEnum: true,
};

// This function is used to generate the default configuration for an enum filter
// It generates configuration for filtering, sorting and rendering
const getDefaultEnumConfig = (enumOptions) => ({
    ...defaultEnumFilterConfig,
    cellRenderer: EnumCellRenderer,
    cellRendererParams: {
        enumOptions: enumOptions,
    },
    getEnumLabel: (value) => getEnumLabelById(enumOptions, value),
});

const getDefaultEnumCellEditorParams = (params, defaultValue, enumOptions) => ({
    defaultValue: defaultValue,
    enumOptions: enumOptions,
    gridContext: params.context,
    gridApi: params.api,
    colDef: params.colDef,
});

const countryEnumFilterConfig = {
    ...defaultEnumFilterConfig,
    isCountry: true,
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

const getTwtRatioRegulationModeId = (twt) => {
    //regulationMode is set by the user (in edit mode)
    if (twt?.ratioTapChanger?.regulationMode !== undefined) {
        return twt.ratioTapChanger.regulationMode;
    }
    // if onLoadTapChangingCapabilities is set to false or undefined, we set the regulation mode to null
    if (!twt?.ratioTapChanger?.hasLoadTapChangingCapabilities) {
        return null;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(twt);
    return computedRegulationMode?.id || null;
};

const hasTwtRatioTapChanger = (params) => {
    const ratioTapChanger = params.data?.ratioTapChanger;
    return (
        ratioTapChanger !== null &&
        ratioTapChanger !== undefined &&
        Object.keys(ratioTapChanger).length > 0
    );
};

const isTwtRatioOnload = (params) => {
    const hasLoadTapChangingCapabilities =
        params.data?.ratioTapChanger?.hasLoadTapChangingCapabilities;
    return (
        hasLoadTapChangingCapabilities === true ||
        hasLoadTapChangingCapabilities === 1
    );
};

const isTwtRatioOnloadAndEditable = (params) => {
    return isEditable(params) && isTwtRatioOnload(params);
};

const hasTwtPhaseTapChanger = (params) => {
    const phaseTapChanger = params.data?.phaseTapChanger;
    return (
        phaseTapChanger !== null &&
        phaseTapChanger !== undefined &&
        Object.keys(phaseTapChanger).length > 0
    );
};

const hasTwtPhaseTapChangerAndEditable = (params) => {
    return isEditable(params) && hasTwtPhaseTapChanger(params);
};

const isEditableTwtPhaseRegulationSideCell = (params) => {
    return (
        isEditable(params) &&
        params.data?.phaseTapChanger?.regulationType ===
            REGULATION_TYPES.LOCAL.id
    );
};

const isEditableTwtRatioRegulationSideCell = (params) => {
    return (
        isTwtRatioOnloadAndEditable(params) &&
        params.data?.ratioTapChanger?.regulationType ===
            REGULATION_TYPES.LOCAL.id
    );
};

const isEditableTwtRatioRegulatingTerminalCell = (params) => {
    return (
        isTwtRatioOnloadAndEditable(params) &&
        params.data?.ratioTapChanger?.regulationType ===
            REGULATION_TYPES.DISTANT.id
    );
};

const isEditableTwtPhaseRegulatingTerminalCell = (params) => {
    return (
        isEditable(params) &&
        params.data?.phaseTapChanger?.regulationType ===
            REGULATION_TYPES.DISTANT.id
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
                field: 'country',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: SelectCountryField,
                cellRenderer: CountryCellRenderer,
                valueSetter: (params) => {
                    params.data.country = params?.newValue?.countryCode;
                    return params;
                },
                ...countryEnumFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: 'nominalV',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: NumericalField,
                cellEditorParams: (params) => {
                    return {
                        defaultValue: params.data.nominalV,
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                id: 'Country1',
                field: 'country1',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'Country2',
                field: 'country2',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
                id: 'RatedVoltageSide1',
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
                id: 'RatedVoltageSide2',
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
                id: 'HasLoadTapChangingCapabilities',
                field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
                valueGetter: (params) =>
                    params?.data?.ratioTapChanger
                        ?.hasLoadTapChangingCapabilities,
                cellRenderer: BooleanCellRenderer,
                editable: (params) =>
                    isEditable(params) && hasTwtRatioTapChanger(params),
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data.ratioTapChanger || {}),
                        hasLoadTapChangingCapabilities: params.newValue,
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
                                ?.hasLoadTapChangingCapabilities != null
                                ? +params.data?.ratioTapChanger
                                      ?.hasLoadTapChangingCapabilities
                                : '',
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                    };
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulationMode',
                field: 'ratioTapChanger.regulationMode',
                valueGetter: (params) =>
                    params.data?.ratioTapChanger?.regulationMode,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationMode: params.newValue,
                    };

                    return params;
                },
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.ratioTapChanger?.regulationMode,
                        Object.values(RATIO_REGULATION_MODES)
                    ),
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                editable: (params) => isTwtRatioOnloadAndEditable(params),
                cellStyle: editableCellStyle,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn:
                            'ratioTapChanger.hasLoadTapChangingCapabilities',
                        columnValue: 1,
                    },
                },
                ...getDefaultEnumConfig(Object.values(RATIO_REGULATION_MODES)),
            },
            {
                id: 'TargetVPoint',
                field: 'ratioTapChanger.targetV',
                ...defaultNumericFilterConfig,
                fractionDigits: 1,
                editable: (params) => isTwtRatioOnloadAndEditable(params),
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
                editable: (params) => isTwtRatioOnloadAndEditable(params),
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
                ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
                valueGetter: (params) =>
                    params.data?.ratioTapChanger?.regulationType,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationType: params.newValue,
                    };
                    return params;
                },
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.ratioTapChanger?.regulationType,
                        Object.values(REGULATION_TYPES)
                    ),
                columnWidth: MEDIUM_COLUMN_WIDTH,
                editable: (params) => isTwtRatioOnloadAndEditable(params),
                cellStyle: editableCellStyle,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulatedSide',
                field: 'ratioTapChanger.regulationSide',
                ...getDefaultEnumConfig(Object.values(SIDE)),
                valueGetter: (params) =>
                    params.data?.ratioTapChanger?.regulationSide,
                valueSetter: (params) => {
                    params.data.ratioTapChanger = {
                        ...(params.data?.ratioTapChanger || {}),
                        regulationSide: params.newValue,
                    };
                    return params;
                },
                editable: isEditableTwtRatioRegulationSideCell,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.ratioTapChanger?.regulationSide,
                        Object.values(SIDE)
                    ),
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.LOCAL.id,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RatioRegulatingTerminal',
                field: 'ratioTapChanger.ratioRegulatingTerminal',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    params.data?.ratioTapChanger?.ratioRegulatingTerminal,
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
                ...getDefaultEnumConfig(Object.values(PHASE_REGULATION_MODES)),
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
                editable: (params) => hasTwtPhaseTapChangerAndEditable(params),
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.phaseTapChanger?.regulationMode,
                        Object.values(PHASE_REGULATION_MODES)
                    ),
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
                    hasTwtPhaseTapChangerAndEditable(params) &&
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
                    hasTwtPhaseTapChangerAndEditable(params) &&
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
                ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
                valueGetter: (params) =>
                    params.data?.phaseTapChanger?.regulationType,
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationType: params.newValue,
                    };
                    return params;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                editable: (params) => hasTwtPhaseTapChangerAndEditable(params),
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.phaseTapChanger?.regulationType,
                        Object.values(REGULATION_TYPES)
                    ),
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseRegulatedSide',
                field: 'phaseTapChanger.regulationSide',
                ...getDefaultEnumConfig(Object.values(SIDE)),
                valueGetter: (params) =>
                    params.data?.phaseTapChanger?.regulationSide,
                valueSetter: (params) => {
                    params.data.phaseTapChanger = {
                        ...(params.data?.phaseTapChanger || {}),
                        regulationSide: params.newValue,
                    };
                    return params;
                },
                editable: isEditableTwtPhaseRegulationSideCell,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.phaseTapChanger?.regulationSide,
                        Object.values(SIDE)
                    ),
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.LOCAL.id,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'PhaseRegulatingTerminal',
                field: 'phaseTapChanger.phaseRegulatingTerminal',
                ...defaultTextFilterConfig,
                valueGetter: (params) =>
                    params.data?.phaseTapChanger?.phaseRegulatingTerminal,
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalVT3WSide1',
                field: 'nominalV1',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVT3WSide2',
                field: 'nominalV2',
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'NominalVT3WSide3',
                field: 'nominalV3',
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
                id: 'HasLoadTapChanging1Capabilities',
                field: 'hasLoadTapChanging1Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio1',
                field: 'isRegulatingRatio1',
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
                id: 'HasLoadTapChanging2Capabilities',
                field: 'hasLoadTapChanging2Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio2',
                field: 'isRegulatingRatio2',
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
                id: 'HasLoadTapChanging3Capabilities',
                field: 'hasLoadTapChanging3Capabilities',
                boolean: true,
                cellRenderer: BooleanCellRenderer,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingRatio3',
                field: 'isRegulatingRatio3',
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
                field: 'regulationModeName1',
                ...defaultEnumFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase1',
                field: 'isRegulatingPhase1',
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
                field: 'regulationModeName2',
                ...defaultEnumFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase2',
                field: 'isRegulatingPhase2',
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
                field: 'regulationModeName3',
                ...defaultEnumFilterConfig,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'RegulatingPhase3',
                field: 'isRegulatingPhase3',
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
                ...getDefaultEnumConfig(ENERGY_SOURCES),
                changeCmd: 'equipment.setEnergySource(EnergySource.{})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.energySource,
                        ENERGY_SOURCES
                    ),
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
                field: 'activePowerControl.participate',
                cellRenderer: BooleanCellRenderer,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                valueSetter: (params) => {
                    params.data.activePowerControl = {
                        ...(params.data.activePowerControl || {}),
                        participate: params.newValue,
                    };

                    return params;
                },
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.activePowerControl?.participate != null
                                ? +params.data?.activePowerControl?.participate
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
                        dependencyColumn: 'activePowerControl.participate',
                        columnValue: 1,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'minP',
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
                id: 'maxP',
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
                id: 'directTransX',
                field: 'generatorShortCircuit.directTransX',
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
                            params.data?.generatorShortCircuit?.directTransX ||
                            0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorShortCircuit?.directTransX,
                valueSetter: (params) => {
                    params.data.generatorShortCircuit = {
                        ...params.data.generatorShortCircuit,
                        directTransX: params.newValue,
                    };
                    return params;
                },
                crossValidation: {
                    optional: true,
                },
            },
            {
                id: 'stepUpTransformerX',
                field: 'generatorShortCircuit.stepUpTransformerX',
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
                                ?.stepUpTransformerX || 0,
                        gridContext: params.context,
                        gridApi: params.api,
                        colDef: params.colDef,
                        rowData: params.data,
                    };
                },
                valueGetter: (params) =>
                    params.data?.generatorShortCircuit?.stepUpTransformerX,
                valueSetter: (params) => {
                    params.data.generatorShortCircuit = {
                        ...params.data.generatorShortCircuit,
                        stepUpTransformerX: params.newValue,
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
                ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.RegulationTypeText,
                        Object.values(REGULATION_TYPES)
                    ),
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                ...getDefaultEnumConfig([
                    ...LOAD_TYPES,
                    { id: 'UNDEFINED', label: 'Undefined' },
                ]),
                changeCmd: 'equipment.setLoadType(LoadType.{})\n',
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(params, params.data?.type, [
                        ...LOAD_TYPES,
                        { id: 'UNDEFINED', label: 'Undefined' },
                    ]),
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
                ...getDefaultEnumConfig(Object.values(SHUNT_COMPENSATOR_TYPES)),
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: EnumListField,
                cellEditorParams: (params) =>
                    getDefaultEnumCellEditorParams(
                        params,
                        params.data?.type,
                        Object.values(SHUNT_COMPENSATOR_TYPES)
                    ),
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
                id: 'voltageSetpoint',
                field: 'targetV',
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: NOMINAL_V,
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
                field: 'activePowerControl.participate',
                cellRenderer: BooleanCellRenderer,
                editable: isEditable,
                cellStyle: editableCellStyle,
                cellEditor: BooleanListField,
                valueSetter: (params) => {
                    params.data.activePowerControl = {
                        ...(params.data.activePowerControl || {}),
                        participate: params.newValue,
                    };

                    return params;
                },
                cellEditorParams: (params) => {
                    return {
                        defaultValue:
                            params.data?.activePowerControl?.participate != null
                                ? +params.data?.activePowerControl?.participate
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
                        dependencyColumn: 'activePowerControl.participate',
                        columnValue: 1,
                    },
                },
                getQuickFilterText: excludeFromGlobalFilter,
            },
            {
                id: 'minP',
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
                id: 'maxP',
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
            {
                id: 'Properties',
                field: 'properties',
                editable: isEditable,
                cellStyle: editableCellStyle,
                valueGetter: propertiesGetter,
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
                id: 'ConvertersMode',
                field: 'convertersMode',
                columnWidth: LARGE_COLUMN_WIDTH,
                getQuickFilterText: excludeFromGlobalFilter,
                ...defaultEnumFilterConfig,
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
                id: 'Country1',
                field: 'country1',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'Country2',
                field: 'country2',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
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
                field: 'hvdcOperatorActivePowerRange.oprFromCS2toCS1',
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: 'nominalV',
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: 'nominalV',
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: NOMINAL_V,
                numeric: true,
                ...defaultNumericFilterConfig,
                fractionDigits: 0,
            },
            {
                id: 'PairingKey',
                field: 'pairingKey',
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
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
            },
        ],
    },
    BUSES: {
        index: 14,
        name: 'Buses',
        type: EQUIPMENT_TYPES.BUS,
        fetchers: EQUIPMENT_FETCHERS.BUS,
        columns: [
            {
                id: 'ID',
                field: 'id',
                isDefaultSort: true,
                ...defaultTextFilterConfig,
            },
            {
                id: 'Magnitude',
                field: 'v',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                ...defaultNumericFilterConfig,
            },
            {
                id: 'Angle',
                field: 'angle',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                ...defaultNumericFilterConfig,
            },
            {
                id: 'ConnectedComponent',
                field: 'connectedComponentNum',
                ...defaultNumericFilterConfig,
            },
            {
                id: 'SynchronousComponent',
                field: 'synchronousComponentNum',
                ...defaultNumericFilterConfig,
            },
            {
                id: 'VoltageLevelId',
                field: 'voltageLevelId',
                ...defaultTextFilterConfig,
            },
            {
                id: 'Country',
                field: 'country',
                ...countryEnumFilterConfig,
                cellRenderer: CountryCellRenderer,
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                filter: 'agNumberColumnFilter',
                fractionDigits: 0,
                ...defaultNumericFilterConfig,
            },
            {
                id: 'Properties',
                field: 'properties',
                valueGetter: propertiesGetter,
                cellRenderer: PropertiesCellRenderer,
                minWidth: 300,
                getQuickFilterText: excludeFromGlobalFilter,
                valueSetter: (params) => {
                    params.data.properties = params.newValue;
                    return params;
                },
                ...defaultTextFilterConfig,
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
