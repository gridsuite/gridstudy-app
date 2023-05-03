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
import PropTypes from 'prop-types';

export const ALLOWED_KEYS = [
    'Escape',
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
];

const emptyFormData = {
    [SELECTED]: null, // This is a hidden field, and there is no validation schema
    // TODO This seems less and less useful. Maybe totally remove this field ?
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
        props.preselectedRow?.kind === 'UNDERGROUND'
            ? LineTypeCatalogSelectorDialogTabs.UNDERGROUND_TAB
            : LineTypeCatalogSelectorDialogTabs.AERIAL_TAB
    );
    const [rowDataAerialTab, setRowDataAerialTab] = useState([]);
    const [rowDataUndergroundTab, setRowDataUndergroundTab] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    const formMethods = useForm({
        defaultValues: emptyFormData,
    });
    const { setValue } = formMethods;

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);
    const handleSubmit = useCallback(
        (formData) => onSelectLine && onSelectLine(formData[SELECTED]),
        [onSelectLine]
    );
    const handleTabChange = useCallback((newValue) => {
        setTabIndex(newValue);
    }, []);
    const onSelectionChanged = useCallback(() => {
        // We extract the selected row from AGGrid to put it in the hidden SELECTED field.
        const selectedRow = gridRef.current?.api?.getSelectedRows();
        if (selectedRow) {
            setValue(SELECTED, selectedRow, { shouldDirty: true });
            setSelectedRow(selectedRow[0]);
        }
    }, [setValue]);

    // Filters the data to show only the current tab's line types.
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

    // Tries to find in the current tab the preselected row to highlight it
    const highlightSelectedRow = useCallback(() => {
        const rowToHightlight = selectedRow ?? props?.preselectedRow;
        if (rowToHightlight && props?.rowData) {
            const currentTabKind =
                tabIndex === LineTypeCatalogSelectorDialogTabs.AERIAL_TAB
                    ? 'AERIAL'
                    : 'UNDERGROUND';
            if (rowToHightlight.kind === currentTabKind) {
                gridRef.current?.api?.forEachNode(function (node) {
                    node.setSelected(
                        node.data?.kind === currentTabKind &&
                            node.data?.type === rowToHightlight.type
                    );
                });
            }
        }
    }, [selectedRow, tabIndex, props.preselectedRow, props.rowData]);

    useEffect(() => {
        highlightSelectedRow();
    }, [
        highlightSelectedRow,
        selectedRow,
        tabIndex,
        props.preselectedRow,
        props.rowData,
    ]);

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
                        onGridReady={highlightSelectedRow}
                    />
                </div>
            </ModificationDialog>
        </FormProvider>
    );
};

LineTypeCatalogSelectorDialog.propTypes = {
    onClose: PropTypes.func,
    rowData: PropTypes.array,
    onSelectLine: PropTypes.func,
    titleId: PropTypes.string,
};

export default LineTypeCatalogSelectorDialog;
