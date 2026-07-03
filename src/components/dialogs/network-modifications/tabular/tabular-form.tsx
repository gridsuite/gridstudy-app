/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { type FieldValues, type UseFieldArrayReturn, useFormContext, useWatch } from 'react-hook-form';
import {
    AutocompleteInput,
    type CsvProps,
    CsvPicker,
    CustomAgGridTable,
    DefaultCellRenderer,
    DirectoryItemSelector,
    ElementType,
    EquipmentType,
    fetchStudyMetadata,
    FieldConstants,
    hasNonEmptyRows,
    InputWithPopupConfirmation,
    NumericEditor,
    suppressNonNumericKeyboardEvent,
    type TreeViewFinderNodeProps,
    useSnackMessage,
    useStateBoolean,
} from '@gridsuite/commons-ui';
import { v4 as uuid4 } from 'uuid';
import {
    CSV_FILENAME,
    EQUIPMENT_ID,
    MODIFICATIONS_TABLE,
    TABULAR_PROPERTIES,
    TYPE,
} from 'components/utils/field-constants';
import { Alert, Button, Grid2 as Grid, Stack } from '@mui/material';
import Papa from 'papaparse';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer.type';
import DefinePropertiesDialog from './properties/define-properties-dialog';
import { PropertiesFormType, PROPERTY_CSV_COLUMN_PREFIX, TabularProperty } from './properties/property-utils';
import {
    generateCommentLines,
    isFieldTypeOk,
    PredefinedEquipmentProperties,
    sanitizeRowValue,
    setFieldTypeError,
    TabularField,
    TabularModificationType,
    transformIfFrenchNumber,
} from './tabular-common';
import { ColDef } from 'ag-grid-community';
import { BOOLEAN, ENUM, NUMBER } from '../../../network/constants';
import { TABULAR_CREATION_FIELDS } from './tabular-creation-utils';
import { TABULAR_MODIFICATION_FIELDS } from './tabular-modification-utils';
import { useFilterCsvGenerator } from './use-filter-csv-generator';
import { usePrefilledModelGenerator } from './generation/use-prefilled-model-generator';
import GeneratePrefilledModelDialog from './generation/generate-prefilled-model-dialog';
import { PrefilledModelGenerationParams } from './generation/utils';

export interface TabularFormProps {
    dataFetching: boolean;
    dialogMode: TabularModificationType;
}

