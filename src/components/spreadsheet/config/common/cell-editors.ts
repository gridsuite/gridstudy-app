/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * These functions exist because AgGrid's {@link import('ag-grid-community').ColDef} define
 * fields <code>cellEditor</code> and <code>cellEditorParams</code> as <code>any?</code>,
 * so no check of parameters given is done without explicitly declare awaited types.
 */
import type { ICellEditorParams, ISelectCellEditorParams } from 'ag-grid-community';
import {
    BooleanListField,
    EnumListField,
    type EquipmentTableBooleanListEditorProps,
    type EquipmentTableEnumEditorProps,
    type EquipmentTableNumberEditorProps,
    NumericalField,
} from '../../utils/equipment-table-editors';
import type { CustomColDef } from '../../../custom-aggrid/custom-aggrid-header.type';
import { EnumOption } from '../../../utils/utils-type';
import type { Writable } from 'type-fest';

export type ICustomCellEditorParams<TData = any, TValue = any, TContext = any> = Omit<
    ICellEditorParams<TData, TValue, TContext>,
    'colDef'
> & {
    colDef: CustomColDef<TData, TValue>;
};

export function numericalCellEditorConfig<TData = any, TContext = any>(
    getDefaultValue: (params: ICellEditorParams<TData, number, TContext>) => number | undefined
) {
    return {
        cellEditor: NumericalField,
        cellEditorParams: (
            params: ICustomCellEditorParams<TData, number, TContext>
        ): EquipmentTableNumberEditorProps<TData, TContext> => ({
            defaultValue: getDefaultValue(params),
            rowData: params.data,
            gridContext: params.context,
            gridApi: params.api,
            colDef: params.colDef,
        }),
    } as const;
}

export function booleanCellEditorConfig<TData = any, TContext = any>(
    getDefaultValue: (params: ICellEditorParams<TData, boolean, TContext>) => boolean
) {
    return {
        cellEditor: BooleanListField,
        cellEditorParams: (
            params: ICustomCellEditorParams<TData, boolean, TContext>
        ): EquipmentTableBooleanListEditorProps<TData, TContext> => ({
            defaultValue: getDefaultValue(params),
            gridContext: params.context,
            gridApi: params.api,
            colDef: params.colDef,
        }),
    } as const;
}

export function enumCellEditorConfig<TData = any, TContext = any>(
    getDefaultValue: (params: ICellEditorParams<TData, string, TContext>) => string,
    enumOptions: EnumOption[] | Readonly<EnumOption[]>
) {
    return {
        cellEditor: EnumListField,
        cellEditorParams: (
            params: ICustomCellEditorParams<TData, string, TContext>
        ): EquipmentTableEnumEditorProps<TData, TContext> => ({
            defaultValue: getDefaultValue(params),
            enumOptions: enumOptions as Writable<typeof enumOptions>,
            gridContext: params.context,
            gridApi: params.api,
            colDef: params.colDef,
        }),
    } as const;
}

export function standardSelectCellEditorConfig<TData = any, TValue = any, TContext = any>(
    getValues: (params: ICellEditorParams<TData, TValue, TContext>) => TValue[]
) {
    return {
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (
            params: ICustomCellEditorParams<TData, TValue, TContext>
        ): ISelectCellEditorParams<TValue> => ({
            values: getValues(params),
        }),
    } as const;
}
