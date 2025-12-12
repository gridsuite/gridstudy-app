/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    AutocompleteInput,
    BooleanNullableCellRenderer,
    CustomAGGrid,
    DefaultCellRenderer,
    DirectoryItemSelector,
    ElementType,
    ErrorInput,
    fetchStudyMetadata,
    FieldErrorAlert,
    LANG_FRENCH,
    type MuiStyles,
    type TreeViewFinderNodeProps,
    useSnackMessage,
    useStateBoolean,
} from '@gridsuite/commons-ui';
import {
    CSV_FILENAME,
    EQUIPMENT_ID,
    MODIFICATIONS_TABLE,
    TABULAR_PROPERTIES,
    TYPE,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import Papa from 'papaparse';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import DefinePropertiesDialog from './properties/define-properties-dialog';
import { PropertiesFormType, PROPERTY_CSV_COLUMN_PREFIX, TabularProperty } from './properties/property-utils';
import {
    generateCommentLines,
    isFieldTypeOk,
    PredefinedEquipmentProperties,
    setFieldTypeError,
    TabularField,
    TabularModificationType,
    transformIfFrenchNumber,
} from './tabular-common';
import { ColDef } from 'ag-grid-community';
import { BOOLEAN } from '../../../network/constants';
import { TABULAR_CREATION_FIELDS } from './tabular-creation-utils';
import { TABULAR_MODIFICATION_FIELDS } from './tabular-modification-utils';
import { getObjectId } from '../../../utils/utils';
import { useFilterCsvGenerator } from './use-filter-csv-generator';
import { usePrefilledModelGenerator } from './generation/use-prefilled-model-generator';
import GeneratePrefilledModelDialog from './generation/generate-prefilled-model-dialog';
import { PrefilledModelGenerationParams } from './generation/utils';

const dialogStyles = {
    grid: { height: 500, width: '100%' },
} as const satisfies MuiStyles;

export interface TabularFormProps {
    dataFetching: boolean;
    dialogMode: TabularModificationType;
}

export function TabularForm({ dataFetching, dialogMode }: Readonly<TabularFormProps>) {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const { setValue, clearErrors, setError } = useFormContext();
    const propertiesDialogOpen = useStateBoolean(false);
    const generateFromFilterOpen = useStateBoolean(false);
    const prefilledModelDialogOpen = useStateBoolean(false);
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
    const watchFileName = useWatch({
        name: CSV_FILENAME,
    });

    const csvFields = useMemo(() => {
        const fields =
            dialogMode === TabularModificationType.CREATION ? TABULAR_CREATION_FIELDS : TABULAR_MODIFICATION_FIELDS;
        return fields[equipmentType] ?? [];
    }, [equipmentType, dialogMode]);

    const handleTabularCreationParsingError = useCallback(
        (results: Papa.ParseResult<any>) => {
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
                        const fieldDef = csvFields.find((field) => field.id === key);
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
                } else if (dependantFieldNameInError !== '' && requiredDependantFieldNameInError !== '') {
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
                } else if (fieldTypeInError !== '') {
                    setFieldTypeError(
                        intl.formatMessage({ id: fieldTypeInError }),
                        expectedTypeForFieldInError,
                        MODIFICATIONS_TABLE,
                        setError,
                        intl,
                        expectedValues
                    );
                }
            }

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
        },
        [csvFields, equipmentType, intl, setError, snackWarning]
    );

    const handleTabularModificationParsingError = useCallback(
        (results: Papa.ParseResult<any>) => {
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if (
                results.data.flatMap(Object.entries).some(([key, value]) => {
                    const fieldDef = csvFields.find((field) => field.id === key);
                    // check the field types
                    if (!isFieldTypeOk(value, fieldDef)) {
                        fieldTypeInError = key;
                        expectedTypeForFieldInError = fieldDef?.type ?? '';
                        expectedValues = fieldDef?.options;
                        return true; // “yes, we found an error here” → break some() loop
                    }
                    return false; // keep looking
                })
            ) {
                setFieldTypeError(
                    intl.formatMessage({ id: fieldTypeInError }),
                    expectedTypeForFieldInError,
                    MODIFICATIONS_TABLE,
                    setError,
                    intl,
                    expectedValues
                );
            }

            // For shunt compensators, display a warning message if maxSusceptance is modified along with shuntCompensatorType or maxQAtNominalV
            if (
                equipmentType === EQUIPMENT_TYPES.SHUNT_COMPENSATOR &&
                results.data.some(
                    (modification) =>
                        modification.maxSusceptance != null &&
                        (modification.shuntCompensatorType || modification.maxQAtNominalV != null)
                )
            ) {
                snackWarning({ messageId: 'TabularModificationShuntWarning' });
            }
        },
        [equipmentType, csvFields, setError, intl, snackWarning]
    );

    const selectedProperties = useMemo((): string[] => {
        return (
            tabularProperties
                ?.filter((property: TabularProperty) => property.selected)
                ?.map((property: TabularProperty) => property.name) ?? []
        );
    }, [tabularProperties]);

    const csvColumns = useMemo((): string[] => {
        return csvFields
            .map((field: TabularField) => field.id)
            .concat(selectedProperties.map((propertyName: string) => PROPERTY_CSV_COLUMN_PREFIX + propertyName));
    }, [csvFields, selectedProperties]);

    const commentLines = useMemo(() => {
        return generateCommentLines({
            fields: csvFields,
            selectedProperties,
            intl,
            equipmentType,
            language,
            formType: dialogMode === TabularModificationType.CREATION ? 'Creation' : 'Modification',
            predefinedEquipmentProperties,
        });
    }, [csvFields, selectedProperties, intl, equipmentType, language, dialogMode, predefinedEquipmentProperties]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError, setAcceptedFile, resetFile] = useCSVPicker({
        label: dialogMode === TabularModificationType.CREATION ? 'ImportCreations' : 'ImportModifications',
        header: csvColumns,
        disabled: !csvColumns?.length,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    const { handleGeneratePrefilledModel } = usePrefilledModelGenerator({
        dialogMode,
        equipmentType,
        csvColumns,
        commentLines,
        predefinedEquipmentProperties,
    });

    const onPrefilledModelGenerate = useCallback(
        (params: PrefilledModelGenerationParams) => {
            handleGeneratePrefilledModel(params);
        },
        [handleGeneratePrefilledModel]
    );

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            // Only update modifications table if a valid file upload exists
            if (selectedFile !== undefined) {
                clearErrors(MODIFICATIONS_TABLE);
                if (dialogMode === TabularModificationType.CREATION) {
                    handleTabularCreationParsingError(results);
                } else {
                    handleTabularModificationParsingError(results);
                }
                setValue(MODIFICATIONS_TABLE, results.data, { shouldDirty: true });
                setValue(CSV_FILENAME, selectedFile?.name);
            } else {
                // If the file is undefined we don't update the values because it's outdated
                setValue(MODIFICATIONS_TABLE, []);
                setValue(CSV_FILENAME, undefined);
            }
            setIsFetching(false);
        },
        [
            clearErrors,
            dialogMode,
            setValue,
            handleTabularCreationParsingError,
            handleTabularModificationParsingError,
            selectedFile,
        ]
    );

    useEffect(() => {
        fetchStudyMetadata().then((studyMetadata) => {
            setPredefinedEquipmentProperties(studyMetadata?.predefinedEquipmentProperties ?? {});
        });
    }, []);

    useEffect(() => {
        setAcceptedFile(watchFileName ? new File([], watchFileName) : undefined);
    }, [setAcceptedFile, watchFileName]);

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    useEffect(() => {
        if (selectedFileError) {
            setValue(MODIFICATIONS_TABLE, []);
            setValue(CSV_FILENAME, undefined);
            clearErrors(MODIFICATIONS_TABLE);
            setIsFetching(false);
        } else if (selectedFile && selectedFile.size > 0) {
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
    }, [clearErrors, handleComplete, intl, selectedFile, selectedFileError, setValue, language, csvFields]);

    const typesOptions = useMemo(() => {
        return Object.keys(
            dialogMode === TabularModificationType.CREATION ? TABULAR_CREATION_FIELDS : TABULAR_MODIFICATION_FIELDS
        ).filter((type) => EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]);
    }, [dialogMode]);

    const handleTypeChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(MODIFICATIONS_TABLE);
        setValue(MODIFICATIONS_TABLE, []);
        setValue(CSV_FILENAME, undefined);
        setValue(TABULAR_PROPERTIES, []);
        resetFile();
    }, [clearErrors, setValue, typeChangedTrigger, resetFile]);

    const equipmentTypeField = (
        <AutocompleteInput
            name={TYPE}
            label="Type"
            options={typesOptions}
            onChangeCallback={handleTypeChange}
            getOptionLabel={(option) => getTypeLabel(getObjectId(option))}
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
        return csvFields
            .map((field) => {
                const columnDef: ColDef = {};
                if (field.id === EQUIPMENT_ID) {
                    columnDef.pinned = true;
                }
                columnDef.field = field.id;
                columnDef.headerName = intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : '');
                columnDef.cellRenderer = field.type === BOOLEAN ? BooleanNullableCellRenderer : DefaultCellRenderer;
                return columnDef;
            })
            .concat(
                selectedProperties.map((propertyName: string) => {
                    const columnDef: ColDef = {};
                    columnDef.field = PROPERTY_CSV_COLUMN_PREFIX + propertyName;
                    columnDef.headerName = propertyName;
                    columnDef.cellRenderer = DefaultCellRenderer;
                    return columnDef;
                })
            );
    }, [csvFields, selectedProperties, intl]);

    const onPropertiesChange = (formData: PropertiesFormType) => {
        const newSelectedProperties =
            formData[TABULAR_PROPERTIES]?.filter((property: TabularProperty) => property.selected)?.map(
                (property: TabularProperty) => property.name
            ) ?? [];
        if (newSelectedProperties.toString() !== selectedProperties.toString()) {
            // new columns => reset table
            clearErrors(MODIFICATIONS_TABLE);
            setValue(MODIFICATIONS_TABLE, []);
            setValue(CSV_FILENAME, undefined);
        }
        setValue(TABULAR_PROPERTIES, formData[TABULAR_PROPERTIES], { shouldDirty: true });
    };

    const { handleGenerateFromFilter } = useFilterCsvGenerator({
        dialogMode,
        equipmentType,
        csvColumns,
        commentLines,
    });

    const handleFilterSelectorClose = useCallback(
        (selected?: TreeViewFinderNodeProps[]) => {
            generateFromFilterOpen.setFalse();
            if (selected?.length) {
                handleGenerateFromFilter(selected);
            }
        },
        [handleGenerateFromFilter, generateFromFilterOpen]
    );

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
                        filename={
                            equipmentType +
                            (dialogMode === TabularModificationType.CREATION ? '_creation' : '_modification') +
                            '_template'
                        }
                        disabled={!csvColumns?.length}
                        separator={language === LANG_FRENCH ? ';' : ','}
                    >
                        <Button variant="contained" disabled={!csvColumns?.length}>
                            <FormattedMessage id="GenerateEmptyModel" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        disabled={!equipmentType}
                        onClick={() => prefilledModelDialogOpen.setTrue()}
                    >
                        <FormattedMessage id="GeneratePrefilledModel" />
                    </Button>
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
            <DirectoryItemSelector
                open={generateFromFilterOpen.value}
                onClose={handleFilterSelectorClose}
                types={[ElementType.FILTER]}
                equipmentTypes={[equipmentType]}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect={false}
            />
            <GeneratePrefilledModelDialog
                open={prefilledModelDialogOpen}
                equipmentType={equipmentType}
                onGenerate={onPrefilledModelGenerate}
            />
        </Grid>
    );
}

export default TabularForm;
