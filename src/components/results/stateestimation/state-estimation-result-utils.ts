/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
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
import {
    MeasurementInformationResult,
    MeasurementInformationResultDto,
    MeasurementType,
    QualityCriterionResult,
    ValidityType,
} from './state-estimation-result.type';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    numericFilterParams,
    textFilterParams,
} from '../../../types/custom-aggrid-types';
import { CustomAggridBooleanFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { booleanFilterParams } from '../../custom-aggrid/custom-aggrid-filters/boolean-filter-params';
import {
    STATEESTIMATION_MEASUREMENTS,
    STATEESTIMATION_RESULT_SORT_STORE,
} from '../../../utils/store-sort-filter-fields';

interface TableParams {
    sortParams: SortParams;
    filterParams: {
        type: TableType;
        tab: string;
    };
}

const createTableParams = (tabName: string): TableParams => ({
    sortParams: {
        table: STATEESTIMATION_RESULT_SORT_STORE,
        tab: tabName,
    },
    filterParams: {
        type: TableType.StateEstimation,
        tab: tabName,
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
    const { sortParams, filterParams } = createTableParams(STATEESTIMATION_MEASUREMENTS);

    const getEnumLabel = (value: string) => (value ? intl.formatMessage({ id: value, defaultMessage: value }) : '');

    const createNumericColumn = (field: string, headerId: string): ColDef =>
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: headerId }),
            colId: field,
            field,
            context: createColumnContext(sortParams, filterParams, numericFilterParams, true, 2),
        });

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
        createNumericColumn('currentValue', 'Value'),
        createNumericColumn('estimatedValue', 'EstimatedValue'),
        createNumericColumn('differenceValue', 'DifferenceValue'),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OutOfBound' }),
            colId: 'outOfBound',
            field: 'outOfBound',
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
    measurementInformationResults: MeasurementInformationResultDto[]
): MeasurementInformationResult[] {
    return measurementInformationResults.map((measurementInformationResult: MeasurementInformationResultDto) => {
        return {
            equipmentId: measurementInformationResult.equipmentId,
            measurementType: measurementInformationResult.measurementType as MeasurementType,
            validityType: measurementInformationResult.validityType as ValidityType,
            currentValue: measurementInformationResult.currentValue,
            estimatedValue: measurementInformationResult.estimatedValue,
            differenceValue: measurementInformationResult.differenceValue,
            outOfBound: measurementInformationResult.outOfBound,
        };
    });
}
