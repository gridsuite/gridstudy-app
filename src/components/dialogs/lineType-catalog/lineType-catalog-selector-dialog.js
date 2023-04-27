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
import { CustomAGGrid } from '../custom-aggrid';
import ModificationDialog from '../commons/modificationDialog';
import { SELECTED } from '../../utils/field-constants';
import { FormProvider, useForm } from 'react-hook-form';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';

export const ALLOWED_KEYS = [
    'Escape',
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
];

const emptyFormData = {
    [SELECTED]: null,
};

export const LineTypeCatalogSelectorDialogTabs = {
    AERIAL_TAB: 0,
    UNDERGROUND_TAB: 1,
};

const LineTypeCatalogSelectorDialog = (props) => {
    const intl = useIntl();
    const { onClose, onSelectLine } = props;
    const gridRef = useRef(); // Necessary to call getSelectedRows on aggrid component

    const [tabIndex, setTabIndex] = useState(
        LineTypeCatalogSelectorDialogTabs.AERIAL_TAB
    );
    const [rowDataAerialTab, setRowDataAerialTab] = useState([]);
    const [rowDataUndergroundTab, setRowDataUndergroundTab] = useState([]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
    });
    const { setValue, reset } = formMethods;

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
                headerName: intl.formatMessage({ id: 'lineType.type' }),
                field: 'type',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'lineType.voltage' }),
                field: 'voltage',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.conductorType',
                }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'lineType.section' }),
                field: 'section',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.conductorsNumber',
                }),
                field: 'conductorsNumber',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.circuitsNumber',
                }),
                field: 'circuitsNumber',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.groundWiresNumber',
                }),
                field: 'groundWiresNumber',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.linearResistance',
                }),
                field: 'linearResistance',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.linearReactance',
                }),
                field: 'linearReactance',
                cellRenderer: DefaultCellRenderer,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineType.linearCapacity',
                }),
                field: 'linearCapacity',
                cellRenderer: DefaultCellRenderer,
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
                    <Tab
                        label={<FormattedMessage id="lineType.kind.aerial" />}
                    />
                    <Tab
                        label={
                            <FormattedMessage id="lineType.kind.underground" />
                        }
                    />
                </Tabs>
            </Grid>
        </Box>
    );

    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: false,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
            // icons: {
            //     menu: '<span class="ag-icon ag-icon-filter" />',
            // },
        }),
        []
    );

    return (
        <FormProvider {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="xl"
                maxHeight="md"
                onClear={handleClear}
                onSave={handleSubmit}
                aria-labelledby="dialog-lineType-catalog-selector"
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
                            LineTypeCatalogSelectorDialogTabs.AERIAL_TAB
                                ? rowDataAerialTab
                                : rowDataUndergroundTab
                        }
                        defaultColDef={defaultColDef}
                        columnDefs={columns}
                        rowSelection="single"
                        onSelectionChanged={onSelectionChanged}
                    />
                </div>
            </ModificationDialog>
        </FormProvider>
    );
};

LineTypeCatalogSelectorDialog.propTypes = {};

export default LineTypeCatalogSelectorDialog;
