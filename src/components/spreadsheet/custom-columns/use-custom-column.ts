/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { CustomColumnMenu } from '../../custom-aggrid/custom-column-menu';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { CustomColDef } from '../../custom-aggrid/custom-aggrid-header.type';
import { limitedEvaluate } from './math';
import { ValueGetterParams } from 'ag-grid-community';

export function useCustomColumn(tabIndex: number) {
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tabIndex]
    );

    const createValueGetter = useCallback(
        (colWithFormula: ColumnWithFormula) =>
            (params: ValueGetterParams): string => {
                try {
                    const scope = { ...params.data };
                    colWithFormula.dependencies.forEach((dep) => {
                        scope[dep] = params.getValue(dep);
                    });
                    return limitedEvaluate(colWithFormula.formula, scope);
                } catch (e) {
                    return '';
                }
            },
        []
    );

    const customColumns = useMemo(
        () =>
            customColumnsDefinitions.map((colWithFormula): CustomColDef => {
                return {
                    colId: colWithFormula.id,
                    headerName: colWithFormula.name,
                    headerTooltip: colWithFormula.name,
                    headerComponent: CustomHeaderComponent,
                    headerComponentParams: {
                        sortParams: {
                            table: SPREADSHEET_SORT_STORE,
                            tab: tableDefinition.name,
                        },
                        menu: {
                            Menu: CustomColumnMenu,
                            menuParams: {
                                tabIndex,
                                customColumnName: colWithFormula.name,
                            },
                        },
                    },
                    valueGetter: createValueGetter(colWithFormula),
                    editable: false,
                    suppressMovable: true,
                };
            }),
        [customColumnsDefinitions, tableDefinition.name, tabIndex, createValueGetter]
    );

    return customColumns;
}
