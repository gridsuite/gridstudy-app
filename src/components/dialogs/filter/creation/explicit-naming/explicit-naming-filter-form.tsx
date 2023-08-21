/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import yup from 'components/utils/yup-config';
import {
    EQUIPMENT_IDD,
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
import SelectInput from 'components/utils/rhf-inputs/select-input';
import { FILTER_EQUIPMENTS } from '../criteria-based/criteria-based-utils';

export const FILTER_EQUIPMENTS_ATTRIBUTES = 'filterEquipmentsAttributes';
export const DISTRIBUTION_KEY = 'distributionKey';

export const explicitNamingFilterSchema = {
    [FILTER_EQUIPMENTS_ATTRIBUTES]: yup
        .array()
        .of(
            yup.object().shape({
                [EQUIPMENT_IDD]: yup.string().nullable(),
                [DISTRIBUTION_KEY]: yup.number().nullable(),
            })
        )
        // we remove empty lines
        .compact((row) => !row[DISTRIBUTION_KEY] && !row[EQUIPMENT_IDD])
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
                                        (row) => !row[EQUIPMENT_IDD]
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
    [EQUIPMENT_IDD]: string;
    [DISTRIBUTION_KEY]: number | null;
}

const defaultRowData: FilterTableRow = {
    [EQUIPMENT_IDD]: '',
    [DISTRIBUTION_KEY]: null,
};

const defaultTableRows = [defaultRowData, defaultRowData, defaultRowData];

export const explicitNamingFilterEmptyFormData = {
    [FILTER_EQUIPMENTS_ATTRIBUTES]: defaultTableRows,
};

function ExplicitNamingFilterForm() {
    const intl = useIntl();

    const { getValues, setValue } = useFormContext();

    const watchEquipmentType = useWatch({
        name: EQUIPMENT_TYPE,
    });

    const forGeneratorOrLoad = isGeneratorOrLoad(watchEquipmentType);

    const columnDefs = useMemo(() => {
        const columnDefs: any[] = [
            ...ROW_DRAGGING_SELECTION_COLUMN_DEF,
            {
                headerName: intl.formatMessage({ id: 'equipmentId' }),
                field: EQUIPMENT_IDD,
                editable: true,
                singleClickEdit: true,
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
    }, [intl, forGeneratorOrLoad]);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
        }),
        []
    );

    const csvFileHeaders = useMemo(() => {
        const csvFileHeaders = [intl.formatMessage({ id: 'equipmentId' })];
        if (forGeneratorOrLoad) {
            csvFileHeaders.push(intl.formatMessage({ id: 'distributionKey' }));
        }
        return csvFileHeaders;
    }, [intl, forGeneratorOrLoad]);

    const getDataFromCsvFile = useCallback((csvData: any) => {
        if (csvData) {
            return csvData.map((value: any) => {
                return {
                    [EQUIPMENT_IDD]: value[0]?.trim(),
                    [DISTRIBUTION_KEY]: toFloatOrNullValue(value[1]?.trim()),
                };
            });
        } else {
            return [];
        }
    }, []);

    const openConfirmationPopup = () => {
        return getValues(FILTER_EQUIPMENTS_ATTRIBUTES).some(
            (row: FilterTableRow) => row[DISTRIBUTION_KEY] || row[EQUIPMENT_IDD]
        );
    };

    const handleResetOnConfirmation = () => {
        setValue(FILTER_EQUIPMENTS_ATTRIBUTES, defaultTableRows);
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
                        defaultRowData={defaultRowData}
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
                            getDataFromCsv: getDataFromCsvFile,
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
