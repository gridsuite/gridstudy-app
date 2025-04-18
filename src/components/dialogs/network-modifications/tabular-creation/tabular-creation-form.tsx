/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, CustomAGGrid, ErrorInput, FieldErrorAlert } from '@gridsuite/commons-ui';
import {
    CONNECTED,
    EQUIPMENT_ID,
    CREATIONS_TABLE,
    TYPE,
    VOLTAGE_REGULATION_ON,
    FREQUENCY_REGULATION,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { TABULAR_CREATION_FIELDS, styles, TabularCreationField } from './tabular-creation-utils';
import { BooleanNullableCellRenderer, DefaultCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';

const TabularCreationForm = () => {
    const intl = useIntl();

    const { setValue, clearErrors, setError, getValues } = useFormContext();

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(CREATIONS_TABLE);
            // check required fields are defined
            let fieldNameInError: string = '';
            results.data.every((result) => {
                Object.keys(result).every((key) => {
                    const found = TABULAR_CREATION_FIELDS[getValues(TYPE)]?.find((field) => {
                        return field.id === key;
                    });
                    if (found !== undefined && found.required && (result[key] === undefined || result[key] === null)) {
                        fieldNameInError = key;
                        return false;
                    }
                    return true;
                });
                return fieldNameInError !== '';
            });
            setValue(CREATIONS_TABLE, results.data, {
                shouldDirty: true,
            });
            if (fieldNameInError !== '') {
                setError(CREATIONS_TABLE, {
                    type: 'custom',
                    message:
                        intl.formatMessage({
                            id: 'FieldRequired',
                        }) +
                        intl.formatMessage({
                            id: fieldNameInError,
                        }),
                });
            }
        },
        [clearErrors, setValue, getValues, setError, intl]
    );

    const watchType = useWatch({
        name: TYPE,
    });

    const csvColumns = useMemo(() => {
        return TABULAR_CREATION_FIELDS[watchType]?.map((field: TabularCreationField) => {
            return field.id;
        });
    }, [watchType]);

    const csvTranslatedColumns = useMemo(() => {
        return TABULAR_CREATION_FIELDS[watchType]?.map((field) => {
            return intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : '');
        });
    }, [intl, watchType]);

    const commentLines = useMemo(() => {
        let commentData: string[][] = [];
        if (csvTranslatedColumns) {
            // First comment line contains header translation
            commentData.push(['#' + csvTranslatedColumns.join(',')]);
            if (!!intl.messages['TabularCreationSkeletonComment.' + watchType]) {
                // Optionally a second comment line, if present in translation file
                commentData.push([
                    intl.formatMessage({
                        id: 'TabularCreationSkeletonComment.' + watchType,
                    }),
                ]);
            }
        }
        return commentData;
    }, [intl, watchType, csvTranslatedColumns]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportCreations',
        header: csvColumns,
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
    });

    const watchTable = useWatch({
        name: CREATIONS_TABLE,
    });

    useEffect(() => {
        if (selectedFileError) {
            setValue(CREATIONS_TABLE, []);
            clearErrors(CREATIONS_TABLE);
        } else if (selectedFile) {
            // @ts-ignore
            Papa.parse(selectedFile as unknown as File, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                comments: '#',
                complete: handleComplete,
                transformHeader: (header: string) => {
                    // transform header to creation field
                    const transformedHeader = TABULAR_CREATION_FIELDS[getValues(TYPE)]?.find(
                        (field) => intl.formatMessage({ id: field.id }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value) => value.trim(),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue]);

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
        return TABULAR_CREATION_FIELDS[watchType]?.map((field) => {
            const columnDef: ColDef = {};
            if (field.id === EQUIPMENT_ID) {
                columnDef.pinned = true;
            }
            columnDef.field = field.id;
            columnDef.headerName = intl.formatMessage({ id: field.id }) + (field.required ? ' (*)' : '');
            if (field.id === VOLTAGE_REGULATION_ON || field.id === CONNECTED || field.id === FREQUENCY_REGULATION) {
                columnDef.cellRenderer = BooleanNullableCellRenderer;
            } else {
                columnDef.cellRenderer = DefaultCellRenderer;
            }
            return columnDef;
        });
    }, [intl, watchType]);

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
                        filename={watchType + '_skeleton'}
                        disabled={!csvColumns}
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
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    pagination
                    paginationPageSize={100}
                    suppressDragLeaveHidesColumns
                />
            </Grid>
        </Grid>
    );
};

export default TabularCreationForm;
