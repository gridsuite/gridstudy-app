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
import { AutocompleteInput } from '@gridsuite/commons-ui';
import { gridItem } from 'components/dialogs/dialogUtils';
import { MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { useCSVPicker } from 'components/utils/inputs/input-hooks';
import CsvDownloader from 'react-csv-downloader';
import { Alert, Button } from '@mui/material';
import {
    Modification,
    TABULAR_MODIFICATION_FIELDS,
    styles,
} from './tabular-modification-utils';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import { DefaultCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community/dist/lib/main';

const richTypeEquals = (a: any, b: any) => a === b;

const TabularModificationForm = () => {
    const intl = useIntl();

    const { setValue } = useFormContext();

    const richTypeLabel = (rt: any) => {
        return intl.formatMessage({ id: rt });
    };

    const watchType = useWatch({
        name: TYPE,
    });

    const csvColumns = useMemo(() => {
        return TABULAR_MODIFICATION_FIELDS[watchType]?.map((field) => {
            return intl.formatMessage({ id: field });
        });
    }, [intl, watchType]);

    const [typeChangedTrigger, setTypeChangedTrigger] = useState(false);
    const [selectedFile, FileField, selectedFileError] = useCSVPicker({
        label: 'ImportModifications',
        header: csvColumns,
        maxTapNumber: undefined,
        disabled: !csvColumns,
        resetTrigger: typeChangedTrigger,
    });

    const postProcessFile = useCallback(
        (fileData: any) => {
            fileData = fileData.map((row: any) => {
                const modification: Modification = {};
                Object.getOwnPropertyNames(row).forEach((key) => {
                    modification[key] = row[key];
                });
                return modification;
            });
            setValue(MODIFICATIONS_TABLE, fileData, { shouldDirty: true });
        },
        [setValue]
    );

    const watchTable = useWatch({
        name: MODIFICATIONS_TABLE,
    });

    useEffect(() => {
        if (selectedFileError) {
            setValue(MODIFICATIONS_TABLE, []);
        } else if (selectedFile) {
            Papa.parse(selectedFile as any, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    postProcessFile(results.data);
                },
            });
        }
    }, [postProcessFile, selectedFile, selectedFileError, setValue]);

    const typesOptions = useMemo(() => {
        const equipmentTypesToExclude = new Set([
            EQUIPMENT_TYPES.SWITCH,
            EQUIPMENT_TYPES.LCC_CONVERTER_STATION,
            EQUIPMENT_TYPES.VSC_CONVERTER_STATION,
            EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR,
            EQUIPMENT_TYPES.DANGLING_LINE,
            EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
            EQUIPMENT_TYPES.HVDC_LINE,
            EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
            EQUIPMENT_TYPES.SUBSTATION,
            EQUIPMENT_TYPES.VOLTAGE_LEVEL,
            EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
            EQUIPMENT_TYPES.LINE,
            EQUIPMENT_TYPES.BATTERY,
        ]);
        return Object.values(EQUIPMENT_TYPES).filter(
            (equipmentType) => !equipmentTypesToExclude.has(equipmentType)
        );
    }, []);

    const handleChange = useCallback(() => {
        setTypeChangedTrigger(!typeChangedTrigger);
        setValue(MODIFICATIONS_TABLE, []);
    }, [setValue, typeChangedTrigger]);

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
            const translatedField = intl.formatMessage({ id: field });
            colunmDef.field = translatedField;
            colunmDef.headerName = translatedField;
            colunmDef.cellRenderer = DefaultCellRenderer;
            return colunmDef;
        });
    }, [intl, watchType]);

    return (
        <>
            <Grid container spacing={2} direction={'row'}>
                <Grid container item spacing={2} alignItems={'center'}>
                    {gridItem(equipmentTypeField, 4)}
                    <Grid item>{FileField}</Grid>
                </Grid>
                <Grid item>
                    <CsvDownloader
                        columns={csvColumns}
                        datas={[]}
                        filename={watchType + '_skeleton'}
                    >
                        <Button variant="contained">
                            <FormattedMessage id="GenerateSkeleton" />
                        </Button>
                    </CsvDownloader>
                </Grid>
                <Grid item>
                    {selectedFile && selectedFileError && (
                        <Alert severity="error">{selectedFileError}</Alert>
                    )}
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
        </>
    );
};

export default TabularModificationForm;
