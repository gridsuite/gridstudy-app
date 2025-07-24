/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
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
    fetchStudyMetadata,
    FieldErrorAlert,
    LANG_FRENCH,
    useSnackMessage,
    useStateBoolean,
} from '@gridsuite/commons-ui';
import { MODIFICATIONS_TABLE, TYPE, TABULAR_PROPERTIES } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { TABULAR_CREATION_FIELDS } from './tabular-creation-utils';
import { DefaultCellRenderer } from 'components/custom-aggrid/cell-renderers';
import Papa from 'papaparse';
import GridItem from '../../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import {
    csvColumnNames,
    dialogStyles,
    generateCommentLines,
    isFieldTypeOk,
    PredefinedEquipmentProperties,
    setFieldTypeError,
    tableColDefs,
    transformIfFrenchNumber,
} from '../tabular-common';
import { PropertiesFormType, TabularProperty } from '../properties/property-utils';
import DefinePropertiesDialog from '../properties/define-properties-dialog';

export interface TabularCreationFormProps {
    dataFetching: boolean;
}

export function TabularCreationForm({ dataFetching }: Readonly<TabularCreationFormProps>) {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const { setValue, clearErrors, setError, getValues } = useFormContext();
    const propertiesDialogOpen = useStateBoolean(false);
    const language = useSelector((state: AppState) => state.computedLanguage);
    const [predefinedEquipmentProperties, setPredefinedEquipmentProperties] = useState<PredefinedEquipmentProperties>(
        {}
    );

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const equipmentType = useWatch({
        name: TYPE,
    });
    const tabularProperties = useWatch({
        name: TABULAR_PROPERTIES,
    });
    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(MODIFICATIONS_TABLE);
            let requiredFieldNameInError: string = '';
            let requiredDependantFieldNameInError: string = '';
            let dependantFieldNameInError: string = '';
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if (
                results.data
                    .flatMap((result) => Object.entries(result).map(([key, value]) => [result, key, value]))
                    .some(([result, key, value]) => {
                        const fieldDef = TABULAR_CREATION_FIELDS[getValues(TYPE)]?.find((field) => field.id === key);
                        // check required fields are defined
                        if (fieldDef !== undefined && fieldDef.required && (value === undefined || value === null)) {
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
                    })
            ) {
                if (requiredFieldNameInError !== '') {
                    setError(MODIFICATIONS_TABLE, {
                        type: 'custom',
                        message: intl.formatMessage(
                            { id: 'FieldRequired' },
                            { requiredFieldNameInError: intl.formatMessage({ id: requiredFieldNameInError }) }
                        ),
                    });
                }
                if (dependantFieldNameInError !== '' && requiredDependantFieldNameInError !== '') {
                    setError(MODIFICATIONS_TABLE, {
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
                setIsFetching(false);
                // For shunt compensators, display a warning message if maxSusceptance is set along with shuntCompensatorType or maxQAtNominalV
                if (
                    equipmentType === EQUIPMENT_TYPES.SHUNT_COMPENSATOR &&
                    results.data.some(
                        (creation) =>
                            creation.maxSusceptance != null &&
                            (creation.shuntCompensatorType || creation.maxQAtNominalV != null)
                    )
                ) {
                    snackWarning({
                        messageId: 'TabularCreationShuntWarning',
                    });
                }
                setFieldTypeError(
                    fieldTypeInError,
                    expectedTypeForFieldInError,
                    MODIFICATIONS_TABLE,
                    setError,
                    intl,
                    expectedValues
                );
            }
            setIsFetching(false);
            setValue(MODIFICATIONS_TABLE, results.data, { shouldDirty: true });
        },
        [clearErrors, setValue, getValues, equipmentType, setError, intl, snackWarning]
    );

    const selectedProperties = useMemo((): string[] => {
        return (
            tabularProperties
                ?.filter((property: TabularProperty) => property.selected)
                ?.map((property: TabularProperty) => property.name) ?? []
        );
    }, [tabularProperties]);

    const csvColumns = useMemo(() => {
        return csvColumnNames(TABULAR_CREATION_FIELDS[equipmentType], selectedProperties);
    }, [equipmentType, selectedProperties]);

    const commentLines = useMemo(() => {
        return generateCommentLines({
            fields: TABULAR_CREATION_FIELDS[equipmentType],
            selectedProperties,
            intl,
            equipmentType,
            language,
            formType: 'Creation',
            predefinedEquipmentProperties,
        });
    }, [intl, equipmentType, language, selectedProperties, predefinedEquipmentProperties]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportCreations',
        header: csvColumns,
        disabled: !csvColumns?.length,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    useEffect(() => {
        fetchStudyMetadata().then((studyMetadata) => {
            setPredefinedEquipmentProperties(studyMetadata?.predefinedEquipmentProperties ?? {});
        });
    }, []);

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    useEffect(() => {
        if (selectedFileError) {
            setValue(MODIFICATIONS_TABLE, []);
            clearErrors(MODIFICATIONS_TABLE);
            setIsFetching(false);
        } else if (selectedFile) {
            setIsFetching(true);
            // @ts-ignore
            Papa.parse(selectedFile as unknown as File, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                comments: '#',
                delimiter: language === LANG_FRENCH ? ';' : ',',
                complete: handleComplete,
                transform: (value) => transformIfFrenchNumber(value, language),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue, language]);

    const typesOptions = useMemo(() => {
        return Object.keys(TABULAR_CREATION_FIELDS).filter(
            (type) => EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]
        );
    }, []);

    const handleTypeChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(MODIFICATIONS_TABLE);
        setValue(MODIFICATIONS_TABLE, []);
        setValue(TABULAR_PROPERTIES, []);
    }, [clearErrors, setValue, typeChangedTrigger]);

    const equipmentTypeField = (
        <AutocompleteInput
            name={TYPE}
            label="Type"
            options={typesOptions}
            onChangeCallback={handleTypeChange}
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
        return tableColDefs(TABULAR_CREATION_FIELDS[equipmentType], selectedProperties, intl);
    }, [equipmentType, selectedProperties, intl]);

    const onPropertiesChange = (formData: PropertiesFormType) => {
        const newSelectedProperties =
            formData[TABULAR_PROPERTIES]?.filter((property: TabularProperty) => property.selected)?.map(
                (property: TabularProperty) => property.name
            ) ?? [];
        if (newSelectedProperties.toString() !== selectedProperties.toString()) {
            // new columns => reset table
            clearErrors(MODIFICATIONS_TABLE);
            setValue(MODIFICATIONS_TABLE, []);
        }
        setValue(TABULAR_PROPERTIES, formData[TABULAR_PROPERTIES], { shouldDirty: true });
    };

    return (
        <Grid container spacing={2} direction={'row'}>
            <Grid container item spacing={2} alignItems={'center'}>
                <GridItem size={4}>{equipmentTypeField}</GridItem>
                <Grid item>{FileField}</Grid>
            </Grid>
            <Grid container item spacing={2} alignItems={'center'}>
                <Grid item>
                    <Button
                        variant="contained"
                        disabled={!equipmentType}
                        onClick={() => {
                            propertiesDialogOpen.setTrue();
                        }}
                    >
                        <FormattedMessage id="DefinePropertiesButton" />
                    </Button>
                </Grid>
                <Grid item>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={commentLines}
                        filename={equipmentType + '_creation_template'}
                        disabled={!csvColumns?.length}
                        separator={language === LANG_FRENCH ? ';' : ','}
                    >
                        <Button variant="contained" disabled={!csvColumns?.length}>
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    <ErrorInput name={MODIFICATIONS_TABLE} InputField={FieldErrorAlert} />
                    {selectedFileError && <Alert severity="error">{selectedFileError}</Alert>}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={dialogStyles.grid}>
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
            <DefinePropertiesDialog
                open={propertiesDialogOpen}
                equipmentType={equipmentType}
                currentProperties={tabularProperties}
                predefinedEquipmentProperties={predefinedEquipmentProperties}
                onValidate={onPropertiesChange}
            />
        </Grid>
    );
}

export default TabularCreationForm;
