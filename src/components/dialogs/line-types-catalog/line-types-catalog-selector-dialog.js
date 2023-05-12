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
import BasicModificationDialog from '../commons/basicModificationDialog';
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

export const LineTypesCatalogSelectorDialogTabs = {
    AERIAL_TAB: 0,
    UNDERGROUND_TAB: 1,
};

const LineTypesCatalogSelectorDialog = ({
    onSelectLine,
    preselectedRowId,
    rowData,
    onClose,
    ...dialogProps
}) => {
    const intl = useIntl();
    const gridRef = useRef(); // Necessary to call getSelectedRows on aggrid component

    const [tabIndex, setTabIndex] = useState(
        LineTypesCatalogSelectorDialogTabs.AERIAL_TAB
    );

    const [selectedRow, setSelectedRow] = useState(null);

    const rowDataAerialTab = useMemo(() => {
        if (rowData) {
            return rowData.filter((row) => row.kind === 'AERIAL');
        }
        return [];
    }, [rowData]);

    const rowDataUndergroundTab = useMemo(() => {
        if (rowData) {
            return rowData.filter((row) => row.kind === 'UNDERGROUND');
        }
        return [];
    }, [rowData]);

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);
    const handleSubmit = useCallback(
        () => onSelectLine && onSelectLine(selectedRow),
        [onSelectLine, selectedRow]
    );
    const handleTabChange = useCallback((newValue) => {
        setTabIndex(newValue);
    }, []);
    const onSelectionChanged = useCallback(() => {
        // We extract the selected row from AGGrid
        const selectedRow = gridRef.current?.api?.getSelectedRows();
        setSelectedRow(selectedRow[0] ?? null);
    }, []);

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

    // Tries to find the preselected row to highlight it.
    const highlightSelectedRow = useCallback(() => {
        const rowIdToHighlight = selectedRow?.id ?? preselectedRowId;
        if (rowIdToHighlight && rowData) {
            gridRef.current?.api?.forEachNode(function (node) {
                node.setSelected(node.data?.id === rowIdToHighlight);
            });
        }
    }, [selectedRow, preselectedRowId, rowData]);

    // Select the correct tab when opening the dialog, if a row is preselected
    useEffect(() => {
        if (preselectedRowId && rowData) {
            const preselectedRow = rowData?.find(
                (entry) => entry.id === preselectedRowId
            );
            const newTabIndex =
                preselectedRow?.kind === 'UNDERGROUND'
                    ? LineTypesCatalogSelectorDialogTabs.UNDERGROUND_TAB
                    : LineTypesCatalogSelectorDialogTabs.AERIAL_TAB;
            setTabIndex(newTabIndex);
        }
    }, [rowData, preselectedRowId]);

    // Tries to highlight the preselected row when changing tabs
    useEffect(() => {
        highlightSelectedRow();
    }, [highlightSelectedRow, tabIndex]);

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

    const displayTable = useCallback(
        (currentTab) => {
            const data =
                currentTab === LineTypesCatalogSelectorDialogTabs.AERIAL_TAB
                    ? rowDataAerialTab
                    : rowDataUndergroundTab;
            return (
                <CustomAGGrid
                    ref={gridRef}
                    rowData={data}
                    defaultColDef={defaultColDef}
                    columnDefs={columns}
                    rowSelection="single"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={highlightSelectedRow} // Highlights the preselected row when AGGrid is ready
                />
            );
        },
        [
            columns,
            defaultColDef,
            highlightSelectedRow,
            onSelectionChanged,
            rowDataAerialTab,
            rowDataUndergroundTab,
        ]
    );

    return (
        <BasicModificationDialog
            fullWidth
            maxWidth="xl"
            onClose={onClose}
            onClear={handleClear}
            onSave={handleSubmit}
            aria-labelledby="dialog-lineTypes-catalog-selector"
            subtitle={headerAndTabs}
            PaperProps={{
                sx: {
                    height: '95vh', // we want the dialog height to be fixed even when switching tabs
                },
            }}
            {...dialogProps}
            disabledSave={!selectedRow}
        >
            <div style={{ height: '100%' }}>{displayTable(tabIndex)}</div>
        </BasicModificationDialog>
    );
};

LineTypesCatalogSelectorDialog.propTypes = {
    onClose: PropTypes.func,
    rowData: PropTypes.array,
    onSelectLine: PropTypes.func,
    preselectedRowId: PropTypes.string,
};

export default LineTypesCatalogSelectorDialog;
