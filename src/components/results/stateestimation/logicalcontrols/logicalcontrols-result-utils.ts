/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, makeAgGridCustomHeaderColumn } from '@gridsuite/commons-ui';

// convert a Records array as values array, including the Record index (equipmentIdentifier)
export const flattenRecord = <T extends object>(record?: Record<string, T>): (T & { equipmentIdentifier: string })[] =>
    record ? Object.entries(record).map(([equipmentIdentifier, props]) => ({ equipmentIdentifier, ...props })) : [];

// same for array version
export const flattenRecordOfArrays = <T extends object>(
    record?: Record<string, T[]>
): (T & { equipmentIdentifier: string })[] =>
    record
        ? Object.entries(record).flatMap(([equipmentIdentifier, props]) =>
              props.map((value) => ({ equipmentIdentifier, ...value }))
          )
        : [];

const makeBusIdentifierColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'BusIdentifier' }),
        colId: 'equipmentIdentifier',
        field: 'equipmentIdentifier',
    });

const makeEquipmentIdentifierColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'EquipmentIdentifier' }),
        colId: 'equipmentIdentifier',
        field: 'equipmentIdentifier',
    });

const makeVoltageLevelNameColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    });

const makeNominalVoltageColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: {
            numeric: true,
            fractionDigits: 0,
        },
    });

const makeMeasurementTypeColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MeasurementType' }),
        colId: 'measurementType',
        field: 'measurementType',
        valueGetter: (params: ValueGetterParams) =>
            params.data?.measurementType
                ? intl.formatMessage({ id: `MeasurementType.${params.data.measurementType}` })
                : '',
    });

const makeValueColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Value' }),
        colId: 'value',
        field: 'value',
        context: { numeric: true },
    });

const makeDeviationColumn = (intl: IntlShape): ColDef =>
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Deviation' }),
        colId: 'deviation',
        field: 'deviation',
        context: { numeric: true },
    });

export const logicalControlsBalancesColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeBusIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ActiveBalance' }),
        colId: 'activeBalance',
        field: 'activeBalance',
        context: { numeric: true },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ReactiveBalance' }),
        colId: 'reactiveBalance',
        field: 'reactiveBalance',
        context: { numeric: true },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ActiveValidity' }),
        colId: 'activeValidity',
        field: 'activeValidity',
        cellRenderer: BooleanCellRenderer,
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ReactiveValidity' }),
        colId: 'reactiveValidity',
        field: 'reactiveValidity',
        cellRenderer: BooleanCellRenderer,
    }),
];

export const logicalControlsInvalidMeasurementsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeEquipmentIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeMeasurementTypeColumn(intl),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'StatusType' }),
        colId: 'statusType',
        field: 'statusType',
        valueGetter: (params: ValueGetterParams) =>
            params.data?.statusType ? intl.formatMessage({ id: `StatusType.${params.data.statusType}` }) : '',
    }),
    makeValueColumn(intl),
];

export const logicalControlsNullMeasurementsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeEquipmentIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeMeasurementTypeColumn(intl),
];

export const logicalControlsOriginExtremityDeviationsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeEquipmentIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeMeasurementTypeColumn(intl),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'OriginMeasurement' }),
        colId: 'originMeasurement',
        field: 'originMeasurement',
        context: { numeric: true },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ExtremityMeasurement' }),
        colId: 'extremityMeasurement',
        field: 'extremityMeasurement',
        context: { numeric: true },
    }),
    makeDeviationColumn(intl),
];

export const logicalControlsOutOfBoundsMeasurementsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeEquipmentIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ThresholdType' }),
        colId: 'limitType',
        field: 'limitType',
        valueGetter: (params: ValueGetterParams) =>
            params.data?.limitType ? intl.formatMessage({ id: `LimitType.${params.data.limitType}` }) : '',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Threshold' }),
        colId: 'threshold',
        field: 'threshold',
        context: { numeric: true },
    }),
    makeValueColumn(intl),
    makeDeviationColumn(intl),
];

export const logicalControlsVoltageDeviationsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeBusIdentifierColumn(intl),
    makeVoltageLevelNameColumn(intl),
    makeNominalVoltageColumn(intl),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MinBusbarSection' }),
        colId: 'minBusbarSection',
        field: 'minBusbarSection',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MinBusbarSectionValue' }),
        colId: 'minBusbarSectionValue',
        field: 'minBusbarSectionValue',
        context: { numeric: true },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MaxBusbarSection' }),
        colId: 'maxBusbarSection',
        field: 'maxBusbarSection',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MaxBusbarSectionValue' }),
        colId: 'maxBusbarSectionValue',
        field: 'maxBusbarSectionValue',
        context: { numeric: true },
    }),
    makeDeviationColumn(intl),
];
