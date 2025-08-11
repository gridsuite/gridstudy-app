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
import { AutocompleteInput, CustomAGGrid, Option, useSnackMessage } from '@gridsuite/commons-ui';
import { suppressEventsToPreventEditMode } from '../commons/utils';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { LineTypeInfo } from './line-catalog.type';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';
import GridItem from '../commons/grid-item';
import GridSection from '../commons/grid-section';
import { useFormContext } from 'react-hook-form';
import { getLineTypeWithLimits } from '../../../services/network-modification';
import { getObjectId } from '../../utils/utils';
import { getOptionLabel } from "../../results/common/global-filter/global-filter-utils";
import { getConnectivityBusBarSectionData } from "../connectivity/connectivity-form-utils";

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
    const { setValue, getValues } = useFormContext();
    const [tabIndex, setTabIndex] = useState<number>(LineTypesCatalogSelectorDialogTabs.AERIAL_TAB);
    const [selectedRow, setSelectedRow] = useState<LineTypeInfo | null>(null);
    const [aerialAreas, setAerialAreas] = useState<Option[]>([]);
    const [aerialTemperatures, setAerialTemperatures] = useState<Option[]>([]);
    const [undergroundArea, setUndergroundArea] = useState<Option[]>([]);
    const { snackError } = useSnackMessage();
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

    const handleClear = useCallback(() => {
        onClose && onClose();
    }, [onClose]);

    const handleSubmit = useCallback(() => {
        if (selectedRow?.category === 'AERIAL') {
            const selectedArea = getValues(AERIAL_AREAS);
            const selectedTemperature = getValues(AERIAL_TEMPERATURES);
            if (aerialAreas.length > 0 && aerialTemperatures.length > 0) {
                const filteredLimits = selectedRow?.limitsForLineType.filter(
                    (limit) => limit.area === selectedArea.id && limit.temperature === selectedTemperature.id
                );
                if (filteredLimits !== undefined) {
                    selectedRow.limitsForLineType = filteredLimits;
                }
            }
        } else if (selectedRow?.category === 'UNDERGROUND') {
            const selectedArea = getValues(UNDERGROUND_AREAS);
            const selectedShapeFactor = parseFloat(getValues(UNDERGROUND_SHAPE_FACTORS)?.id);
            if (undergroundArea.length > 0) {
                const filteredLimits = selectedRow?.limitsForLineType.filter((limit) => limit.area === selectedArea.id);
                if (filteredLimits) {
                    filteredLimits.forEach(
                        (limit) => (limit.permanentLimit = limit.permanentLimit / selectedShapeFactor)
                    );
                    selectedRow.limitsForLineType = filteredLimits;
                }
            }
        }
        return onSelectLine && selectedRow && onSelectLine(selectedRow);
    }, [onSelectLine, selectedRow, getValues, aerialAreas, aerialTemperatures, undergroundArea]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
        // reset values
        setValue(AERIAL_AREAS, null);
        setValue(AERIAL_TEMPERATURES, null);
        setValue(UNDERGROUND_AREAS, null);
        setValue(UNDERGROUND_SHAPE_FACTORS, null);
    }, []);

    const onSelectionChanged = useCallback(() => {
        // We extract the selected row from AGGrid
        const selectedRow = gridRef.current?.api?.getSelectedRows();
        if (selectedRow?.length) {
            const selectedData = selectedRow[0];
            getLineTypeWithLimits(selectedData.id)
                .then((lineTypeWithLimits: LineTypeInfo) => {
                    selectedData.limitsForLineType = lineTypeWithLimits.limitsForLineType;
                    setSelectedRow(selectedData);
                    if (selectedData.limitsForLineType != null) {
                        if (selectedData.category === 'AERIAL') {
                            let selectedAerialAreas = new Set<string>(
                                selectedData?.limitsForLineType.map((limitInfo) => limitInfo.area)
                            );
                            setAerialAreas(
                                Array.from(selectedAerialAreas.values()).map((value) => ({
                                    id: value,
                                    label: value,
                                }))
                            );
                            console.log("=======selectedAerialAreas", selectedAerialAreas);
                            let selectedAerialTemperature = new Set<string>(
                                selectedData?.limitsForLineType.map((limitInfo) => limitInfo.temperature)
                            );
                            setAerialTemperatures(
                                Array.from(selectedAerialTemperature.values()).map((value) => ({
                                    id: value,
                                    label: value,
                                }))
                            );
                          console.log("=====selectedAerialTemperature", selectedAerialTemperature);
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
                })
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                        headerId: 'LineTypesCatalogFetchingError',
                    })
                );
        }
    }, [snackError, setAerialTemperatures, setUndergroundArea, setAerialAreas, setValue, getValues]);

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

    const aerialAreaComponent = (
        <AutocompleteInput
            name={AERIAL_AREAS}
            label="aerialAreas"
            options={aerialAreas}
            disabled={false}
            size={'small'}
        />
    );
  const getObjectIdTest = (object: string | { id: string, label: string }) => {
    console.log("======getObjectIdTest", object)
    return typeof object === 'string' ? object : ((object?.label)?.toString() ?? null);
  };
    
    const aerialTemperatureComponent = (
      <AutocompleteInput
        name={AERIAL_TEMPERATURES}
        label="aerialTemperatures"
        options={Object.values(aerialTemperatures)}
        getOptionLabel={getObjectIdTest}
        inputTransform={(value) => value ?? ''}
        outputTransform={(value) => {
          if (typeof value === 'string') {
            console.log("======value", value)
            return { id: value?.id ?? '', label: value?.label || '' };
          }
          console.log("======value", value)
          
          return value;
        }}
        disabled={false}
        size={"small"}
      />
    );

    const undergroundAreaComponent = (
        <AutocompleteInput
            name={UNDERGROUND_AREAS}
            label="lineTypes.currentLimits.underground.Area"
            options={undergroundArea}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={false}
            size={'small'}
        />
    );

    const undergroundFormShape = (
        <AutocompleteInput
            name={UNDERGROUND_SHAPE_FACTORS}
            label="lineTypes.currentLimits.underground.ShapeFactor"
            options={undergroundShapeFactor}
            disabled={false}
            size={'small'}
        />
    );

    const limitsParametersSelectection =
        selectedRow && selectedRow.category === 'AERIAL' ? (
            <>
                <GridSection title={'parameters'} />
                <Grid container spacing={2}>
                    <GridItem size={4}>{aerialAreaComponent}</GridItem>
                    <GridItem size={4}>{aerialTemperatureComponent}</GridItem>
                </Grid>
            </>
        ) : (
            <>
                <GridSection title={'parameters'} />
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
