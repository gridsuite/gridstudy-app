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
    CustomAGGrid,
    ErrorInput,
    FieldErrorAlert,
    LANG_FRENCH,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_ID, MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button, Grid } from '@mui/material';
import { TABULAR_MODIFICATION_FIELDS, styles, TabularModificationField } from './tabular-modification-utils';
import { BooleanNullableCellRenderer, DefaultCellRenderer } from 'components/custom-aggrid/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import GridItem from '../../commons/grid-item';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import { AGGRID_LOCALES } from '../../../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import {
    generateCommentLines,
    setFieldTypeError,
    transformIfFrenchNumber,
    isFieldTypeOk,
} from '../tabular-creation/tabular-creation-utils';
import { BOOLEAN } from '../../../network/constants';

export interface TabularModificationFormProps {
    dataFetching: boolean;
}

export function TabularModificationForm({ dataFetching }: Readonly<TabularModificationFormProps>) {
    const intl = useIntl();
    const { snackWarning } = useSnackMessage();
    const [isFetching, setIsFetching] = useState<boolean>(dataFetching);
    const { setValue, clearErrors, setError, getValues } = useFormContext();

    const language = useSelector((state: AppState) => state.computedLanguage);

    const getTypeLabel = useCallback((type: string) => intl.formatMessage({ id: type }), [intl]);

    const equipmentType = useWatch({
        name: TYPE,
    });

    const handleComplete = useCallback(
        (results: Papa.ParseResult<any>) => {
            clearErrors(MODIFICATIONS_TABLE);
            let fieldTypeInError: string = '';
            let expectedTypeForFieldInError: string = '';
            let expectedValues: string[] | undefined;

            // check if the csv contains an error
            if (
                results.data.flatMap(Object.entries).some(([key, value]) => {
                    const fieldDef = TABULAR_MODIFICATION_FIELDS[getValues(TYPE)]?.find((field) => field.id === key);
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

            setValue(MODIFICATIONS_TABLE, results.data, { shouldDirty: true });

            setIsFetching(false);
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
        [clearErrors, setValue, equipmentType, getValues, setError, intl, snackWarning]
    );

    const csvColumns = useMemo(
        () => TABULAR_MODIFICATION_FIELDS[equipmentType]?.map((field: TabularModificationField) => field.id),
        [equipmentType]
    );

    const csvTranslatedColumns = useMemo(() => {
        return TABULAR_MODIFICATION_FIELDS[equipmentType]?.map((field) => {
            return intl.formatMessage({ id: field.id });
        });
    }, [intl, equipmentType]);

    const commentLines = useMemo(() => {
        return generateCommentLines({ csvTranslatedColumns, intl, equipmentType, language, formType: 'Modification' });
    }, [intl, equipmentType, csvTranslatedColumns, language]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, fileErrors] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns,
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
        language: language,
    });

    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    useEffect(() => {
        setIsFetching(dataFetching);
    }, [dataFetching]);

    useEffect(() => {
        if (fileErrors) {
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
                transformHeader: (header: string) => {
                    // transform header to modification field
                    const transformedHeader = TABULAR_MODIFICATION_FIELDS[getValues(TYPE)]?.find(
                        (field) => intl.formatMessage({ id: field.id }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value) => transformIfFrenchNumber(value, language),
            });
        }
    }, [clearErrors, getValues, handleComplete, intl, selectedFile, fileErrors, setValue, language]);

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

    const limitSetModificationsdefaultColDef = useMemo(
        () => ({
            resizable: false,
            wrapHeaderText: true,
            lockPinned: true,
            autoHeaderHeight: true,
            sortable: true,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const limitSetModificationsColumnDefs = useMemo(() => {
        return TABULAR_MODIFICATION_FIELDS[equipmentType]?.map((field) => {
            const columnDef: ColDef = {};
            if (field.id === EQUIPMENT_ID) {
                columnDef.pinned = true;
            }
            columnDef.field = field.id;
            columnDef.headerName = intl.formatMessage({ id: field.id });
            columnDef.cellRenderer = field.type === BOOLEAN ? BooleanNullableCellRenderer : DefaultCellRenderer;
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
                        filename={equipmentType + '_modification_template'}
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
                    {fileErrors && <Alert severity="error">{fileErrors}</Alert>}
                </Grid>
            </Grid>
            <Grid item xs={12} sx={styles.grid}>
                <CustomAGGrid
                    defaultColDef={limitSetModificationsdefaultColDef}
                    loading={isFetching}
                    columnDefs={limitSetModificationsColumnDefs}
                    pagination
                    paginationPageSize={100}
                    rowData={watchTable}
                    suppressDragLeaveHidesColumns
                    overrideLocales={AGGRID_LOCALES}
                />
            </Grid>
        </Grid>
    );
}

export default TabularModificationForm;
