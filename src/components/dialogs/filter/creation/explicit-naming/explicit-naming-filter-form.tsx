/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import yup from 'components/utils/yup-config';
import {
    AG_GRID_ROW_UUID,
    EQUIPMENT_TYPE,
    FILTER_TYPE,
} from 'components/utils/field-constants';
import { FILTER_TYPES } from 'components/network/constants';
import CustomAgGridTable, {
    ROW_DRAGGING_SELECTION_COLUMN_DEF,
} from 'components/utils/rhf-inputs/ag-grid-table-rhf/custom-ag-grid-table';
import { ValueParserParams } from 'ag-grid-community';
import { NumericEditor } from 'components/utils/rhf-inputs/ag-grid-table-rhf/cell-editors/numeric-editor';
import { toFloatOrNullValue } from 'components/dialogs/dialogUtils';
import InputWithPopupConfirmation from 'components/utils/rhf-inputs/select-inputs/input-with-popup-confirmation';
import { FILTER_EQUIPMENTS } from '../criteria-based/criteria-based-utils';
import { SelectInput } from '@gridsuite/commons-ui';
import Papa from 'papaparse';
import CellEditor from './cell-editor';
import { useSelector } from 'react-redux';
import { fetchEquipmentsIds } from 'services/study/network-map';
export const FILTER_EQUIPMENTS_ATTRIBUTES = 'filterEquipmentsAttributes';
export const DISTRIBUTION_KEY = 'distributionKey';
export const EQUIPMENT_ID = 'equipmentID';

export const explicitNamingFilterSchema = {
    [FILTER_EQUIPMENTS_ATTRIBUTES]: yup
        .array()
        .of(
            yup.object().shape({
                [EQUIPMENT_ID]: yup.string().nullable(),
                [DISTRIBUTION_KEY]: yup.number().nullable(),
            })
        )
        // we remove empty lines
        .compact((row) => !row[DISTRIBUTION_KEY] && !row[EQUIPMENT_ID])
        .when([FILTER_TYPE], {
            is: FILTER_TYPES.EXPLICIT_NAMING.id,
            then: (schema) =>
                schema.min(1, 'emptyFilterError').when([EQUIPMENT_TYPE], {
                    is: (equipmentType: string) =>
                        isGeneratorOrLoad(equipmentType),
                    then: (schema) =>
                        schema
                            .test(
                                'noKeyWithoutId',
                                'distributionKeyWithMissingIdError',
                                (array) => {
                                    return !array!.some(
                                        (row) => !row[EQUIPMENT_ID]
                                    );
                                }
                            )
                            .test(
                                'ifOneKeyThenKeyEverywhere',
                                'missingDistributionKeyError',
                                (array) => {
                                    return !(
                                        array!.some(
                                            (row) => row[DISTRIBUTION_KEY]
                                        ) &&
                                        array!.some(
                                            (row) => !row[DISTRIBUTION_KEY]
                                        )
                                    );
                                }
                            ),
                }),
        }),
};

function isGeneratorOrLoad(equipmentType: string): boolean {
    return equipmentType === 'GENERATOR' || equipmentType === 'LOAD';
}

interface FilterTableRow {
    [AG_GRID_ROW_UUID]: string;
    [EQUIPMENT_ID]: string;
    [DISTRIBUTION_KEY]: number | null;
}

function makeDefaultRowData(): FilterTableRow {
    return {
        [AG_GRID_ROW_UUID]: crypto.randomUUID(),
        [EQUIPMENT_ID]: '',
        [DISTRIBUTION_KEY]: null,
    };
}

function makeDefaultTableRows() {
    return [makeDefaultRowData(), makeDefaultRowData(), makeDefaultRowData()];
}

export const getExplicitNamingFilterEmptyFormData = {
    [FILTER_EQUIPMENTS_ATTRIBUTES]: makeDefaultTableRows(),
};

