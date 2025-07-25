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
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { AMOUNT_TEMPORARY_LIMITS, EQUIPMENT_ID, MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { DefaultCellRenderer } from 'components/custom-aggrid/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { generateLimitSetCommentLines, transformIfFrenchNumber } from '../tabular-creation/tabular-creation-utils';
import {
    LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS,
    LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS,
    LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS,
    styles,
} from '../tabular-modification/tabular-modification-utils';

export interface TabularModificationFormProps {
    dataFetching: boolean;
}

type RepeatableColumn = {
    id: string;
    name?: string;
    index?: number;
};

export function LimitSetsTabularModificationForm({ dataFetching }: Readonly<TabularModificationFormProps>) {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const [repeatableColumns, setReapeatableColumns] = useState<RepeatableColumn[]>([]);

    const { setValue, clearErrors, getValues, trigger } = useFormContext();

    const language = useSelector((state: AppState) => state.computedLanguage);

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(MODIFICATIONS_TABLE);
            setValue(MODIFICATIONS_TABLE, results.data, {
                shouldDirty: true,
            });
            setIsFetching(false);
            // For shunt compensators, display a warning message if maxSusceptance is modified along with shuntCompensatorType or maxQAtNominalV
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

    const equipmentType = useWatch({
        name: TYPE,
    });

    const amountTemporaryLimits = useWatch({
        name: AMOUNT_TEMPORARY_LIMITS,
    });

    const computeRepeatableColumns = useCallback(() => {
        const columns: RepeatableColumn[] = [];
        trigger(AMOUNT_TEMPORARY_LIMITS).then((valid) => {
            if (valid) {
                for (let i = 1; i <= amountTemporaryLimits; i++) {
                    LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS.forEach((field) =>
                        columns.push({
                            id: field + i,
                            name: field,
                            index: i,
                        })
                    );
                }
                setReapeatableColumns(columns);
            }
        });
    }, [amountTemporaryLimits, trigger]);

    const csvColumns = useMemo<RepeatableColumn[]>(() => {
        return [...LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS.map((id) => ({ id: id })), ...repeatableColumns];
    }, [repeatableColumns]);

    const csvTranslatedColumns = useMemo(() => {
        return LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS.map((field) => {
            return intl.formatMessage({ id: field });
        });
    }, [intl]);

    const commentLines = useMemo(() => {
        return generateLimitSetCommentLines({
            csvTranslatedColumns,
            intl,
            language,
        });
    }, [intl, csvTranslatedColumns, language]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns.map((column) => column.id),
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    useEffect(() => {
        computeRepeatableColumns();
    }, [computeRepeatableColumns]);

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
                        (field) => intl.formatMessage({ id: field }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value) => transformIfFrenchNumber(value, language),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, selectedFileError, setValue, language]);

    const typesOptions = useMemo(() => {
        //only available types for tabular modification
        return Object.keys(LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS).filter(
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

    const columnDefs = useMemo<ColDef[]>(
        () =>
            csvColumns.map(({ id, name, index }) => ({
                field: id,
                pinned: id === EQUIPMENT_ID ? true : undefined,
                headerName: `${intl.formatMessage({ id: name ?? id })} ${index ?? ''}`,
                cellRenderer: DefaultCellRenderer,
            })),
        [csvColumns, intl]
    );

    return (
        <Grid container spacing={2} direction={'row'}>
            <Grid container item spacing={2} alignItems={'center'}>
                <GridItem size={4}>{equipmentTypeField}</GridItem>
                <Grid item>{FileField}</Grid>
            </Grid>
            <Grid container item spacing={2}>
                <Grid item>
                    <IntegerInput name={AMOUNT_TEMPORARY_LIMITS} label={'amountTemporaryLimits'} />
                </Grid>
                <GridItem>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={commentLines}
                        filename={equipmentType + '_modification_template'}
                        disabled={!csvColumns}
                        separator={language === LANG_FRENCH ? ';' : ','}
                    >
                        <Button variant="contained" disabled={!csvColumns}>
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </GridItem>
            </Grid>
            <Grid container item spacing={2} alignItems={'center'}>
                <Grid item>
                    <ErrorInput name={MODIFICATIONS_TABLE} InputField={FieldErrorAlert} />
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