export function TabularForm({ dataFetching, dialogMode }: Readonly<TabularFormProps>) {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const { setValue, clearErrors, setError, getValues } = useFormContext();
    const tableRef = useRef<UseFieldArrayReturn<FieldValues, string>>(null);
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
    const watchFileName = useWatch({
        name: CSV_FILENAME,
    });

    const csvFields = useMemo(() => {
        const fields =
            dialogMode === TabularModificationType.CREATION ? TABULAR_CREATION_FIELDS : TABULAR_MODIFICATION_FIELDS;
        return fields[equipmentType as EquipmentType] ?? [];
    }, [equipmentType, dialogMode]);

    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [fileErrorMessage, setFileErrorMessage] = useState<string | undefined>();
    const [fileWarningMessage, setFileWarningMessage] = useState<string | undefined>();

    const parseConfig = useMemo<Partial<Papa.ParseConfig<Record<string, unknown>>>>(
        () => ({
            dynamicTyping: (field: string | number) =>
                // "property_*" (user added property) columns should remain as strings
                typeof field !== 'string' || !field.startsWith(PROPERTY_CSV_COLUMN_PREFIX),
            transform: (value: string, field: string | number) => {
                if (typeof field === 'string' && field.startsWith(PROPERTY_CSV_COLUMN_PREFIX)) {
                    // don't transform property_* columns (user added property), keep them string
                    return value;
                }
                return transformIfFrenchNumber(value, language);
            },
        }),
        [language]
    );

    // Boolean values never raise a blocking error: an invalid one is silently replaced by false
    // (see sanitizeRowValue). When the field is a boolean we only warn the user it was replaced and
    // return true to tell the caller to skip the regular error checks for this cell.
    const handleBooleanValue = useCallback(
        (key: string, value: unknown, fieldDef: TabularField | undefined): boolean => {
            if (fieldDef?.type !== BOOLEAN) {
                return false;
            }
            if (!isFieldTypeOk(value, fieldDef)) {
                setFileWarningMessage(
                    intl.formatMessage({ id: 'WrongBooleanValueWarning' }, { field: intl.formatMessage({ id: key }) })
                );
            }
            return true;
        },
        [intl]
    );

    const handleTabularCreationParsingError = useCallback(
        (results: Papa.ParseResult<Record<string, unknown>>) => {
            let requiredFieldNameInError: string = '';
            let requiredDependantFieldNameInError: string = '';
            let dependantFieldNameInError: string = '';
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if (
                results.data
                    .flatMap((result) =>
                        Object.entries(result).map(([key, value]): [Record<string, unknown>, string, unknown] => [
                            result,
                            key,
                            value,
                        ])
                    )
                    .some(([result, key, value]) => {
                        const fieldDef = csvFields.find((field) => field.id === key);
                        // boolean fields never raise a blocking error (see handleBooleanValue)
                        if (handleBooleanValue(key, value, fieldDef)) {
                            return false; // keep looking
                        }
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
                equipmentType === EquipmentType.SHUNT_COMPENSATOR &&
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
        [csvFields, equipmentType, handleBooleanValue, intl, setError, snackWarning]
    );

    const handleTabularModificationParsingError = useCallback(
        (results: Papa.ParseResult<Record<string, unknown>>) => {
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if (
                results.data.flatMap(Object.entries).some(([key, value]) => {
                    const fieldDef = csvFields.find((field) => field.id === key);
                    // boolean fields never raise a blocking error (see handleBooleanValue)
                    if (handleBooleanValue(key, value, fieldDef)) {
                        return false; // keep looking
                    }
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
                equipmentType === EquipmentType.SHUNT_COMPENSATOR &&
                results.data.some(
                    (modification) =>
                        modification.maxSusceptance != null &&
                        (modification.shuntCompensatorType || modification.maxQAtNominalV != null)
                )
            ) {
                snackWarning({ messageId: 'TabularModificationShuntWarning' });
            }
        },
        [equipmentType, csvFields, handleBooleanValue, setError, intl, snackWarning]
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

    const getTemplateData = useCallback(() => [csvColumns, ...commentLines], [csvColumns, commentLines]);

    const getTableData = useCallback(() => {
        const rows = (getValues(MODIFICATIONS_TABLE) ?? []) as Record<string, unknown>[];
        return [...getTemplateData(), ...rows.map((row) => csvColumns.map((col) => row[col] ?? ''))];
    }, [csvColumns, getValues, getTemplateData]);

    const csvProps = useMemo<CsvProps>(
        () => ({
            fileName:
                equipmentType +
                (dialogMode === TabularModificationType.CREATION ? '_creation' : '_modification') +
                '_template',
            language,
            getTemplateData,
            getTableData,
            extraButtons:
                dialogMode === TabularModificationType.MODIFICATION ? (
                    <Button
                        variant="outlined"
                        onClick={() => prefilledModelDialogOpen.setTrue()}
                        disabled={!equipmentType}
                    >
                        <FormattedMessage id="GeneratePrefilledModel" />
                    </Button>
                ) : undefined,
        }),
        [equipmentType, dialogMode, language, getTemplateData, getTableData, prefilledModelDialogOpen]
    );

    const { handleGeneratePrefilledModel } = usePrefilledModelGenerator({
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

    const getDataFromCsvFile = useCallback(
        (results: Papa.ParseResult<Record<string, unknown>>, file: File) => {
            clearErrors(MODIFICATIONS_TABLE);
            setFileWarningMessage(undefined);
            if (dialogMode === TabularModificationType.CREATION) {
                handleTabularCreationParsingError(results);
            } else {
                handleTabularModificationParsingError(results);
            }
            setValue(CSV_FILENAME, file.name);
            // sanitize each cell: drop wrong-format values (kept out of the table) and default
            // mandatory boolean checkboxes to false, so invalid data is never injected.
            return results.data.map((row) => {
                const sanitizedRow: Record<string, unknown> = {
                    [FieldConstants.AG_GRID_ROW_UUID]: uuid4(),
                };
                Object.entries(row).forEach(([key, value]) => {
                    sanitizedRow[key] = sanitizeRowValue(
                        value,
                        csvFields.find((field) => field.id === key)
                    );
                });
                return sanitizedRow;
            });
        },
        [
            clearErrors,
            csvFields,
            dialogMode,
            handleTabularCreationParsingError,
            handleTabularModificationParsingError,
            setValue,
        ]
    );

    useEffect(() => {
        fetchStudyMetadata().then((studyMetadata) => {
            setPredefinedEquipmentProperties(studyMetadata?.predefinedEquipmentProperties ?? {});
        });
    }, []);

    useEffect(() => {
        setSelectedFile(watchFileName ? new File([], watchFileName) : undefined);
    }, [watchFileName]);

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    const typesOptions = useMemo(() => {
        return Object.keys(
            dialogMode === TabularModificationType.CREATION ? TABULAR_CREATION_FIELDS : TABULAR_MODIFICATION_FIELDS
        );
    }, [dialogMode]);

    const handleChangeType = useCallback(() => {
        clearErrors(MODIFICATIONS_TABLE);
        tableRef.current?.replace([]);
        setValue(CSV_FILENAME, undefined);
        setValue(TABULAR_PROPERTIES, []);
        setSelectedFile(undefined);
        setFileErrorMessage(undefined);
        setFileWarningMessage(undefined);
    }, [clearErrors, setValue]);

    const equipmentTypeField = (
        <InputWithPopupConfirmation
            Input={AutocompleteInput}
            name={TYPE}
            label="Type"
            options={typesOptions}
            getOptionLabel={(option: string) => getTypeLabel(option)}
            size={'small'}
            formProps={{ variant: 'outlined' }}
            shouldOpenPopup={() => hasNonEmptyRows(getValues(MODIFICATIONS_TABLE))}
            resetOnConfirmation={handleChangeType}
            message="changeTypeMessage"
            validateButtonLabel="button.changeType"
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
                const columnDef: ColDef = {
                    field: field.id,
                    headerName: intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : ''),
                    editable: true,
                    singleClickEdit: true,
                };
                if (field.id === EQUIPMENT_ID) {
                    columnDef.pinned = true;
                }
                // Force the cell data type from the field definition instead of relying on AG Grid's
                // type inference from the data: inference is per-column and based on the cell values,
                // so a CSV providing unexpected values (e.g. 0/1 in a boolean column) would mistype the
                // whole column (numbers/text instead of checkboxes, and vice versa).
                switch (field.type) {
                    case BOOLEAN:
                        columnDef.cellDataType = BOOLEAN;
                        break;
                    case NUMBER:
                        columnDef.cellDataType = NUMBER;
                        columnDef.cellEditor = NumericEditor;
                        columnDef.suppressKeyboardEvent = suppressNonNumericKeyboardEvent;
                        break;
                    case ENUM:
                        columnDef.cellDataType = 'text';
                        columnDef.cellEditor = 'agSelectCellEditor';
                        columnDef.cellEditorParams = { values: [null, ...(field.options ?? [])] };
                        break;
                    default:
                        break;
                }
                return columnDef;
            })
            .concat(
                selectedProperties.map((propertyName: string) => ({
                    field: PROPERTY_CSV_COLUMN_PREFIX + propertyName,
                    headerName: propertyName,
                    // property values are always kept as strings (see parseConfig)
                    cellDataType: 'text',
                    editable: true,
                    singleClickEdit: true,
                }))
            );
    }, [csvFields, selectedProperties, intl]);

    const makeDefaultRowData = useCallback(() => {
        const row: Record<string, any> = { [FieldConstants.AG_GRID_ROW_UUID]: uuid4() };
        csvFields.forEach((field) => {
            row[field.id] = null;
        });
        selectedProperties.forEach((propertyName) => {
            row[PROPERTY_CSV_COLUMN_PREFIX + propertyName] = '';
        });
        return row;
    }, [csvFields, selectedProperties]);

    const onPropertiesChange = (formData: PropertiesFormType) => {
        const newSelectedProperties =
            formData[TABULAR_PROPERTIES]?.filter((property: TabularProperty) => property.selected)?.map(
                (property: TabularProperty) => property.name
            ) ?? [];
        if (newSelectedProperties.toString() !== selectedProperties.toString()) {
            // new columns => reset table
            clearErrors(MODIFICATIONS_TABLE);
            tableRef.current?.replace([]);
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
        <Stack spacing={2} paddingTop={1} sx={{ height: '100%' }}>
            <Grid sx={{ width: 400, maxWidth: '100%' }}>{equipmentTypeField}</Grid>
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid>
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
                <Grid>
                    <CsvPicker<Record<string, unknown>>
                        label="UploadCSV"
                        header={csvColumns}
                        disabled={!equipmentType}
                        language={language}
                        parseConfig={parseConfig}
                        selectedFile={selectedFile}
                        onFileChange={setSelectedFile}
                        onFileError={setFileErrorMessage}
                        getTableData={() => getValues(MODIFICATIONS_TABLE)}
                        onReplace={(results, file) => tableRef.current?.replace(getDataFromCsvFile(results, file))}
                        onAppend={(results, file) => tableRef.current?.append(getDataFromCsvFile(results, file))}
                    />
                </Grid>
            </Grid>
            {fileErrorMessage && (
                <Grid>
                    <Alert severity="error">{fileErrorMessage}</Alert>
                </Grid>
            )}
            {fileWarningMessage && (
                <Grid>
                    <Alert severity="warning">{fileWarningMessage}</Alert>
                </Grid>
            )}
            {equipmentType && (
                <Grid sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <CustomAgGridTable
                        ref={tableRef}
                        name={MODIFICATIONS_TABLE}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        makeDefaultRowData={makeDefaultRowData}
                        loading={isFetching}
                        pagination
                        rowSelection={{
                            mode: 'multiRow',
                        }}
                        overrideLocales={AGGRID_LOCALES}
                        csvProps={csvProps}
                    />
                </Grid>
            )}
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
            {dialogMode === TabularModificationType.MODIFICATION && (
                <GeneratePrefilledModelDialog
                    open={prefilledModelDialogOpen}
                    equipmentType={equipmentType}
                    onGenerate={onPrefilledModelGenerate}
                />
            )}
        </Stack>
    );
}

export default TabularForm;