function ExplicitNamingFilterForm() {
    const intl = useIntl();

    const { getValues, setValue } = useFormContext();

    const watchEquipmentType = useWatch({
        name: EQUIPMENT_TYPE,
    });

    const forGeneratorOrLoad = isGeneratorOrLoad(watchEquipmentType);
    const [equipmentTypeOptions, setEquipmentTypeOptions] = useState([]);
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const currentNode = useSelector((state: any) => state.currentTreeNode);
    useEffect(() => {
        if (watchEquipmentType) {
            fetchEquipmentsIds(
                studyUuid,
                currentNode.id,
                undefined,
                watchEquipmentType,
                true
            ).then((values) => {
                setEquipmentTypeOptions(
                    values
                        .sort((a: any, b: any) => a.localeCompare(b))
                        .map((value: any) => {
                            return { id: value };
                        })
                );
            });
        }
    }, [studyUuid, currentNode.id, watchEquipmentType]);

    const columnDefs = useMemo(() => {
        const columnDefs: any[] = [
            ...ROW_DRAGGING_SELECTION_COLUMN_DEF,
            {
                headerName: intl.formatMessage({ id: 'equipmentId' }),
                field: EQUIPMENT_ID,
                singleClickEdit: true,
                cellRenderer: CellEditor,
                cellRendererParams: {
                    name: FILTER_EQUIPMENTS_ATTRIBUTES,
                    options: equipmentTypeOptions,
                },
                cellStyle: { padding: 0 },
                valueParser: (params: ValueParserParams) =>
                    params.newValue?.trim() ?? null,
            },
        ];
        if (forGeneratorOrLoad) {
            columnDefs.push({
                headerName: intl.formatMessage({ id: 'distributionKey' }),
                field: DISTRIBUTION_KEY,
                editable: true,
                singleClickEdit: true,
                cellEditor: NumericEditor,
                maxWidth: 200,
            });
        }
        return columnDefs;
    }, [intl, equipmentTypeOptions, forGeneratorOrLoad]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
        }),
        []
    );

    const csvFileHeaders = useMemo(() => {
        const csvFileHeaders = [intl.formatMessage({ id: 'equipmentId' })];
        if (forGeneratorOrLoad) {
            csvFileHeaders.push(intl.formatMessage({ id: DISTRIBUTION_KEY }));
        }
        return csvFileHeaders;
    }, [intl, forGeneratorOrLoad]);

    const handleImportRow = (val: any) => {
        return {
            [AG_GRID_ROW_UUID]: crypto.randomUUID(),
            [EQUIPMENT_ID]:
                val[
                    intl.formatMessage({
                        id: 'equipmentId',
                    })
                ]?.trim(),
            [DISTRIBUTION_KEY]: toFloatOrNullValue(
                val[
                    intl.formatMessage({
                        id: DISTRIBUTION_KEY,
                    })
                ]?.trim()
            ),
        };
    };

    const handleImportCsvFilterData = (
        selectedFile: any,
        keepData: boolean
    ) => {
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                let rows = results.data.map((val) => ({
                    ...handleImportRow(val),
                }));

                if (rows && rows.length > 0) {
                    if (keepData) {
                        const oldValues = getValues(
                            FILTER_EQUIPMENTS_ATTRIBUTES
                        );
                        const allRows = oldValues.concat(rows);
                        setValue(FILTER_EQUIPMENTS_ATTRIBUTES, allRows);
                    } else {
                        setValue(FILTER_EQUIPMENTS_ATTRIBUTES, rows);
                    }
                }
            },
        });
    };

    const openConfirmationPopup = () => {
        return getValues(FILTER_EQUIPMENTS_ATTRIBUTES).some(
            (row: FilterTableRow) => row[DISTRIBUTION_KEY] || row[EQUIPMENT_ID]
        );
    };

    const handleResetOnConfirmation = () => {
        setValue(FILTER_EQUIPMENTS_ATTRIBUTES, makeDefaultTableRows());
    };

    return (
        <Grid container item spacing={2}>
            <Grid item xs={12}>
                <InputWithPopupConfirmation
                    Input={SelectInput}
                    name={EQUIPMENT_TYPE}
                    options={Object.values(FILTER_EQUIPMENTS)}
                    label={'equipmentType'}
                    shouldOpenPopup={openConfirmationPopup}
                    resetOnConfirmation={handleResetOnConfirmation}
                />
            </Grid>

            {watchEquipmentType && (
                <Grid item xs={12}>
                    <CustomAgGridTable
                        name={FILTER_EQUIPMENTS_ATTRIBUTES}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        makeDefaultRowData={makeDefaultRowData}
                        pagination={true}
                        paginationPageSize={100}
                        suppressRowClickSelection
                        alwaysShowVerticalScroll
                        stopEditingWhenCellsLoseFocus
                        csvProps={{
                            fileName: intl.formatMessage({
                                id: 'filterCsvFileName',
                            }),
                            fileHeaders: csvFileHeaders,
                            getDataFromCsv: handleImportCsvFilterData,
                        }}
                        cssProps={{
                            '& .ag-root-wrapper-body': {
                                maxHeight: '430px',
                            },
                        }}
                    />
                </Grid>
            )}
        </Grid>
    );
}

export default ExplicitNamingFilterForm;
