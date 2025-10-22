/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IntlShape } from 'react-intl';
import { ColDef } from 'ag-grid-community';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';

export const pccMinResultColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Bus' }),
            colId: 'busId',
            field: 'busId',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'PccMinTri' }),
            colId: 'pccMinTri',
            field: 'pccMinTri',
            context: { numeric: true, fractionDigits: 2 },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'IccMin' }),
            colId: 'iccMinTri',
            field: 'iccMinTri',
            context: { numeric: true, fractionDigits: 2 },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Contingency' }),
            colId: 'limitingEquipment',
            field: 'limitingEquipment',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'xOhm' }),
            colId: 'x',
            field: 'x',
            context: { numeric: true, fractionDigits: 2 },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'rOhm' }),
            colId: 'r',
            field: 'r',
            context: { numeric: true, fractionDigits: 2 },
        }),
    ];
};
