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
import { richTypeEquals } from 'components/utils/utils';
import { getIdOrValue } from '../../commons/utils';

const TabularModificationForm = () => {
    const intl = useIntl();

    const { setValue, clearErrors, getValues } = useFormContext();

    const richTypeLabel = (rt: { id: string; label: string } | string) => {
        return intl.formatMessage({ id: getIdOrValue(rt) });
    };

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
            case EQUIPMENT_TYPES.LOAD:
                return '';
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
                complete: (results: Papa.ParseResult<object>) => {
                    clearErrors(MODIFICATIONS_TABLE);
                    setValue(MODIFICATIONS_TABLE, results.data, {
                        shouldDirty: true,
                    });
                },
                transformHeader: (header: string) => {
                    // transform header to modification field
                    const transformedHeader = TABULAR_MODIFICATION_FIELDS[
                        getValues(TYPE)
                    ]?.find(
                        (field) => intl.formatMessage({ id: field }) === header
                    );
                    return transformedHeader ?? header;
                },
                transform: (value: string) => {
                    // transform oui/non to boolean
                    if (value === 'oui') {
                        return true;
                    } else if (value === 'non') {
                        return false;
                    }
                    return value;
                },
            });
        }
    }, [
        clearErrors,
        getValues,
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
            isOptionEqualToValue={richTypeEquals}
            name={TYPE}
            label="Type"
            options={typesOptions}
            onChangeCallback={handleChange}
            getOptionLabel={richTypeLabel}
            size={'small'}
            formProps={{ variant: 'filled' }}
        />
    );

    const defaultColDef = useMemo(
        () => ({
            flex: 1,
            filter: true,
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
            const colunmDef: ColDef = {};
            if (field === 'equipmentId') {
                colunmDef.pinned = true;
            }
            colunmDef.field = field;
            colunmDef.headerName = intl.formatMessage({ id: field });
            if (field === 'voltageRegulationOn') {
                colunmDef.cellRenderer = BooleanNullableCellRenderer;
            } else {
                colunmDef.cellRenderer = DefaultCellRenderer;
            }
            return colunmDef;
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
