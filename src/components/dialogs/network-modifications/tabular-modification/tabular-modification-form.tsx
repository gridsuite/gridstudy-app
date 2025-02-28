/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import { AutocompleteInput, CustomAGGrid, ErrorInput, FieldErrorAlert, useSnackMessage } from '@gridsuite/commons-ui';
import {
    CONNECTED,
    CONNECTED1,
    CONNECTED2,
    EQUIPMENT_ID,
    MODIFICATIONS_TABLE,
    TYPE,
    VOLTAGE_REGULATION_ON,
} from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { TABULAR_MODIFICATION_FIELDS, styles } from './tabular-modification-utils';
import { BooleanNullableCellRenderer, DefaultCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';

const TabularModificationForm = () => {
    const intl = useIntl();

    const { snackWarning } = useSnackMessage();

    const { setValue, clearErrors, getValues } = useFormContext();

    const getTypeLabel = useCallback(
        (type: string) =>
            type === EQUIPMENT_TYPES.SHUNT_COMPENSATOR
                ? intl.formatMessage({
                      id: 'linearShuntCompensators',
                  })
                : intl.formatMessage({ id: type }),
        [intl]
    );

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(MODIFICATIONS_TABLE);
            setValue(MODIFICATIONS_TABLE, results.data, {
                shouldDirty: true,
            });
            // For shunt compensators, display warning message if maxSusceptance is modified along with shuntCompensatorType or maxQAtNominalV
            if (
                results.data.some(
                    (modification) =>
                        modification.maxSusceptance &&
                        (modification.shuntCompensatorType || modification.maxQAtNominalV)
                )
            ) {
                snackWarning({
                    messageId: 'TabularModificationShuntWarning',
                });
            }
        },
        [clearErrors, setValue, snackWarning]
    );

    const watchType = useWatch({
        name: TYPE,
    });

    const csvColumns = useMemo(() => {
        return TABULAR_MODIFICATION_FIELDS[watchType];
    }, [watchType]);

    const csvTranslatedColumns = useMemo(() => {
        return TABULAR_MODIFICATION_FIELDS[watchType]?.map((field) => {
            return intl.formatMessage({ id: field });
        });
    }, [intl, watchType]);

    const commentLines = useMemo(() => {
        let commentData: string[][] = [];
        if (csvTranslatedColumns) {
            // First comment line contains header translation
            commentData.push(['#' + csvTranslatedColumns.join(',')]);
            if (!!intl.messages['TabularModificationSkeletonComment.' + watchType]) {
                // Optionally a second comment line, if present in translation file
                commentData.push([
                    intl.formatMessage({
                        id: 'TabularModificationSkeletonComment.' + watchType,
                    }),
                ]);
            }
        }
        return commentData;
    }, [intl, watchType, csvTranslatedColumns]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns,
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
    });

    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    useEffect(() => {
        if (selectedFileError) {
            setValue(MODIFICATIONS_TABLE, []);
            clearErrors(MODIFICATIONS_TABLE);
        } else if (selectedFile) {
            Papa.parse(selectedFile as unknown as File, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                comments: '#',
                complete: handleComplete,
                transformHeader: (header: string) => {
                    // transform header to modification field
                    const transformedHeader = TABULAR_MODIFICATION_FIELDS[getValues(TYPE)]?.find(
                        (field) => intl.formatMessage({ id: field }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value) => value.trim(),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue]);

    const typesOptions = useMemo(() => {
        //only available types for tabular modification
        return Object.keys(TABULAR_MODIFICATION_FIELDS).filter(
            (type) => EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES]
        );
    }, []);

    const handleChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        clearErrors(MODIFICATIONS_TABLE);
        setValue(MODIFICATIONS_TABLE, []);
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
        return TABULAR_MODIFICATION_FIELDS[watchType]?.map((field) => {
            const columnDef: ColDef = {};
            if (field === EQUIPMENT_ID) {
                columnDef.pinned = true;
            }
            columnDef.field = field;
            columnDef.headerName = intl.formatMessage({ id: field });
            if (
                field === VOLTAGE_REGULATION_ON ||
                field === CONNECTED ||
                field === CONNECTED1 ||
                field === CONNECTED2
            ) {
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
                    <ErrorInput name={MODIFICATIONS_TABLE} InputField={FieldErrorAlert} />
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

export default TabularModificationForm;
