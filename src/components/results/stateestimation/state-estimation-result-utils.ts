/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FilterPropsType,
} from '../../custom-aggrid/custom-aggrid-header.type';
import {
    STATEESTIMATION_QUALITY_CRITERION,
    STATEESTIMATION_QUALITY_PER_REGION,
} from '../../../utils/store-sort-filter-fields';

const textFilterParams = {
    filterDataType: FILTER_DATA_TYPES.TEXT,
    filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
};

const numericFilterParams = {
    filterDataType: FILTER_DATA_TYPES.NUMBER,
    filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
};

export const mappingTabs = (index: number): string => {
    switch (index) {
        case 1:
            return STATEESTIMATION_QUALITY_CRITERION;
        case 2:
            return STATEESTIMATION_QUALITY_PER_REGION;
        default:
            return '';
    }
};

export const stateEstimationQualityCriterionColumnsDefinition = (
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CriterionType' }),
            id: 'type',
            field: 'type',
            numeric: true,
            fractionDigits: 0,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Validity' }),
            id: 'validity',
            field: 'validity',
            numeric: true,
            fractionDigits: 0,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            id: 'value',
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Threshold' }),
            id: 'threshold',
            field: 'threshold',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
    ];
};

export const stateEstimationQualityPerRegionColumnsDefinition = (
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityRegion' }),
            id: 'name',
            field: 'name',
            sortProps,
            filterProps,
            filterParams: textFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityLevel' }),
            id: 'level',
            field: 'level',
            numeric: true,
            fractionDigits: 0,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
    ];
};
