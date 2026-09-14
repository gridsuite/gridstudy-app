/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from '@gridsuite/commons-ui';

export const flattenRecordOfArrays = <T>(record?: Record<string, T[]>): T[] =>
    record ? Object.values(record).flat() : [];

export const flattenRecordWithKey = <T extends object>(record?: Record<string, T>): (T & { busId: string })[] =>
    record ? Object.entries(record).map(([busId, value]) => ({ busId, ...value })) : [];

export const logicalControlsBalancesColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'BusId' }),
        colId: 'busId',
        field: 'busId',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: { numeric: true, fractionDigits: 1 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ActiveBalance' }),
        colId: 'activeBalance',
        field: 'activeBalance',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ReactiveBalance' }),
        colId: 'reactiveBalance',
        field: 'reactiveBalance',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ActiveValidity' }),
        colId: 'activeValidity',
        field: 'activeValidity',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ReactiveValidity' }),
        colId: 'reactiveValidity',
        field: 'reactiveValidity',
    }),
];

export const logicalControlsInvalidMeasurementsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MeasurementType' }),
        colId: 'measurementType',
        field: 'measurementType',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Value' }),
        colId: 'value',
        field: 'value',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: { numeric: true, fractionDigits: 1 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'StatusType' }),
        colId: 'statusType',
        field: 'statusType',
    }),
];

export const logicalControlsOriginExtremityDeviationsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MeasurementType' }),
        colId: 'measurementType',
        field: 'measurementType',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'OriginMeasurement' }),
        colId: 'originMeasurement',
        field: 'originMeasurement',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'ExtremityMeasurement' }),
        colId: 'extremityMeasurement',
        field: 'extremityMeasurement',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Deviation' }),
        colId: 'deviation',
        field: 'deviation',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: { numeric: true, fractionDigits: 1 },
    }),
];

export const logicalControlsOutOfBoundsMeasurementsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'LimitType' }),
        colId: 'limitType',
        field: 'limitType',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Threshold' }),
        colId: 'threshold',
        field: 'threshold',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Value' }),
        colId: 'value',
        field: 'value',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Deviation' }),
        colId: 'deviation',
        field: 'deviation',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: { numeric: true, fractionDigits: 1 },
    }),
];

export const logicalControlsVoltageDeviationsColumnsDefinition = (intl: IntlShape): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'BusId' }),
        colId: 'busId',
        field: 'busId',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MinBusbarSection' }),
        colId: 'minBusbarSection',
        field: 'minBusbarSection',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'MinBusbarSectionValue' }),
        colId: 'minBusbarSectionValue',
        field: 'minBusbarSectionValue',
        context: { numeric: true, fractionDigits: 2 },
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
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Deviation' }),
        colId: 'deviation',
        field: 'deviation',
        context: { numeric: true, fractionDigits: 2 },
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'VoltageLevelName' }),
        colId: 'voltageLevelName',
        field: 'voltageLevelName',
    }),
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'NominalVoltage' }),
        colId: 'nominalVoltage',
        field: 'nominalVoltage',
        context: { numeric: true, fractionDigits: 1 },
    }),
];
