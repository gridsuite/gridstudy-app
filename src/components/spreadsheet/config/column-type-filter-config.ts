/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ICellRendererParams } from 'ag-grid-community';
import { FILTER_NUMBER_COMPARATORS, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { BooleanCellRenderer, DefaultSpreadsheetCellRenderer, PropertiesCellRenderer } from '../utils/cell-renderers';
import { EnumOption } from 'components/utils/utils-type';
import { computeHighTapPosition, getEnumLabelById } from 'components/utils/utils';
import { Writable } from 'type-fest';
import RunningStatus from 'components/utils/running-status';
import {
    ENERGY_SOURCES,
    LOAD_TYPES,
    PHASE_REGULATION_MODES,
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SHUNT_COMPENSATOR_TYPES,
    SIDE,
} from 'components/network/constants';
import { unitToKiloUnit, unitToMicroUnit } from 'utils/unit-converter';
import { RegulatingTerminalCellGetter } from './equipment/generator';

const TEXT_FILTER_PARAMS = {
    caseSensitive: false,
    maxNumConditions: 1,
    filterOptions: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
    debounceMs: 200,
};

const NUMERIC_FILTER_PARAMS = {
    maxNumConditions: 1,
    filterOptions: Object.values(FILTER_NUMBER_COMPARATORS),
    debounceMs: 200,
};

const formatCellValue = (value: any, decimalPlaces: number = 1) => {
    if (value != null) {
        return parseFloat(value.toFixed(decimalPlaces));
    }

    return null;
};

const propertiesGetter = (params: ICellRendererParams) => {
    const properties = params?.data?.properties;
    if (properties && Object.keys(properties).length) {
        return Object.keys(properties)
            .map((property) => `${property} : ${properties[property]}`)
            .join(' | ');
    } else {
        return null;
    }
};

const createTextColumnType = (cellRenderer: any, valueGetter?: (params: ICellRendererParams) => any) => ({
    filter: 'agTextColumnFilter',
    filterParams: TEXT_FILTER_PARAMS,
    cellRenderer,
    valueGetter,
    sortable: true,
    resizable: true,
});

const createNumericColumnType = (valueGetter: (params: ICellRendererParams) => any) => ({
    filter: 'agNumberColumnFilter',
    filterParams: NUMERIC_FILTER_PARAMS,
    cellRenderer: DefaultSpreadsheetCellRenderer,
    valueGetter,
    sortable: true,
    resizable: true,
});

const createEnumConfig = (enumOptions: Readonly<EnumOption[]>) => {
    return {
        filter: 'agTextColumnFilter',
        filterParams: {
            caseSensitive: false,
            maxNumConditions: 1,
            filterOptions: [FILTER_TEXT_COMPARATORS.CONTAINS],
            debounceMs: 200,
        },

        valueGetter: (params: any) => {
            const value = params.data[params?.colDef?.field!];
            return value
                ? params.context.intl.formatMessage({
                      id: getEnumLabelById(enumOptions as Writable<typeof enumOptions>, value),
                  })
                : value;
        },
    };
};

const textType = createTextColumnType(DefaultSpreadsheetCellRenderer);
const propertyType = createTextColumnType(PropertiesCellRenderer, propertiesGetter);

const getNumericType = (fractionDigits?: number) =>
    createNumericColumnType((params) => {
        let value = params.data[params?.colDef?.field!];
        if (params?.colDef?.field === 'coordinatedReactiveControl.qPercent') {
            value = isNaN(value) ? 0 : value;
        }
        if (params?.colDef?.field === 'generatorShortCircuit.directTransX') {
            value = value || 0;
        }
        if (params?.colDef?.field === 'RegulatingTerminalGenerator') {
            return RegulatingTerminalCellGetter;
        }
        return fractionDigits ? formatCellValue(value, fractionDigits) : value;
    });

const numericType = getNumericType();
const numeric0FractionDigitsType = getNumericType(0);
const numeric1FractionDigitsType = getNumericType(1);
const numeric2FractionDigitsType = getNumericType(2);
const numeric5FractionDigitsType = getNumericType(5);

const createNumericUnitConversionType = (conversionFunction: (value: any) => any) =>
    createNumericColumnType((params) => conversionFunction(params.data[params?.colDef?.field!]));

const numericUnitToMicroUnitType = createNumericUnitConversionType(unitToMicroUnit);
const numericUnitToKiloUnitType = createNumericUnitConversionType(unitToKiloUnit);

const numericHighTapPositionType = createNumericColumnType((params) =>
    computeHighTapPosition(params.data[params?.colDef?.field!]?.steps)
);
const numericSwitchedOnSusceptanceType = createNumericColumnType((params) => {
    return formatCellValue(
        (params?.data?.maxSusceptance / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
        5
    );
});

const numericSwitchedOnQAtNominalVType = createNumericColumnType((params) => {
    return formatCellValue(
        (params?.data?.maxQAtNominalV / params?.data?.maximumSectionCount) * params?.data?.sectionCount,
        5
    );
});

const getNumericApplyFluxConventionType = (fractionDigits?: number) =>
    createNumericColumnType((params) => {
        const value = params.context.applyFluxConvention(params.data[params?.colDef?.field!]);
        return formatCellValue(value, fractionDigits);
    });

const numericApplyFluxConventionType = getNumericApplyFluxConventionType(0);
const numericApplyFluxConvention1FractionDigitsType = getNumericApplyFluxConventionType(1);
const numericApplyFluxConvention2FractionDigitsType = getNumericApplyFluxConventionType(2);
const numericApplyFluxConvention5FractionDigitsType = getNumericApplyFluxConventionType(5);

const numericCanBeInvalidatedType = {
    cellRendererSelector: (params: ICellRendererParams) => ({
        component: DefaultSpreadsheetCellRenderer,
        params: {
            isValueInvalid: params.context.loadFlowStatus !== RunningStatus.SUCCEED,
        },
    }),
};

const booleanType = createTextColumnType(BooleanCellRenderer);

const countryType = createTextColumnType(DefaultSpreadsheetCellRenderer, (params: ICellRendererParams) => {
    if (params.context?.translateCountryCode && params?.colDef?.field) {
        return params.context.translateCountryCode(params.data[params.colDef.field]);
    }
});

const energySourceEnumType = createEnumConfig(ENERGY_SOURCES);
const regulationEnumType = createEnumConfig(Object.values(REGULATION_TYPES));
const loadEnumType = createEnumConfig([...LOAD_TYPES, { id: 'UNDEFINED', label: 'Undefined' }]);
const shuntCompensatorEnumType = createEnumConfig(Object.values(SHUNT_COMPENSATOR_TYPES));
const ratioRegulationModesEnumType = createEnumConfig(Object.values(RATIO_REGULATION_MODES));
const sideEnumType = createEnumConfig(Object.values(SIDE));
const phaseRegulatingModeEnumType = createEnumConfig(Object.values(PHASE_REGULATION_MODES));

export const defaultColumnType = {
    textType,
    propertyType,
    numericType,
    numeric0FractionDigitsType,
    numeric1FractionDigitsType,
    numeric2FractionDigitsType,
    numeric5FractionDigitsType,
    numericUnitToMicroUnitType,
    numericUnitToKiloUnitType,
    numericHighTapPositionType,
    numericCanBeInvalidatedType,
    numericApplyFluxConventionType,
    numericApplyFluxConvention1FractionDigitsType,
    numericApplyFluxConvention2FractionDigitsType,
    numericApplyFluxConvention5FractionDigitsType,
    booleanType,
    countryType,
    energySourceEnumType,
    regulationEnumType,
    loadEnumType,
    shuntCompensatorEnumType,
    ratioRegulationModesEnumType,
    sideEnumType,
    phaseRegulatingModeEnumType,
    numericSwitchedOnSusceptanceType,
    numericSwitchedOnQAtNominalVType,
};
