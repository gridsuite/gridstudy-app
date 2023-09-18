/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CONTINGENCY_LIST_TYPE,
    AG_GRID_ROW_UUID,
    CONTINGENCY_NAME,
    EQUIPMENT_IDS,
    EQUIPMENT_TABLE,
} from '../../../utils/field-constants';
import { useIntl } from 'react-intl';
import React, { useCallback, useMemo } from 'react';
import CustomAgGridTable, {
    ROW_DRAGGING_SELECTION_COLUMN_DEF,
} from '../../../utils/rhf-inputs/ag-grid-table-rhf/custom-ag-grid-table';
import { gridItem } from '../../../utils/dialog-utils';
import yup from '../../../utils/yup-config';
import { makeDefaultRowData } from '../contingency-list-utils';
import ChipsArrayEditor from '../../../utils/rhf-inputs/ag-grid-table-rhf/cell-editors/chips-array-editor';
import { ContingencyListType } from '../../../../utils/elementType';

export const getExplicitNamingSchema = (id) => {
    return {
        [id]: yup
            .array()
            .of(
                yup.object().shape({
                    [CONTINGENCY_NAME]: yup.string().nullable(),
                    [EQUIPMENT_IDS]: yup.array().of(yup.string().nullable()),
                })
            )
            // we remove empty lines
            .compact(
                (row) => !row[CONTINGENCY_NAME] && !row[EQUIPMENT_IDS]?.length
            )
            .when([CONTINGENCY_LIST_TYPE], {
                is: ContingencyListType.EXPLICIT_NAMING.id,
                then: (schema) => getExplicitNamingConditionSchema(schema),
            }),
    };
};

export const getExplicitNamingEditSchema = (id) => {
    const schema = yup
        .array()
        .of(
            yup.object().shape({
                [CONTINGENCY_NAME]: yup.string().nullable(),
                [EQUIPMENT_IDS]: yup.array().of(yup.string().nullable()),
            })
        ) // we remove empty lines
        .compact(
            (row) => !row[CONTINGENCY_NAME] && !row[EQUIPMENT_IDS]?.length
        );

    return {
        [id]: getExplicitNamingConditionSchema(schema),
    };
};

const getExplicitNamingConditionSchema = (schema) => {
    return schema
        .min(1, 'contingencyTableContainAtLeastOneRowError')
        .test(
            'rowWithoutName',
            'contingencyTablePartiallyDefinedError',
            (array) => {
                return !array.some((row) => !row[CONTINGENCY_NAME]?.trim());
            }
        )
        .test(
            'rowWithoutEquipments',
            'contingencyTablePartiallyDefinedError',
            (array) => {
                return !array.some((row) => !row[EQUIPMENT_IDS]?.length);
            }
        );
};

const suppressKeyboardEvent = (params) => {
    const key = params.event.key;
    return key === 'Enter' || key === 'ArrowLeft' || key === 'ArrowRight';
};

const ExplicitNamingForm = () => {
    const intl = useIntl();
    const columnDefs = useMemo(() => {
        return [
            ...ROW_DRAGGING_SELECTION_COLUMN_DEF,
            {
                headerName: intl.formatMessage({ id: 'elementName' }),
                field: CONTINGENCY_NAME,
                editable: true,
                singleClickEdit: true,
            },
            {
                headerName: intl.formatMessage({ id: 'equipments' }),
                field: EQUIPMENT_IDS,
                suppressKeyboardEvent: (params) =>
                    // we suppress the keys that are used by cellRenderer
                    suppressKeyboardEvent(params),
                autoHeight: true,
                wrapText: true,
                singleClickEdit: true,
                cellRenderer: ChipsArrayEditor,
                cellRendererParams: {
                    name: EQUIPMENT_TABLE,
                },
                cellStyle: { padding: 0 },
            },
        ];
    }, [intl]);

    const getDataFromCsvFile = useCallback((csvData) => {
        if (csvData) {
            return csvData.map((value) => {
                return {
                    [AG_GRID_ROW_UUID]: crypto.randomUUID(),
                    [CONTINGENCY_NAME]: value[0]?.trim() || '',
                    [EQUIPMENT_IDS]:
                        value[1]
                            ?.split('|')
                            .map((n) => n.trim())
                            .filter((n) => n) || undefined,
                };
            });
        }
        return [];
    }, []);

    const csvFileHeaders = useMemo(
        () => [
            intl.formatMessage({ id: 'elementName' }),
            intl.formatMessage({ id: 'equipments' }),
        ],
        [intl]
    );

    const csvInitialData = useMemo(
        () => [
            [intl.formatMessage({ id: 'CSVFileCommentContingencyList1' })],
            [intl.formatMessage({ id: 'CSVFileCommentContingencyList2' })],
            [intl.formatMessage({ id: 'CSVFileCommentContingencyList3' })],
            [intl.formatMessage({ id: 'CSVFileCommentContingencyList4' })],
        ],
        [intl]
    );

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            suppressMovable: true,
        }),
        []
    );

    const equipmentTableField = (
        <CustomAgGridTable
            name={EQUIPMENT_TABLE}
            columnDefs={columnDefs}
            makeDefaultRowData={makeDefaultRowData}
            pagination={true}
            paginationPageSize={100}
            suppressRowClickSelection
            defaultColDef={defaultColDef}
            alwaysShowVerticalScroll
            stopEditingWhenCellsLoseFocus
            csvProps={{
                fileName: intl.formatMessage({ id: 'contingencyListCreation' }),
                fileHeaders: csvFileHeaders,
                getDataFromCsv: getDataFromCsvFile,
                csvData: csvInitialData,
            }}
        />
    );

    return gridItem(equipmentTableField, 12);
};

export default ExplicitNamingForm;
