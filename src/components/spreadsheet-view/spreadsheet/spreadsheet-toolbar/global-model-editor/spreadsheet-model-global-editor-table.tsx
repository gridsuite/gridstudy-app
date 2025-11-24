/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { SELECTED } from '../../../../utils/field-constants';
import { AutocompleteInput, COLUMN_TYPES, DndColumn, DndColumnType, DndTable } from '@gridsuite/commons-ui';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';
import {
    COLUMN_DEPENDENCIES,
    COLUMN_FORMULA,
    COLUMN_ID,
    COLUMN_NAME,
    COLUMN_PRECISION,
    COLUMN_TYPE,
    COLUMN_VISIBLE,
    COLUMNS_MODEL,
} from './spreadsheet-model-global-editor.utils';
import { ColumnGlobalModel } from './spreadsheet-model-global-editor.type';
import DependenciesEditor from './dependencies-editor';
import FormulaEditor from './formula-editor';
import ColumnNameEditor from './columnName-editor';

export function SpreadsheetModelGlobalEditorTable() {
    const intl = useIntl();

    const useColumnsModelFieldArrayOutput = useFieldArray({
        name: `${COLUMNS_MODEL}`,
    });
    const { getValues, setValue, setFocus } = useFormContext();

    const getAvailableDependencies = useCallback(
        (excludeColumnId: string) => {
            return getValues(COLUMNS_MODEL)
                .map((column: ColumnGlobalModel) => column.columnId)
                .filter((id: string) => id !== excludeColumnId);
        },
        [getValues]
    );

    const COLUMNS_MODEL_DEFINITIONS: (DndColumn & { initialValue?: string | null | string[] })[] = useMemo(() => {
        return [
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
                label: intl.formatMessage({ id: 'spreadsheet/global-model-edition/column_type' }),
                dataKey: COLUMN_TYPE,
                type: DndColumnType.CUSTOM,
                initialValue: COLUMN_TYPES.TEXT,
                editable: true,
                width: '11%',
                maxWidth: '11%',
                component: (rowIndex: number) =>
                    AutocompleteInput({
                        forcePopupIcon: true,
                        freeSolo: true,
                        name: `${COLUMNS_MODEL}[${rowIndex}].${COLUMN_TYPE}`,
                        options: Object.values(COLUMN_TYPES),
                        inputTransform: (value) => value ?? '',
                        outputTransform: (value) => value,
                        size: 'small',
                        sx: {
                            '& input': { fontSize: 'small' },
                        },
                    }),
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

    useEffect(() => {
        setFocus(`${COLUMNS_MODEL}[0].${COLUMN_NAME}`);
    }, [setFocus]);

    return (
        <DndTable
            arrayFormName={`${COLUMNS_MODEL}`}
            columnsDefinition={COLUMNS_MODEL_DEFINITIONS}
            useFieldArrayOutput={useColumnsModelFieldArrayOutput}
            createRows={createColumnRows}
            withAddRowsDialog={false}
            disableDragAndDrop={false}
            showMoveArrow={false}
            tableHeight={450}
        />
    );
}
