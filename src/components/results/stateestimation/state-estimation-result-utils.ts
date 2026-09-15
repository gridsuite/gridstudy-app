/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from '@gridsuite/commons-ui';
import { MeasurementInformationResult, QualityCriterionResult } from './state-estimation-result.type';

export const MEASUREMENT_RESULTS_TABLE = 'measurementResults';
export const QUALITY_CRITERION_RESULTS_TABLE = 'qualityCriterionResults';
export const QUALITY_PER_REGION_RESULTS_TABLE = 'qualityPerRegionResults';

export const stateEstimationMeasurementColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'equipmentId' }),
            colId: 'equipmentId',
            field: 'equipmentId',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'MeasurementType' }),
            colId: 'measurementType',
            field: 'measurementType',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ValidityType' }),
            colId: 'validityType',
            field: 'validityType',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'EstimatedValue' }),
            colId: 'estimatedValue',
            field: 'estimatedValue',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'DifferenceValue' }),
            colId: 'differenceValue',
            field: 'differenceValue',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OutOfBound' }),
            colId: 'outOfBound',
            field: 'outOfBound',
        }),
    ];
};

export const stateEstimationQualityCriterionColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CriterionType' }),
            colId: 'type',
            field: 'type',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Validity' }),
            colId: 'validity',
            field: 'validity',
            context: {
                numeric: true,
                fractionDigits: 0,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Threshold' }),
            colId: 'threshold',
            field: 'threshold',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
    ];
};

export const stateEstimationQualityPerRegionColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityRegion' }),
            colId: 'name',
            field: 'name',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityLevel' }),
            colId: 'level',
            field: 'level',
            context: {
                numeric: true,
                fractionDigits: 0,
            },
        }),
    ];
};

export function mapQualityCriterionResults(
    qualityCriterionResults: QualityCriterionResult[],
    intl: IntlShape
): QualityCriterionResult[] {
    return qualityCriterionResults.map((qCrit: QualityCriterionResult) => {
        return {
            type: intl.formatMessage({ id: qCrit.type }),
            validity: qCrit.validity,
            value: qCrit.value,
            threshold: qCrit.threshold,
        };
    });
}

export function mapMeasurementResults(
    measurementInformationResults: MeasurementInformationResult[],
    intl: IntlShape
): MeasurementInformationResult[] {
    return measurementInformationResults.map((measurementInformationResult: MeasurementInformationResult) => {
        return {
            equipmentId: measurementInformationResult.equipmentId,
            measurementType: intl.formatMessage({ id: measurementInformationResult.measurementType }),
            validityType: intl.formatMessage({ id: measurementInformationResult.validityType }),
            value: measurementInformationResult.value,
            estimatedValue: measurementInformationResult.estimatedValue,
            differenceValue: measurementInformationResult.estimatedValue - measurementInformationResult.value,
            outOfBound: measurementInformationResult.outOfBound,
        };
    });
}
