/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    AutocompleteInput,
    CustomAGGrid,
    ErrorInput,
    FieldErrorAlert,
    IntegerInput,
    LANG_FRENCH,
} from '@gridsuite/commons-ui';
import {
    AMOUNT_TEMPORARY_LIMITS,
    EQUIPMENT_ID,
    CSV_FILENAME,
    MODIFICATIONS_TABLE,
    TYPE,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { BooleanNullableCellRenderer, DefaultCellRenderer } from 'components/custom-aggrid/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { isFieldTypeOk, setFieldTypeError, transformIfFrenchNumber, TabularField } from '../tabular/tabular-common';
import {
    LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS,
    LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS,
    LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS,
} from '../tabular/tabular-modification-utils';
import { BOOLEAN } from '../../../network/constants';

const styles = {
    grid: { height: 500, width: '100%' },
};

export interface TabularModificationFormProps {
    dataFetching: boolean;
}

export function LimitSetsTabularModificationForm({ dataFetching }: Readonly<TabularModificationFormProps>) {
    const intl = useIntl();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const [repeatableColumns, setRepeatableColumns] = useState<TabularField[]>([]);

    const { setValue, clearErrors, getValues, setError, trigger } = useFormContext();

    const language = useSelector((state: AppState) => state.computedLanguage);

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const csvColumns = useMemo<TabularField[]>(() => {
        return [...LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS, ...repeatableColumns];
    }, [repeatableColumns]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);

    const amountTemporaryLimits = useWatch({
        name: AMOUNT_TEMPORARY_LIMITS,
    });
    const equipmentType = useWatch({
        name: TYPE,
    });
    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    const [selectedFile, FileField, selectedFileError, setAcceptedFile] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns.map((column) => column.id),
        disabled: !equipmentType,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(MODIFICATIONS_TABLE);
            let requiredFieldNameInError: string = '';
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            let keyLabel: string = '';
            // check if the csv contains an error
            if (
                results.data
                    .flatMap((result) => Object.entries(result))
                    .some(([key, value]) => {
                        //Detection of repeatable fields
                        const fieldDef = csvColumns?.find((field) => {
                            return (
                                field.id === key ||
                                (LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS.includes(field) &&
                                    key.startsWith(field.id))
                            );
                        });
                        keyLabel = `${intl.formatMessage({ id: fieldDef?.name ?? fieldDef?.id })}${fieldDef?.index ? ` ${fieldDef?.index}` : ''}`;

                        // check required fields are defined
                        if (fieldDef !== undefined && fieldDef.required && (value === undefined || value === null)) {
                            requiredFieldNameInError = keyLabel;
                            return true; // “yes, we found an error here” → break loop
                        }

                        // check the field types
                        if (!isFieldTypeOk(value, fieldDef)) {
                            fieldTypeInError = keyLabel;
                            expectedTypeForFieldInError = fieldDef?.type ?? '';
                            expectedValues = fieldDef?.options;
                            return true; // “yes, we found an error here” → break loop
                        }
                        return false; // keep looking
                    })
            ) {
                if (requiredFieldNameInError !== '') {
                    setError(MODIFICATIONS_TABLE, {
                        type: 'custom',
                        message: intl.formatMessage({ id: 'FieldRequired' }, { requiredFieldNameInError: keyLabel }),
                    });
                }
                setIsFetching(false);
                setFieldTypeError(
                    fieldTypeInError,
                    expectedTypeForFieldInError,
                    MODIFICATIONS_TABLE,
                    setError,
                    intl,
                    expectedValues
                );
            }

            setValue(MODIFICATIONS_TABLE, results.data, {
                shouldDirty: true,
            });
            setValue(CSV_FILENAME, selectedFile?.name);
            setIsFetching(false);
        },
        [clearErrors, csvColumns, intl, setError, setValue, selectedFile]
    );

    const computeRepeatableColumns = useCallback(() => {
        const columns: TabularField[] = [];
        trigger(AMOUNT_TEMPORARY_LIMITS).then((valid) => {
            if (valid) {
                for (let i = 1; i <= amountTemporaryLimits; i++) {
                    LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS.forEach((field) =>
                        columns.push({
                            ...field,
                            id: field.id + i,
                            name: field.id,
                            index: i,
                        })
                    );
                }
                setRepeatableColumns(columns);
            }
        });
    }, [amountTemporaryLimits, trigger]);

    const csvTranslatedColumns = useMemo(() => {
        return csvColumns.map(({ id, name, index }) => {
            return `${intl.formatMessage({ id: name ?? id })} ${index ?? ''}`;
        });
    }, [csvColumns, intl]);

    const commentLines = useMemo(() => {
        const commentKey = `TabularLimitSetsModificationSkeletonComment`;
        let commentData: string[][] = [];
        if (csvTranslatedColumns) {
            commentData.push(['#' + csvTranslatedColumns.join(language === LANG_FRENCH ? ';' : ',')]);
            if (commentKey && intl.messages[commentKey]) {
                commentData.push([
                    intl.formatMessage({
                        id: commentKey,
                    }),
                ]);
            }
        }
        return commentData;
    }, [intl, csvTranslatedColumns, language]);

    const handleChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(MODIFICATIONS_TABLE);
        setValue(MODIFICATIONS_TABLE, []);
        setValue(CSV_FILENAME, undefined);
    }, [clearErrors, setValue, typeChangedTrigger]);

    const csvFilename = getValues(CSV_FILENAME);

    useEffect(() => {
        computeRepeatableColumns();
    }, [computeRepeatableColumns]);

    useEffect(() => {
        setAcceptedFile(csvFilename ? new File([], csvFilename) : undefined);
    }, [setAcceptedFile, csvFilename]);

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    const typesOptions = useMemo(() => {
        return Object.keys(LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS).filter(
            (type) => EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]
        );
    }, []);

    useEffect(() => {
        if (selectedFileError) {
            setValue(MODIFICATIONS_TABLE, []);
            setValue(CSV_FILENAME, undefined);
            clearErrors(MODIFICATIONS_TABLE);
            setIsFetching(false);
        } else if (selectedFile && selectedFile.size > 0) {
            setIsFetching(true);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                comments: '#',
                delimiter: language === LANG_FRENCH ? ';' : ',',
                complete: handleComplete,
                transformHeader: (header: string) => {
                    // transform header to modification field
                    const transformedHeader = LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS.find(
                        (field) => intl.formatMessage({ id: field.id }) === header
                    )?.id;
                    return transformedHeader ?? header;
                },
                transform: (value) => transformIfFrenchNumber(value, language),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue, language]);

    const equipmentTypeField = (
        <AutocompleteInput
            name={TYPE}
            label="Type"
            options={typesOptions}
            onChangeCallback={handleChange}
            getOptionLabel={(option: any) => getTypeLabel(option as string)}
            size={'small'}
            formProps={{ variant: 'filled' }}
        />
    );

    const columnDefs = useMemo<ColDef[]>(
        () =>
            csvColumns.map(({ id, name, type, index }) => ({
                field: id,
                pinned: id === EQUIPMENT_ID ? true : undefined,
                headerName: `${intl.formatMessage({ id: name ?? id })} ${index ?? ''}`,
                cellRenderer: type === BOOLEAN ? BooleanNullableCellRenderer : DefaultCellRenderer,
            })),
        [csvColumns, intl]
    );

    const limitSetModificationsDefaultColDef = useMemo(
        () => ({
            lockPinned: true,
            resizable: false,
            wrapHeaderText: true,
            sortable: true,
            autoHeaderHeight: true,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    return (
        <Grid container spacing={2} direction={'row'}>
            <Grid container item spacing={2} alignItems={'center'}>
                <GridItem size={4}>{equipmentTypeField}</GridItem>
                <Grid item>{FileField}</Grid>
            </Grid>
            <Grid container item spacing={2} alignItems={'center'}>
                <Grid item>
                    <IntegerInput name={AMOUNT_TEMPORARY_LIMITS} label={'amountTemporaryLimits'} />
                </Grid>
                <Grid item>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={commentLines}
                        filename={'limitset_modification_template'}
                        disabled={!csvColumns}
                        separator={language === LANG_FRENCH ? ';' : ','}
                    >
                        <Button variant="contained" disabled={!csvColumns}>
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    <ErrorInput name={MODIFICATIONS_TABLE} InputField={FieldErrorAlert} />
                    {selectedFileError && <Alert severity="error">{selectedFileError}</Alert>}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={styles.grid}>
                <CustomAGGrid
                    rowData={watchTable}
                    loading={isFetching}
                    defaultColDef={limitSetModificationsDefaultColDef}
                    columnDefs={columnDefs}
                    pagination
                    paginationPageSize={100}
                    suppressDragLeaveHidesColumns
                    overrideLocales={AGGRID_LOCALES}
                />
            </Grid>
        </Grid>
    );
}
