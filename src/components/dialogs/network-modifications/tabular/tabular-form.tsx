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
    CustomAgGridTable,
    DefaultCellRenderer,
    DirectoryItemSelector,
    ElementType,
    EquipmentType,
    fetchStudyMetadata,
    FieldConstants,
    getObjectId,
    LANG_FRENCH,
    type MuiStyles,
    NumericEditor,
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
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import Papa from 'papaparse';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
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
import { CellEditingStoppedEvent, ColDef } from 'ag-grid-community';
import { BOOLEAN, ENUM, NUMBER } from '../../../network/constants';
import { TABULAR_CREATION_FIELDS } from './tabular-creation-utils';
import { TABULAR_MODIFICATION_FIELDS } from './tabular-modification-utils';
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
    const { setValue, getValues, clearErrors, setError } = useFormContext();
    const tableRef = useRef<UseFieldArrayReturn<FieldValues, string>>(null);
    const propertiesDialogOpen = useStateBoolean(false);
    const generateFromFilterOpen = useStateBoolean(false);
    const prefilledModelDialogOpen = useStateBoolean(false);
    const language = useSelector((state: AppState) => state.computedLanguage);
    const [predefinedEquipmentProperties, setPredefinedEquipmentProperties] = useState<PredefinedEquipmentProperties>(
        {}
    );
    const [fileWarningMessage, setFileWarningMessage] = useState<string | undefined>();

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

    // Boolean values never raise a blocking error: an invalid one is silently replaced by false
    // (see sanitizeRowValue). When the field is a boolean we only warn the user it was replaced and
    // return true to tell the caller to skip the regular error checks for this cell.
    const handleBooleanValue = useCallback(
        (key: string, value: unknown, fieldDef: TabularField | undefined): boolean => {
            if (fieldDef?.type !== BOOLEAN) {
                return false;
            }
            if (fieldDef.required && !isFieldTypeOk(value, fieldDef)) {
                setFileWarningMessage(
                    intl.formatMessage({ id: 'WrongBooleanValueWarning' }, { field: intl.formatMessage({ id: key }) })
                );
            }
            return true;
        },
        [intl]
    );

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
        (results: Papa.ParseResult<any>) => {
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

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError, setAcceptedFile, resetFile] = useCSVPicker({
        label: dialogMode === TabularModificationType.CREATION ? 'ImportCreations' : 'ImportModifications',
        header: csvColumns,
        disabled: !csvColumns?.length,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

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

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            // Only update modifications table if a valid file upload exists
            if (selectedFile !== undefined) {
                clearErrors(MODIFICATIONS_TABLE);
                setFileWarningMessage(undefined);
                if (dialogMode === TabularModificationType.CREATION) {
                    handleTabularCreationParsingError(results);
                } else {
                    handleTabularModificationParsingError(results);
                }
                // sanitize each cell: drop wrong-format values (kept out of the table) and default
                // mandatory boolean checkboxes to false, so invalid data is never injected.
                const rowsWithUuid = results.data.map((row) => {
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
                tableRef.current?.replace(rowsWithUuid);
                setValue(CSV_FILENAME, selectedFile?.name);
            } else {
                // If the file is undefined we don't update the values because it's outdated
                tableRef.current?.replace([]);
                setValue(CSV_FILENAME, undefined);
            }
            setIsFetching(false);
        },
        [
            clearErrors,
            csvFields,
            dialogMode,
            setValue,
            handleTabularCreationParsingError,
            handleTabularModificationParsingError,
            selectedFile,
        ]
    );

    // Recovery after an invalid CSV import: the import-time validation error is set on the table
    // field, which disables the submit button. We clear that error as soon as the user edits a cell,
    // re-enabling submit. This mirrors commons-ui's onCellEditingStopped (which clears the error from
    // >= 0.236); this branch is pinned to 0.222.0, so we override the handler here and also replicate
    // its row update. The handler is forwarded to the underlying ag-grid through CustomAgGridTable's
    // internal prop spread (it is not part of its public prop type, hence the cast below).
    const handleCellEditingStopped = useCallback(
        (event: CellEditingStoppedEvent) => {
            const rows = (getValues(MODIFICATIONS_TABLE) ?? []) as Record<string, unknown>[];
            const rowIndex = rows.findIndex(
                (row) => row[FieldConstants.AG_GRID_ROW_UUID] === event.data[FieldConstants.AG_GRID_ROW_UUID]
            );
            if (rowIndex === -1) {
                return;
            }
            tableRef.current?.update(rowIndex, event.data);
            clearErrors(MODIFICATIONS_TABLE);
        },
        [clearErrors, getValues]
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
            tableRef.current?.replace([]);
            setValue(CSV_FILENAME, undefined);
            clearErrors(MODIFICATIONS_TABLE);
            setFileWarningMessage(undefined);
            setIsFetching(false);
        } else if (selectedFile && selectedFile.size > 0) {
            setIsFetching(true);
            // @ts-ignore
            Papa.parse(selectedFile as unknown as File, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: (fieldName: string) => {
                    // "property_*" (user added property) columns should remain as strings
                    return !fieldName.startsWith(PROPERTY_CSV_COLUMN_PREFIX);
                },
                comments: '#',
                delimiter: language === LANG_FRENCH ? ';' : ',',
                complete: handleComplete,
                transform: (value: string, field: string | number) => {
                    if (typeof field === 'string' && field.startsWith(PROPERTY_CSV_COLUMN_PREFIX)) {
                        // don't transform property_* columns (user added property), keep them string
                        return value;
                    }
                    return transformIfFrenchNumber(value, language);
                },
            });
        } else if (!selectedFile) {
            // file actually removed (undefined): clear any leftover warning.
            // Note: after a successful import selectedFile is a size-0 placeholder (truthy), which
            // must NOT clear the warning, hence the explicit `!selectedFile` check.
            setFileWarningMessage(undefined);
        }
    }, [clearErrors, handleComplete, intl, selectedFile, selectedFileError, setValue, language, csvFields]);

    const typesOptions = useMemo(() => {
        return Object.keys(
            dialogMode === TabularModificationType.CREATION ? TABULAR_CREATION_FIELDS : TABULAR_MODIFICATION_FIELDS
        );
    }, [dialogMode]);

    const handleTypeChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(MODIFICATIONS_TABLE);
        tableRef.current?.replace([]);
        setValue(CSV_FILENAME, undefined);
        setValue(TABULAR_PROPERTIES, []);
        setFileWarningMessage(undefined);
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
                            <FormattedMessage
                                id={
                                    dialogMode === TabularModificationType.CREATION
                                        ? 'GenerateSkeleton'
                                        : 'GenerateEmptyModel'
                                }
                            />
                        </Button>
                    </CsvDownloader>
                </Grid>
                {dialogMode === TabularModificationType.MODIFICATION && (
                    <Grid item>
                        <Button
                            variant="contained"
                            disabled={!equipmentType}
                            onClick={() => prefilledModelDialogOpen.setTrue()}
                        >
                            <FormattedMessage id="GeneratePrefilledModel" />
                        </Button>
                    </Grid>
                )}
                {selectedFileError && (
                    <Grid item>
                        <Alert severity="error">{selectedFileError}</Alert>
                    </Grid>
                )}
                {fileWarningMessage && (
                    <Grid item>
                        <Alert severity="warning">{fileWarningMessage}</Alert>
                    </Grid>
                )}
            </Grid>
            <Grid item xs={12} sx={dialogStyles.grid}>
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
                    csvProps={undefined}
                    cssProps={{ height: 535 }}
                    // onCellEditingStopped is not part of CustomAgGridTable's public prop type but is
                    // forwarded to the underlying ag-grid through its internal prop spread (see
                    // handleCellEditingStopped), hence the cast.
                    {...({ onCellEditingStopped: handleCellEditingStopped } as object)}
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
            {dialogMode === TabularModificationType.MODIFICATION && (
                <GeneratePrefilledModelDialog
                    open={prefilledModelDialogOpen}
                    equipmentType={equipmentType}
                    onGenerate={onPrefilledModelGenerate}
                />
            )}
        </Grid>
    );
}

export default TabularForm;
