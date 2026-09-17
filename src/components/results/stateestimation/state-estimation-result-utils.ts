/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef, GridApi } from 'ag-grid-community';
import { CustomAggridComparatorFilter, makeAgGridCustomHeaderColumn, TableType } from '@gridsuite/commons-ui';
import { createEnumColumn } from '../common/column-filter/utilis';
import {
    MeasurementInformationResult,
    MeasurementInformationResultDto,
    MeasurementType,
    OutofBound,
    QualityCriterionResult,
    ValidityType,
} from './state-estimation-result.type';
import {
    ColumnContext,
    numericFilterParams,
    SortConfig,
    SortParams,
    textFilterParams,
} from '../../../types/custom-aggrid-types';
import {
    STATEESTIMATION_MEASUREMENTS,
    STATEESTIMATION_RESULT_SORT_STORE,
} from '../../../utils/store-sort-filter-fields';

export const MEASUREMENT_RESULTS_TABLE = 'measurementResults';
export const QUALITY_CRITERION_RESULTS_TABLE = 'qualityCriterionResults';
export const QUALITY_PER_REGION_RESULTS_TABLE = 'qualityPerRegionResults';

export const applyStateEstimationSort = async (api: GridApi, sort: SortConfig): Promise<void> => {
    api.applyColumnState({
        state: [{ colId: sort.colId, sort: sort.sort }],
        defaultState: { sort: null },
    });
};

interface TableParams {
    sortParams: SortParams;
    filterParams: {
        type: TableType;
        tab: string;
    };
}

const createTableParams = (sortTab: string, filterTab: string): TableParams => ({
    sortParams: {
        table: STATEESTIMATION_RESULT_SORT_STORE,
        tab: sortTab,
        persistSort: applyStateEstimationSort,
    },
    filterParams: {
        type: TableType.StateEstimation,
        tab: filterTab,
    },
});

const createColumnContext = (
    sortParams: ColumnContext['sortParams'],
    filterParams: TableParams['filterParams'],
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

export const stateEstimationMeasurementColumnsDefinition = (intl: IntlShape): ColDef[] => {
    const { sortParams, filterParams } = createTableParams(STATEESTIMATION_MEASUREMENTS, MEASUREMENT_RESULTS_TABLE);

    const getEnumLabel = (value: string) => (value ? intl.formatMessage({ id: value, defaultMessage: value }) : '');

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Equipment' }),
            colId: 'equipmentId',
            field: 'equipmentId',
            context: createColumnContext(sortParams, filterParams, textFilterParams),
        }),
        createEnumColumn(
            'measurementType',
            'MeasurementType',
            Object.values(MeasurementType),
            getEnumLabel,
            intl,
            sortParams,
            filterParams
        ),
        createEnumColumn(
            'validityType',
            'ValidityType',
            Object.values(ValidityType),
            getEnumLabel,
            intl,
            sortParams,
            filterParams
        ),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            colId: 'value',
            field: 'value',
            context: createColumnContext(sortParams, filterParams, numericFilterParams, true, 2),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'EstimatedValue' }),
            colId: 'estimatedValue',
            field: 'estimatedValue',
            context: createColumnContext(sortParams, filterParams, numericFilterParams, true, 2),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'DifferenceValue' }),
            colId: 'differenceValue',
            field: 'differenceValue',
            context: createColumnContext(sortParams, filterParams, numericFilterParams, true, 2),
        }),
        createEnumColumn(
            'outOfBound',
            'OutOfBound',
            Object.values(OutofBound),
            getEnumLabel,
            intl,
            sortParams,
            filterParams
        ),
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
    measurementInformationResults: MeasurementInformationResultDto[]
): MeasurementInformationResult[] {
    return measurementInformationResults.map((measurementInformationResult: MeasurementInformationResultDto) => {
        return {
            equipmentId: measurementInformationResult.equipmentId,
            measurementType: measurementInformationResult.measurementType as MeasurementType,
            validityType: measurementInformationResult.validityType as ValidityType,
            value: measurementInformationResult.value,
            estimatedValue: measurementInformationResult.estimatedValue,
            differenceValue: measurementInformationResult.differenceValue,
            outOfBound: measurementInformationResult.outOfBound ? OutofBound.OUT_OF_BOUNDS : OutofBound.IN_BOUNDS,
        };
    });
}
