/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    useCallback,
    useRef,
    useMemo,
    useEffect,
    useState,
} from 'react';
import { CustomAGGrid } from '../../../dialogs/custom-aggrid';
import ModificationDialog from '../commons/modificationDialog';
import { SELECTED } from '../../utils/field-constants';
import { FormProvider, useForm } from 'react-hook-form';
import { NumericCellRenderer } from '../../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';

const emptyFormData = {
    [SELECTED]: null,
};

export const LineDictionarySelectorDialogTabs = {
    AERIAL_TAB: 0,
    UNDERGROUND_TAB: 1,
};

const LineDictionarySelectorDialog = (props) => {
    const intl = useIntl();
    const { onClose, onSelectLine } = props;
    const gridRef = useRef(); // Necessary to call getSelectedRows on aggrid component

    const [tabIndex, setTabIndex] = useState(
        LineDictionarySelectorDialogTabs.AERIAL_TAB
    );
    const [rowDataAerialTab, setRowDataAerialTab] = useState([]);
    const [rowDataUndergroundTab, setRowDataUndergroundTab] = useState([]);

    const methods = useForm({
        defaultValues: emptyFormData,
    });
    const { setValue, reset } = methods;

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);
    const handleSubmit = useCallback(
        (formData) => onSelectLine && onSelectLine(formData[SELECTED]),
        [onSelectLine]
    );
    const handleTabChange = useCallback(
        (newValue) => {
            reset({ [SELECTED]: null });
            setTabIndex(newValue);
        },
        [reset]
    );
    const onSelectionChanged = useCallback(() => {
        const selectedRow = gridRef.current.api.getSelectedRows();
        setValue(SELECTED, selectedRow, { shouldDirty: true });
    }, [setValue]);

    useEffect(() => {
        if (props?.rowData) {
            setRowDataAerialTab(
                props.rowData.filter((row) => row.kind === 'AERIAL')
            );
            setRowDataUndergroundTab(
                props.rowData.filter((row) => row.kind === 'UNDERGROUND')
            );
        }
    }, [props.rowData]);

    const columns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'dictionary.type' }),
                field: 'type',
            },
            {
                headerName: intl.formatMessage({ id: 'dictionary.voltage' }),
                field: 'voltage',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.conductorType',
                }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'dictionary.section' }),
                field: 'section',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.conductorsNumber',
                }),
                field: 'conductorsNumber',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.circuitsNumber',
                }),
                field: 'circuitsNumber',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.groundWiresNumber',
                }),
                field: 'groundWiresNumber',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.linearResistance',
                }),
                field: 'linearResistance',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.linearReactance',
                }),
                field: 'linearReactance',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'dictionary.linearCapacity',
                }),
                field: 'linearCapacity',
                cellRenderer: NumericCellRenderer,
                numeric: true,
            },
        ];
    }, [intl]);

    const headerAndTabs = (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
            }}
        >
            <Grid container>
                <Tabs
                    value={tabIndex}
                    variant="scrollable"
                    onChange={(event, newValue) => handleTabChange(newValue)}
                >
                    <Tab label={<FormattedMessage id="dictionary.aerial" />} />
                    <Tab
                        label={<FormattedMessage id="dictionary.underground" />}
                    />
                </Tabs>
            </Grid>
        </Box>
    );

    return (
        <FormProvider {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="lg"
                maxHeight="md"
                onClear={handleClear}
                onSave={handleSubmit}
                aria-labelledby="dialog-line-dictionary"
                titleId={props.titleId}
                subtitle={headerAndTabs}
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                {...props}
            >
                <div style={{ height: '100%' }}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={
                            tabIndex ===
                            LineDictionarySelectorDialogTabs.AERIAL_TAB
                                ? rowDataAerialTab
                                : rowDataUndergroundTab
                        }
                        columnDefs={columns}
                        rowSelection="single"
                        onSelectionChanged={onSelectionChanged}
                    />
                </div>
            </ModificationDialog>
        </FormProvider>
    );
};

LineDictionarySelectorDialog.propTypes = {};

export default LineDictionarySelectorDialog;
