/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, CustomAGGrid, ErrorInput, FieldErrorAlert, LANG_FRENCH } from '@gridsuite/commons-ui';
import {
    CONNECTED,
    CREATIONS_TABLE,
    EQUIPMENT_ID,
    PARTICIPATE,
    REACTIVE_CAPABILITY_CURVE,
    TYPE,
    VOLTAGE_REGULATION_ON,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import {
    styles,
    TABULAR_CREATION_FIELDS,
    TabularCreationField,
    generateCommentLines,
    transformIfFrenchNumber,
    isFieldTypeOk,
    setFieldTypeError,
} from './tabular-creation-utils';
import { BooleanNullableCellRenderer, DefaultCellRenderer } from 'components/custom-aggrid/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';

export interface TabularCreationFormProps {
    dataFetching: boolean;
}

export function TabularCreationForm({ dataFetching }: Readonly<TabularCreationFormProps>) {
    const intl = useIntl();
    const language = useSelector((state: AppState) => state.computedLanguage);
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const { setValue, clearErrors, setError, getValues } = useFormContext();

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(CREATIONS_TABLE);
            let requiredFieldNameInError: string = '';
            let requiredDependantFieldNameInError: string = '';
            let dependantFieldNameInError: string = '';
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if(results.data.flatMap(result => Object.entries(result).map(([key, value]) => [result, key, value])).some(([result, key, value]) => {result;
                const fieldDef = TABULAR_CREATION_FIELDS[getValues(TYPE)]?.find((field) => field.id === key );
                // check required fields are defined
                if (
                    fieldDef !== undefined &&
                    fieldDef.required &&
                    (value === undefined || value === null)
                ) {
                    requiredFieldNameInError = key;
                    return true; // “yes, we found an error here” → break loop
                }

                //check requiredIf rule
                if (fieldDef?.requiredIf) {
                    const dependentValue = result[fieldDef.requiredIf.id];
                    if (
                        dependentValue !== undefined &&
                        dependentValue !== null &&
                        (value === undefined || value === null)
                    ) {
                        dependantFieldNameInError = key;
                        requiredDependantFieldNameInError = fieldDef.requiredIf.id;
                        return true; // “yes, we found an error here” → break loop
                    }
                }

                // check the field types
                if (!isFieldTypeOk(value, fieldDef)) {
                    fieldTypeInError = key;
                    expectedTypeForFieldInError = fieldDef?.type ?? '';
                    expectedValues = fieldDef?.options;
                    return true; // “yes, we found an error here” → break loop
                }
                return false; // keep looking
            })) {
                if (requiredFieldNameInError !== '') {
                    setError(CREATIONS_TABLE, {
                        type: 'custom',
                        message: intl.formatMessage(
                            { id: 'FieldRequired' },
                            { requiredFieldNameInError: intl.formatMessage({ id: requiredFieldNameInError }) }
                        ),
                    });
                }
                if (dependantFieldNameInError !== '' && requiredDependantFieldNameInError !== '') {
                    setError(CREATIONS_TABLE, {
                        type: 'custom',
                        message: intl.formatMessage(
                            { id: 'DependantFieldMissing' },
                            {
                                requiredField: intl.formatMessage({ id: dependantFieldNameInError }),
                                dependantField: intl.formatMessage({ id: requiredDependantFieldNameInError }),
                            }
                        ),
                    });
                }
                setFieldTypeError(
                    fieldTypeInError,
                    expectedTypeForFieldInError,
                    CREATIONS_TABLE,
                    setError,
                    intl,
                    expectedValues
                );
            }
            setValue(CREATIONS_TABLE, results.data, { shouldDirty: true });
            setIsFetching(false);
        },
        [clearErrors, setValue, getValues, setError, intl]
    );

    const equipmentType = useWatch({
        name: TYPE,
    });

    const csvColumns = useMemo(() => {
        return TABULAR_CREATION_FIELDS[equipmentType]?.map((field: TabularCreationField) => {
            return field.id;
        });
    }, [equipmentType]);

    const csvTranslatedColumns = useMemo(() => {
        return TABULAR_CREATION_FIELDS[equipmentType]?.map((field) => {
            return intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : '');
        });
    }, [intl, equipmentType]);

    const commentLines = useMemo(() => {
        return generateCommentLines({ csvTranslatedColumns, intl, equipmentType, language, formType: 'Creation' });
    }, [intl, equipmentType, csvTranslatedColumns, language]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportCreations',
        header: csvColumns,
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    const watchTable = useWatch({
        name: CREATIONS_TABLE,
    });

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    useEffect(() => {
        if (selectedFileError) {
            setValue(CREATIONS_TABLE, []);
            clearErrors(CREATIONS_TABLE);
            setIsFetching(false);
        } else if (selectedFile) {
            setIsFetching(true);
            // @ts-ignore
            Papa.parse(selectedFile as unknown as File, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                comments: '#',
                complete: handleComplete,
                delimiter: language === LANG_FRENCH ? ';' : ',',
                transform: (value) => transformIfFrenchNumber(value, language),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue, language]);

    const typesOptions = useMemo(() => {
        //only available types for tabular creation
        return Object.keys(TABULAR_CREATION_FIELDS).filter(
            (type) => EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]
        );
    }, []);

    const handleChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(CREATIONS_TABLE);
        setValue(CREATIONS_TABLE, []);
    }, [clearErrors, setValue, typeChangedTrigger]);

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

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: false,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const columnDefs = useMemo(() => {
        return TABULAR_CREATION_FIELDS[equipmentType]?.map((field) => {
            const columnDef: ColDef = {};
            if (field.id === EQUIPMENT_ID) {
                columnDef.pinned = true;
            }
            columnDef.field = field.id;
            columnDef.headerName = intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : '');
            const booleanColumns = [VOLTAGE_REGULATION_ON, CONNECTED, PARTICIPATE, REACTIVE_CAPABILITY_CURVE];
            if (booleanColumns.includes(field.id)) {
                columnDef.cellRenderer = BooleanNullableCellRenderer;
            } else {
                columnDef.cellRenderer = DefaultCellRenderer;
            }
            return columnDef;
        });
    }, [intl, equipmentType]);

    return (
        <Grid container spacing={2} direction={'row'}>
            <Grid container item spacing={2} alignItems={'center'}>
                <GridItem size={4}>{equipmentTypeField}</GridItem>
                <Grid item>{FileField}</Grid>
            </Grid>
            <Grid container item spacing={2} alignItems={'center'}>
                <Grid item>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={commentLines}
                        filename={equipmentType + '_creation_template'}
                        disabled={!csvColumns}
                        separator={language === LANG_FRENCH ? ';' : ','}
                    >
                        <Button variant="contained" disabled={!csvColumns}>
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    <ErrorInput name={CREATIONS_TABLE} InputField={FieldErrorAlert} />
                    {selectedFileError && <Alert severity="error">{selectedFileError}</Alert>}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={styles.grid}>
                <CustomAGGrid
                    rowData={watchTable}
                    loading={isFetching}
                    defaultColDef={defaultColDef}
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

export default TabularCreationForm;
