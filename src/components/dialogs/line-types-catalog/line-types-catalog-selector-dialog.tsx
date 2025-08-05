/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BasicModificationDialog } from '../commons/basicModificationDialog';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { AutocompleteInput, CustomAGGrid, Option } from '@gridsuite/commons-ui';
import { suppressEventsToPreventEditMode } from '../commons/utils';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { LineTypeInfo } from './line-catalog.type';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import {
    AERIAL_AREA,
    AERIAL_TEMPERATURE,
    UNDERGROUND_AREA,
    UNDERGROUND_SHAPE_FACTOR,
} from '../../utils/field-constants';
import GridItem from '../commons/grid-item';
import GridSection from '../commons/grid-section';
import { useFormContext } from 'react-hook-form';

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
}

const LineTypesCatalogSelectorDialog: FunctionComponent<LineTypesCatalogSelectorDialogProps> = ({
    onSelectLine,
    preselectedRowId,
    rowData,
    onClose,
    ...dialogProps
}) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const { getValues } = useFormContext();
    const [tabIndex, setTabIndex] = useState<number>(LineTypesCatalogSelectorDialogTabs.AERIAL_TAB);
    const [selectedRow, setSelectedRow] = useState<LineTypeInfo | null>(null);
    const [aerialAreas, setAerialAreas] = useState<Option[]>([]);
    const [aerialTemperature, setAerialTemperature] = useState<Option[]>([]);
    const [undergroundArea, setUndergroundArea] = useState<Option[]>([]);
    const undergroundShapeFactor: Option[] = [
        { id: '1', label: '1' },
        { id: '0.95', label: '0.95' },
        { id: '0.9', label: '0.9' },
    ];

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
        if (selectedRow?.category === 'AERIAL') {
            console.log(selectedRow);
            const selectedArea = getValues(AERIAL_AREA);
            console.log('selectedArea', selectedArea);
            const selectedTemperature = getValues(AERIAL_TEMPERATURE);
            console.log('selectedTemperature', selectedTemperature);
            console.log(
                'test',
                selectedRow?.limitsForLineType.filter(
                    (limit) => limit.area === selectedArea && limit.temperature === selectedTemperature
                )
            );
            //selectedRow.limitsForLineType = selectedRow?.limitsForLineType.filter(
            //    (limit) => limit.area == selectedArea && limit.temperature == selectedTemperature
            //);
            // console.log('limitsForLineType', selectedRow.limitsForLineType);
        } else if (selectedRow?.category === 'UNDERGROUND') {
        }
        onSelectLine && selectedRow && onSelectLine(selectedRow);
    }, [onSelectLine, selectedRow, getValues]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const onSelectionChanged = useCallback(() => {
        // We extract the selected row from AGGrid
        const selectedRow = gridRef.current?.api?.getSelectedRows();
        if (selectedRow?.length) {
            const selectedData = selectedRow[0];
            setSelectedRow(selectedData ?? null);
            if (selectedData !== null) {
                if (selectedData.category === 'AERIAL') {
                    let aerialAreas = new Set<string>(
                        selectedData?.limitsForLineType.map((limitInfo) => limitInfo.area)
                    );
                    setAerialAreas(
                        Array.from(aerialAreas.values()).map((value) => ({
                            id: value,
                            label: value,
                        }))
                    );
                    let aerialTemperature = new Set<string>(
                        selectedData?.limitsForLineType.map((limitInfo) => limitInfo.temperature)
                    );
                    setAerialTemperature(
                        Array.from(aerialTemperature.values()).map((value) => ({
                            id: value,
                            label: value,
                        }))
                    );
                } else if (selectedData.category === 'UNDERGROUND') {
                    let undergroundAreas = new Set<string>(
                        selectedData?.limitsForLineType.map((limitInfo) => limitInfo.area)
                    );
                    setUndergroundArea(
                        Array.from(undergroundAreas.values()).map((value) => ({
                            id: value,
                            label: value,
                        }))
                    );
                }
            }
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
                    overrideLocales={AGGRID_LOCALES}
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

    const onValidationError = useCallback((errors: any) => {
        console.log('errors', errors);
    }, []);

    const aerialAreaComponent = (
        <AutocompleteInput
            name={`${AERIAL_AREA}`}
            label="lineTypes.currentLimits.aerial.Area"
            options={aerialAreas}
            disabled={false}
            size={'small'}
        />
    );

    const aerialTemperatureComponent = (
        <AutocompleteInput
            name={`${AERIAL_TEMPERATURE}`}
            label="lineTypes.currentLimits.aerial.Temperature"
            options={aerialTemperature}
            disabled={false}
            size={'small'}
        />
    );

    const undergroundAreaComponent = (
        <AutocompleteInput
            name={`${UNDERGROUND_AREA}`}
            label="lineTypes.currentLimits.underground.Area"
            options={undergroundArea}
            disabled={false}
            size={'small'}
        />
    );

    const undergroundFormShape = (
        <AutocompleteInput
            name={`${UNDERGROUND_SHAPE_FACTOR}`}
            label="lineTypes.currentLimits.underground.ShapeFactor"
            options={undergroundShapeFactor}
            disabled={false}
            size={'small'}
        />
    );

    const limitsParametersSelectection =
        selectedRow && selectedRow.category === 'AERIAL' ? (
            <>
                <GridSection title={'Parameters'} />
                <Grid container spacing={2}>
                    <GridItem size={4}>{aerialAreaComponent}</GridItem>
                    <GridItem size={4}>{aerialTemperatureComponent}</GridItem>
                </Grid>
            </>
        ) : (
            <>
                <GridSection title={'Parameters'} />
                <Grid container spacing={2}>
                    <GridItem size={4}>{undergroundAreaComponent}</GridItem>
                    <GridItem size={4}>{undergroundFormShape}</GridItem>
                </Grid>
            </>
        );

    return (
        <BasicModificationDialog
            disabledSave={!selectedRow}
            fullWidth
            maxWidth="xl"
            onClear={handleClear}
            onClose={onClose}
            onSave={handleSubmit}
            open={true}
            onValidationError={onValidationError}
            PaperProps={{
                sx: {
                    height: '95vh', // we want the dialog height to be fixed even when switching tabs
                },
            }}
            subtitle={headerAndTabs}
            titleId={'SelectType'}
            {...dialogProps}
        >
            <div style={{ height: '85%' }}>{displayTable(tabIndex)}</div>
            {selectedRow && limitsParametersSelectection}
        </BasicModificationDialog>
    );
};

export default LineTypesCatalogSelectorDialog;
