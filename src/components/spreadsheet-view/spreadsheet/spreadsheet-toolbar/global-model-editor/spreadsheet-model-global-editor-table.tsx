/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import { SELECTED } from '../../../../utils/field-constants';
import { DndColumn, DndColumnType, DndTable } from '@gridsuite/commons-ui';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import {
    COLUMN_ID,
    COLUMN_NAME,
    COLUMNS_MODEL,
    COLUMN_TYPE,
    COLUMN_PRECISION,
    COLUMN_FORMULA,
    COLUMN_DEPENDENCIES,
    COLUMN_VISIBLE,
} from './spreadsheet-model-global-editor.utils';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { ColumnGlobalModel } from './spreadsheet-model-global-editor.type';
import DependenciesEditor from './dependencies-editor';
import FormulaEditor from './formula-editor';
import ColumnNameEditor from './columnName-editor';

interface SpreadsheetModelGlobalEditorTableProps {
    columnsModel: ColumnGlobalModel[] | undefined;
}

export function SpreadsheetModelGlobalEditorTable({ columnsModel }: Readonly<SpreadsheetModelGlobalEditorTableProps>) {
    const intl = useIntl();

    const useColumnsModelFieldArrayOutput = useFieldArray({
        name: `${COLUMNS_MODEL}`,
    });
    const { getValues, setValue } = useFormContext();

    const getAvailableDependencies = useCallback(
        (excludeColumnId: string) => {
            if (!columnsModel) {
                return [];
            }
            return getValues(COLUMNS_MODEL)
                .map((column: ColumnGlobalModel) => column.columnId)
                .filter((id: string) => id !== excludeColumnId);
        },
        [columnsModel, getValues]
    );

    const COLUMNS_MODEL_DEFINITIONS: (DndColumn & { initialValue?: string | null | string[] })[] = useMemo(() => {
        return [
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_id' }),
                dataKey: COLUMN_ID,
                type: DndColumnType.TEXT,
                editable: true,
                initialValue: '',
                showErrorMsg: true,
                width: '20%',
                maxWidth: '20%',
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_name' }),
                dataKey: COLUMN_NAME,
                type: DndColumnType.CUSTOM,
                initialValue: '',
                editable: true,
                width: '20%',
                maxWidth: '20%',
                component: (rowIndex) =>
                    ColumnNameEditor({
                        name: `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_NAME}`,
                        rowIndex: rowIndex,
                        generateColumnId: (rowIndex: number, columnName: string) => {
                            if (getValues(`${COLUMNS_MODEL}[${rowIndex}].${COLUMN_ID}`) === '') {
                                const COLUMN_NAME_REGEX = /\W/g;
                                setValue(
                                    `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_ID}`,
                                    columnName.replace(COLUMN_NAME_REGEX, '')
                                );
                            }
                        },
                    }),
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_type' }),
                dataKey: COLUMN_TYPE,
                type: DndColumnType.AUTOCOMPLETE,
                initialValue: COLUMN_TYPES.TEXT,
                editable: true,
                options: Object.values(COLUMN_TYPES),
                width: '11%',
                maxWidth: '11%',
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_precision' }),
                dataKey: COLUMN_PRECISION,
                type: DndColumnType.NUMERIC,
                initialValue: null,
                editable: true,
                width: '3%',
                maxWidth: '3%',
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_formula' }),
                dataKey: COLUMN_FORMULA,
                type: DndColumnType.CUSTOM,
                initialValue: '',
                editable: true,
                width: '22%',
                maxWidth: '22%',
                component: (rowIndex) =>
                    FormulaEditor({
                        name: `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_FORMULA}`,
                    }),
            },
            {
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_dependencies' }),
                dataKey: COLUMN_DEPENDENCIES,
                type: DndColumnType.CUSTOM,
                initialValue: [],
                editable: true,
                width: '24%',
                maxWidth: '24%',
                component: (rowIndex) =>
                    DependenciesEditor({
                        name: `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_DEPENDENCIES}`,
                        dependencies: getAvailableDependencies(getValues(`${COLUMNS_MODEL}[${rowIndex}].${COLUMN_ID}`)),
                    }),
            },
        ];
    }, [intl, getAvailableDependencies, getValues, setValue]);

    const newColumnRowData = useMemo(() => {
        const newRowData: any = {};
        newRowData[SELECTED] = false;
        newRowData[COLUMN_VISIBLE] = true;
        COLUMNS_MODEL_DEFINITIONS.forEach((column) => (newRowData[column.dataKey] = column.initialValue));
        return newRowData;
    }, [COLUMNS_MODEL_DEFINITIONS]);

    const createColumnRows = () => {
        return [newColumnRowData];
    };

    return (
        <DndTable
            arrayFormName={`${COLUMNS_MODEL}`}
            columnsDefinition={COLUMNS_MODEL_DEFINITIONS}
            useFieldArrayOutput={useColumnsModelFieldArrayOutput}
            createRows={createColumnRows}
            withAddRowsDialog={false}
            disableDragAndDrop={false}
            showMoveArrow={false}
        />
    );
}
