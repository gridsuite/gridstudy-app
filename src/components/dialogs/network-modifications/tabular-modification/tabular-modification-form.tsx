/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, useWatch } from 'react-hook-form';
import {
    AutocompleteInput,
    ErrorInput,
    FieldErrorAlert,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { gridItem } from 'components/dialogs/dialogUtils';
import { MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button } from '@mui/material';
import {
    TABULAR_MODIFICATION_FIELDS,
    styles,
} from './tabular-modification-utils';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import {
    BooleanNullableCellRenderer,
    DefaultCellRenderer,
} from 'components/spreadsheet/utils/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community/dist/lib/main';

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
                        (modification.shuntCompensatorType ||
                            modification.maxQAtNominalV)
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
        return TABULAR_MODIFICATION_FIELDS[watchType]?.map((field) => {
            return intl.formatMessage({ id: field });
        });
    }, [intl, watchType]);

    const explanationComment = useMemo(() => {
        switch (watchType) {
            case EQUIPMENT_TYPES.GENERATOR:
                return intl.formatMessage({
                    id: 'TabularModificationGeneratorSkeletonComment',
                });
            case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
                return intl.formatMessage({
                    id: 'TabularModificationShuntSkeletonComment',
                });
            case EQUIPMENT_TYPES.LOAD:
                return intl.formatMessage({
                    id: 'TabularModificationLoadSkeletonComment',
                });
            default:
                return '';
        }
    }, [intl, watchType]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns,
        maxTapNumber: undefined,
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
                    const transformedHeader = TABULAR_MODIFICATION_FIELDS[
                        getValues(TYPE)
                    ]?.find(
                        (field) => intl.formatMessage({ id: field }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value) => value.trim(),
            });
        }
    }, [
        clearErrors,
        getValues,
        handleComplete,
        intl,
        selectedFile,
        selectedFileError,
        setValue,
    ]);

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
            getOptionLabel={(option) => getTypeLabel(option as string)}
            size={'small'}
            formProps={{ variant: 'filled' }}
        />
    );

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
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
            if (field === 'equipmentId') {
                columnDef.pinned = true;
            }
            columnDef.field = field;
            columnDef.headerName = intl.formatMessage({ id: field });
            if (field === 'voltageRegulationOn') {
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
                {gridItem(equipmentTypeField, 4)}
                <Grid item>{FileField}</Grid>
            </Grid>
            <Grid container item spacing={2} alignItems={'center'}>
                <Grid item>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={[[explanationComment]]}
                        filename={watchType + '_skeleton'}
                    >
                        <Button variant="contained" disabled={!csvColumns}>
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    <ErrorInput
                        name={MODIFICATIONS_TABLE}
                        InputField={FieldErrorAlert}
                    />
                    {selectedFileError && (
                        <Alert severity="error">{selectedFileError}</Alert>
                    )}
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
