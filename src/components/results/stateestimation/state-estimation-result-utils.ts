/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';

export const stateEstimationQualityCriterionColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CriterionType' }),
            id: 'type',
            field: 'type',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Validity' }),
            id: 'validity',
            field: 'validity',
            numeric: true,
            fractionDigits: 0,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            id: 'value',
            field: 'value',
            numeric: true,
            fractionDigits: 2,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Threshold' }),
            id: 'threshold',
            field: 'threshold',
            numeric: true,
            fractionDigits: 2,
        }),
    ];
};

export const stateEstimationQualityPerRegionColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityRegion' }),
            id: 'name',
            field: 'name',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'QualityLevel' }),
            id: 'level',
            field: 'level',
            numeric: true,
            fractionDigits: 0,
        }),
    ];
};
