/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useMemo, useEffect, useState, FunctionComponent } from 'react';
import BasicModificationDialog from '../commons/basicModificationDialog';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { suppressEventsToPreventEditMode } from '../commons/utils';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { LineTypeInfo } from './line-catalog.type';

const LineTypesCatalogSelectorDialogTabs = {
    AERIAL_TAB: 0,
    UNDERGROUND_TAB: 1,
};

const defaultColDef = {
    filter: true,
    sortable: true,
    resizable: false,
    lockPinned: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressKeyboardEvent: suppressEventsToPreventEditMode,
};

export interface LineTypesCatalogSelectorDialogProps {
    onSelectLine: (selectedLine: LineTypeInfo) => void;
    preselectedRowId: string;
    rowData: LineTypeInfo[];
    onClose: () => void;
    dialogProps: any; // TODO use specific type when BasicModificationDialog is ts
}

const LineTypesCatalogSelectorDialog: FunctionComponent<LineTypesCatalogSelectorDialogProps> = ({
    onSelectLine,
    preselectedRowId,
    rowData,
    onClose,
    dialogProps,
}) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const [tabIndex, setTabIndex] = useState<number>(LineTypesCatalogSelectorDialogTabs.AERIAL_TAB);
    const [selectedRow, setSelectedRow] = useState<LineTypeInfo | null>(null);

    const rowDataAerialTab = useMemo(() => {
        if (rowData) {
            return rowData.filter((row) => row.category === 'AERIAL');
        }
        return [];
    }, [rowData]);

    const rowDataUndergroundTab = useMemo(() => {
        if (rowData) {
            return rowData.filter((row) => row.category === 'UNDERGROUND');
        }
        return [];
    }, [rowData]);

    const handleClear = useCallback(() => onClose && onClose(), [onClose]);

    const handleSubmit = useCallback(() => {
        onSelectLine && selectedRow && onSelectLine(selectedRow);
    }, [onSelectLine, selectedRow]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const onSelectionChanged = useCallback(() => {
        // We extract the selected row from AGGrid
        const selectedRow = gridRef.current?.api?.getSelectedRows();
        if (selectedRow?.length) {
            setSelectedRow(selectedRow[0] ?? null);
        }
    }, []);

    const aerialColumnDefs = useMemo((): ColDef[] => {
        return [
            {
                headerName: intl.formatMessage({ id: 'lineTypes.type' }),
                field: 'type',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.voltage' }),
                field: 'voltage',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.conductorType',
                }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.section' }),
                field: 'section',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.conductorsNumber',
                }),
                field: 'conductorsNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.circuitsNumber',
                }),
                field: 'circuitsNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.groundWiresNumber',
                }),
                field: 'groundWiresNumber',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearResistance',
                }),
                field: 'linearResistance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearReactance',
                }),
                field: 'linearReactance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearCapacity',
                }),
                field: 'linearCapacity',
                cellRenderer: DefaultCellRenderer,
            },
        ];
    }, [intl]);

    const undergroundColumnDefs = useMemo((): ColDef[] => {
        return [
            {
                headerName: intl.formatMessage({ id: 'lineTypes.type' }),
                field: 'type',
                pinned: 'left',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.voltage' }),
                field: 'voltage',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.conductorType',
                }),
                field: 'conductorType',
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.section' }),
                field: 'section',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.insulator',
                }),
                field: 'insulator',
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.screen',
                }),
                field: 'screen',
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearResistance',
                }),
                field: 'linearResistance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearReactance',
                }),
                field: 'linearReactance',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({
                    id: 'lineTypes.linearCapacity',
                }),
                field: 'linearCapacity',
                cellRenderer: DefaultCellRenderer,
            },
        ];
    }, [intl]);

    // Tries to find the selected row to highlight it
    const highlightSelectedRow = useCallback(() => {
        const rowIdToHighlight = selectedRow?.id ?? preselectedRowId;
        if (rowIdToHighlight && rowData) {
            gridRef.current?.api?.forEachNode(function (node) {
                node.setSelected(node.data?.id === rowIdToHighlight);
            });
        }
    }, [selectedRow, preselectedRowId, rowData]);

    const scrollToPreselectedElement = useCallback(() => {
        const preselectedRow = rowData?.find((entry) => entry.id === preselectedRowId);
        preselectedRow && gridRef.current?.api?.ensureNodeVisible(preselectedRow, 'middle');
        highlightSelectedRow();
    }, [preselectedRowId, highlightSelectedRow, rowData]);

    // Select the correct tab when opening the dialog, if a row is preselected
    useEffect(() => {
        if (preselectedRowId && rowData) {
            const preselectedRow = rowData?.find((entry) => entry.id === preselectedRowId);
            const newTabIndex =
                preselectedRow?.category === 'UNDERGROUND'
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
                <Tabs value={tabIndex} variant="scrollable" onChange={(_event, newValue) => handleTabChange(newValue)}>
                    <Tab label={<FormattedMessage id="lineTypes.category.aerial" />} />
                    <Tab label={<FormattedMessage id="lineTypes.category.underground" />} />
                </Tabs>
            </Grid>
        </Box>
    );

    const displayTable = useCallback(
        (currentTab: number) => {
            let rowData, columnDefs;
            if (currentTab === LineTypesCatalogSelectorDialogTabs.AERIAL_TAB) {
                rowData = rowDataAerialTab;
                columnDefs = aerialColumnDefs;
            } else {
                rowData = rowDataUndergroundTab;
                columnDefs = undergroundColumnDefs;
            }
            return (
                <CustomAGGrid
                    ref={gridRef}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    rowSelection="single"
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={scrollToPreselectedElement} // Highlights the preselected row when AGGrid is ready
                />
            );
        },
        [
            aerialColumnDefs,
            undergroundColumnDefs,
            scrollToPreselectedElement,
            onSelectionChanged,
            rowDataAerialTab,
            rowDataUndergroundTab,
        ]
    );

    return (
        <BasicModificationDialog
            fullWidth
            maxWidth="xl"
            open={true}
            onClose={onClose}
            onClear={handleClear}
            onSave={handleSubmit}
            disabledSave={!selectedRow}
            aria-labelledby="dialog-lineTypes-catalog-selector"
            subtitle={headerAndTabs}
            PaperProps={{
                sx: {
                    height: '95vh', // we want the dialog height to be fixed even when switching tabs
                },
            }}
            titleId={'SelectType'}
            {...dialogProps}
        >
            <div style={{ height: '100%' }}>{displayTable(tabIndex)}</div>
        </BasicModificationDialog>
    );
};

export default LineTypesCatalogSelectorDialog;
