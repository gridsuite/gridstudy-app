/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import {
    BooleanCellRenderer,
    CustomAggridComparatorFilter,
    makeAgGridCustomHeaderColumn,
    SortParams,
    TableType,
} from '@gridsuite/commons-ui';
import { createEnumColumn } from '../common/column-filter/utilis';
import { FILTER_DATA_TYPES, numericFilterParams, textFilterParams } from '../../../types/custom-aggrid-types';
import { CustomAggridBooleanFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { booleanFilterParams } from '../../custom-aggrid/custom-aggrid-filters/boolean-filter-params';
import {
    LOGICAL_CONTROLS_BALANCES,
    LOGICAL_CONTROLS_NON_ZERO_MEASUREMENTS_ON_DISCONNECTED,
    LOGICAL_CONTROLS_ORIGIN_EXTREMITY_DEVIATIONS,
    LOGICAL_CONTROLS_OUT_OF_BOUNDS_MEASUREMENTS,
    LOGICAL_CONTROLS_RESULT_SORT_STORE,
    LOGICAL_CONTROLS_VOLTAGE_DEVIATIONS,
    LOGICAL_CONTROLS_ZERO_MEASUREMENTS_ON_CONNECTED,
} from '../../../utils/store-sort-filter-fields';
import { SubjectIdRendererType } from '../securityanalysis/security-analysis.type';
import { LimitType, LogicalControlsResultRow, MeasurementType, StatusType } from './logical-controls-result.type';

interface TableParams {
    sortParams: SortParams;
    filterParams: {
        type: TableType;
        tab: string;
    };
}

const createTableParams = (tabName: string): TableParams => ({
    sortParams: {
        table: LOGICAL_CONTROLS_RESULT_SORT_STORE,
        tab: tabName,
    },
    filterParams: {
        type: TableType.LogicalControls,
        tab: tabName,
    },
});

const createColumnContext = (
    { sortParams, filterParams }: TableParams,
    filterDefinition: typeof textFilterParams | typeof numericFilterParams,
    numeric = false,
    fractionDigits?: number
) => ({
    ...(numeric ? { numeric: true, fractionDigits } : {}),
    sortParams,
    filterComponent: CustomAggridComparatorFilter,
    filterComponentParams: {
        filterParams: {
            ...filterDefinition,
            ...filterParams,
        },
    },
});

const makeTextColumn = (intl: IntlShape, tableParams: TableParams, headerId: string, field: string): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: headerId }),
        colId: field,
        field,
        context: createColumnContext(tableParams, textFilterParams),
    });

const makeNumericColumn = (
    intl: IntlShape,
    tableParams: TableParams,
    headerId: string,
    field: string,
    fractionDigits?: number
): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: headerId }),
        colId: field,
        field,
        context: createColumnContext(tableParams, numericFilterParams, true, fractionDigits),
    });

// Enum values are translated with a '<labelPrefix>.<value>' message id
const makeEnumColumn = (
    intl: IntlShape,
    { sortParams, filterParams }: TableParams,
    headerId: string,
    field: string,
    options: string[],
    labelPrefix: string
): ColDef =>
    createEnumColumn(
        field,
        headerId,
        options,
        (value: string) => (value ? intl.formatMessage({ id: `${labelPrefix}.${value}` }) : ''),
        intl,
        sortParams,
        filterParams
    );

const makeBooleanColumn = (
    intl: IntlShape,
    { sortParams, filterParams }: TableParams,
    headerId: string,
    field: string
): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: headerId }),
        colId: field,
        field,
        filterParams: booleanFilterParams,
        context: {
            sortParams,
            filterComponent: CustomAggridBooleanFilter,
            filterComponentParams: {
                filterParams: {
                    dataType: FILTER_DATA_TYPES.BOOLEAN,
                    ...filterParams,
                },
            },
        },
        cellRenderer: BooleanCellRenderer,
    });

// Convert a record to rows, including its key as the equipment identifier.
export const flattenRecord = <T extends object>(record?: Record<string, T>): LogicalControlsResultRow<T>[] =>
    record ? Object.entries(record).map(([equipmentIdentifier, props]) => ({ equipmentIdentifier, ...props })) : [];

// Flatten records of arrays while preserving the equipment identifier on each row.
export const flattenRecordOfArrays = <T extends object>(record?: Record<string, T[]>): LogicalControlsResultRow<T>[] =>
    record
        ? Object.entries(record).flatMap(([equipmentIdentifier, props]) =>
              props.map((value) => ({ equipmentIdentifier, ...value }))
          )
        : [];

const makeBusIdentifierColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeTextColumn(intl, tableParams, 'BusIdentifier', 'equipmentIdentifier');

const makeEquipmentIdentifierColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeTextColumn(intl, tableParams, 'EquipmentIdentifier', 'equipmentIdentifier');

const makeVoltageLevelNameColumn = (
    intl: IntlShape,
    tableParams: TableParams,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef => ({
    ...makeTextColumn(intl, tableParams, 'VoltageLevelName', 'voltageLevelName'),
    cellRenderer: voltageLevelRenderer,
});

const makeNominalVoltageColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeNumericColumn(intl, tableParams, 'NominalVoltage', 'nominalVoltage', 0);

const makeMeasurementTypeColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeEnumColumn(
        intl,
        tableParams,
        'MeasurementType',
        'measurementType',
        Object.values(MeasurementType),
        'MeasurementType'
    );

const makeValueColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeNumericColumn(intl, tableParams, 'Value', 'value');

const makeDeviationColumn = (intl: IntlShape, tableParams: TableParams): ColDef =>
    makeNumericColumn(intl, tableParams, 'Deviation', 'deviation');

export const logicalControlsBalancesColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_BALANCES);
    return [
        makeBusIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeNumericColumn(intl, tableParams, 'ActiveBalance', 'activeBalance'),
        makeNumericColumn(intl, tableParams, 'ReactiveBalance', 'reactiveBalance'),
        makeBooleanColumn(intl, tableParams, 'ActiveValidity', 'activeValidity'),
        makeBooleanColumn(intl, tableParams, 'ReactiveValidity', 'reactiveValidity'),
    ];
};

export const logicalControlsInvalidMeasurementsColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_NON_ZERO_MEASUREMENTS_ON_DISCONNECTED);
    return [
        makeEquipmentIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeMeasurementTypeColumn(intl, tableParams),
        makeEnumColumn(intl, tableParams, 'StatusType', 'statusType', Object.values(StatusType), 'StatusType'),
        makeValueColumn(intl, tableParams),
    ];
};

export const logicalControlsNullMeasurementsColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_ZERO_MEASUREMENTS_ON_CONNECTED);
    return [
        makeEquipmentIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeMeasurementTypeColumn(intl, tableParams),
    ];
};

export const logicalControlsOriginExtremityDeviationsColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_ORIGIN_EXTREMITY_DEVIATIONS);
    return [
        makeEquipmentIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeMeasurementTypeColumn(intl, tableParams),
        makeNumericColumn(intl, tableParams, 'OriginMeasurement', 'originMeasurement'),
        makeNumericColumn(intl, tableParams, 'ExtremityMeasurement', 'extremityMeasurement'),
        makeDeviationColumn(intl, tableParams),
    ];
};

export const logicalControlsOutOfBoundsMeasurementsColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_OUT_OF_BOUNDS_MEASUREMENTS);
    return [
        makeEquipmentIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeEnumColumn(intl, tableParams, 'ThresholdType', 'limitType', Object.values(LimitType), 'LimitType'),
        makeNumericColumn(intl, tableParams, 'Threshold', 'threshold'),
        makeValueColumn(intl, tableParams),
        makeDeviationColumn(intl, tableParams),
    ];
};

export const logicalControlsVoltageDeviationsColumnsDefinition = (
    intl: IntlShape,
    voltageLevelRenderer: SubjectIdRendererType
): ColDef[] => {
    const tableParams = createTableParams(LOGICAL_CONTROLS_VOLTAGE_DEVIATIONS);
    return [
        makeBusIdentifierColumn(intl, tableParams),
        makeVoltageLevelNameColumn(intl, tableParams, voltageLevelRenderer),
        makeNominalVoltageColumn(intl, tableParams),
        makeTextColumn(intl, tableParams, 'MinBusbarSection', 'minBusbarSection'),
        makeNumericColumn(intl, tableParams, 'MinBusbarSectionValue', 'minBusbarSectionValue'),
        makeTextColumn(intl, tableParams, 'MaxBusbarSection', 'maxBusbarSection'),
        makeNumericColumn(intl, tableParams, 'MaxBusbarSectionValue', 'maxBusbarSectionValue'),
        makeDeviationColumn(intl, tableParams),
    ];
};
