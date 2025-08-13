/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BasicModificationDialog } from '../commons/basicModificationDialog';
import { FormattedMessage } from 'react-intl';
import { Box, Grid, Tab, Tabs } from '@mui/material';
import { Option, useSnackMessage } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { CurrentLimitsInfo, LineTypeInfo } from './line-catalog.type';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';
import { useFormContext, useWatch } from 'react-hook-form';
import { getLineTypeWithLimits } from '../../../services/network-modification';
import { useColumnDefinitions } from './use-column-definitions';
import { useRowData } from './use-row-data';
import { CATEGORIES, TABS } from './segment-utils';
import LimitCustomAgGrid from './limit-custom-aggrid';
import LimitParametersSelection from './limit-parameters-selection';
import { NetworkModificationDialogProps } from '../../graph/menus/network-modifications/network-modification-menu.type';

export type LineTypesCatalogSelectorDialogProps = NetworkModificationDialogProps & {
    onSelectLine: (selectedLine: LineTypeInfo) => void;
    preselectedRowId: string;
    rowData: LineTypeInfo[];
    onClose: () => void;
};

export default function LineTypesCatalogSelectorDialog({
    onSelectLine,
    preselectedRowId,
    rowData,
    onClose,
    ...dialogProps
}: Readonly<LineTypesCatalogSelectorDialogProps>) {
    const { snackError } = useSnackMessage();
    const gridRef = useRef<AgGridReact>(null);
    const { setValue, getValues } = useFormContext();

    const [tabIndex, setTabIndex] = useState<number>(TABS.AERIAL);
    const [selectedRow, setSelectedRow] = useState<LineTypeInfo | null>(null);
    const [aerialAreas, setAerialAreas] = useState<Option[]>([]);
    const [aerialTemperatures, setAerialTemperatures] = useState<Option[]>([]);
    const [undergroundAreas, setUndergroundAreas] = useState<Option[]>([]);
    const { aerialColumnDefs, undergroundColumnDefs } = useColumnDefinitions();
    const { aerialRowData, undergroundRowData } = useRowData(rowData);
    const selectedAerialArea = useWatch({ name: AERIAL_AREAS });
    const selectedAerialTemperature = useWatch({ name: AERIAL_TEMPERATURES });
    const selectedUndergroundArea = useWatch({ name: UNDERGROUND_AREAS });
    const selectedUndergroundShapeFactor = useWatch({ name: UNDERGROUND_SHAPE_FACTORS });

    const undergroundShapeFactor: Option[] = [
        { id: '1', label: '1' },
        { id: '0.95', label: '0.95' },
        { id: '0.9', label: '0.9' },
    ];

    const handleClear = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const handleSelectedAerial = useCallback(
        (selectedRow: LineTypeInfo) => {
            const selectedArea = getValues(AERIAL_AREAS);
            const selectedTemperature = getValues(AERIAL_TEMPERATURES);

            if (aerialAreas?.length > 0 && aerialTemperatures?.length > 0) {
                const filteredLimits = selectedRow?.limitsForLineType?.filter(
                    (limit) => limit?.area === selectedArea?.id && limit?.temperature === selectedTemperature?.id
                );
                if (filteredLimits) {
                    selectedRow.limitsForLineType = filteredLimits;
                }
            }
        },
        [getValues, aerialAreas, aerialTemperatures]
    );

    const handleSelectedUnderground = useCallback(
        (selectedRow: LineTypeInfo) => {
            const selectedArea = getValues(UNDERGROUND_AREAS);
            const selectedShapeFactor = parseFloat(getValues(UNDERGROUND_SHAPE_FACTORS)?.id);

            if (undergroundAreas.length > 0) {
                const filteredLimits = selectedRow?.limitsForLineType?.filter(
                    (limit) => limit?.area === selectedArea?.id
                );
                if (filteredLimits) {
                    filteredLimits.forEach((limit) => {
                        limit.permanentLimit = limit.permanentLimit / selectedShapeFactor;
                    });
                    selectedRow.limitsForLineType = filteredLimits;
                }
            }
        },
        [getValues, undergroundAreas]
    );

    const handleSubmit = useCallback(() => {
        if (selectedRow?.category === CATEGORIES.AERIAL) {
            handleSelectedAerial(selectedRow);
        } else if (selectedRow?.category === CATEGORIES.UNDERGROUND) {
            handleSelectedUnderground(selectedRow);
        }

        selectedRow && onSelectLine?.(selectedRow);
    }, [selectedRow, handleSelectedAerial, handleSelectedUnderground, onSelectLine]);

    const handleTabChange = useCallback((newValue: number) => {
        setTabIndex(newValue);
    }, []);

    const createOptionsFromAreas = (limitsData?: CurrentLimitsInfo[]) => {
        if (!limitsData?.length) {
            return [];
        }

        const uniqueAreas = [...new Set(limitsData.map((limit) => limit.area))];
        return uniqueAreas.map((area) => ({ id: area, label: area }));
    };

    const createOptionsFromTemperatures = (limitsData?: CurrentLimitsInfo[]) => {
        if (!limitsData?.length) {
            return [];
        }

        const uniqueTemperatures = [...new Set(limitsData.map((limit) => limit.temperature))];
        return uniqueTemperatures.map((temp) => ({ id: temp, label: temp }));
    };

    const createOptionsFromUndergroundAreas = (limitsData?: CurrentLimitsInfo[]): Option[] => {
        if (!limitsData?.length) {
            return [];
        }
        const uniqueAreas = [...new Set(limitsData.map((limit) => limit.area))];
        return uniqueAreas.map((area) => ({ id: area, label: area }));
    };

    const handleSelectedRowData = useCallback(
        async (selectedData: LineTypeInfo) => {
            try {
                const lineTypeWithLimits = await getLineTypeWithLimits(selectedData.id);
                selectedData.limitsForLineType = lineTypeWithLimits.limitsForLineType;
                setSelectedRow(selectedData);
                if (selectedData.category === CATEGORIES.AERIAL) {
                    setAerialAreas(createOptionsFromAreas(selectedData.limitsForLineType));
                    setAerialTemperatures(createOptionsFromTemperatures(selectedData.limitsForLineType));
                } else if (selectedData.category === CATEGORIES.UNDERGROUND) {
                    setUndergroundAreas(createOptionsFromUndergroundAreas(selectedData.limitsForLineType));
                }
            } catch (error) {
                snackError({
                    messageTxt: (error as Error).message,
                    headerId: 'LineTypesCatalogFetchingError',
                });
            }
        },
        [snackError]
    );

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current?.api?.getSelectedRows();
        console.log('selectedRows', selectedRows);
        if (selectedRows?.length) {
            setValue(AERIAL_AREAS, null);
            setValue(AERIAL_TEMPERATURES, null);
            setValue(UNDERGROUND_AREAS, null);
            setValue(UNDERGROUND_SHAPE_FACTORS, null);
            handleSelectedRowData(selectedRows[0]).then();
        }
    }, [handleSelectedRowData, setValue]);

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
            const newTabIndex = preselectedRow?.category === CATEGORIES.UNDERGROUND ? TABS.UNDERGROUND : TABS.AERIAL;
            setTabIndex(newTabIndex);
        }
    }, [rowData, preselectedRowId]);

    // Tries to highlight the preselected row when changing tabs
    useEffect(() => {
        highlightSelectedRow();
    }, [highlightSelectedRow, tabIndex]);

    const isValidationBlocked = useMemo(() => {
        if (!selectedRow) {
            return true;
        } else if (selectedRow.category === CATEGORIES.AERIAL && aerialAreas.length > 0) {
            console.log('selectedArea', selectedAerialArea, selectedAerialTemperature);
            if (!selectedAerialArea && !selectedAerialTemperature) {
                return true;
            }
        } else if (selectedRow.category === CATEGORIES.UNDERGROUND && undergroundAreas.length > 0) {
            console.log('selectedUndergroundArea', selectedUndergroundArea, selectedUndergroundShapeFactor);
            if (!selectedUndergroundArea && !selectedUndergroundShapeFactor) {
                return true;
            }
        } else {
            return false;
        }
    }, [
        selectedRow,
        aerialAreas.length,
        undergroundAreas.length,
        selectedAerialArea,
        selectedAerialTemperature,
        selectedUndergroundArea,
        selectedUndergroundShapeFactor,
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
                <Tabs value={tabIndex} variant="scrollable" onChange={(_event, newValue) => handleTabChange(newValue)}>
                    <Tab label={<FormattedMessage id="lineTypes.category.aerial" />} />
                    <Tab label={<FormattedMessage id="lineTypes.category.underground" />} />
                </Tabs>
            </Grid>
        </Box>
    );
    return (
        <BasicModificationDialog
            disabledSave={isValidationBlocked}
            fullWidth
            maxWidth="xl"
            onClear={handleClear}
            onClose={onClose}
            onSave={handleSubmit}
            open={true}
            PaperProps={{
                sx: { height: '95vh' },
            }}
            subtitle={headerAndTabs}
            titleId="SelectType"
            {...dialogProps}
        >
            <div style={{ height: '85%' }}>
                <LimitCustomAgGrid
                    gridRef={gridRef}
                    currentTab={tabIndex}
                    aerialRowData={aerialRowData}
                    undergroundRowData={undergroundRowData}
                    aerialColumnDefs={aerialColumnDefs}
                    undergroundColumnDefs={undergroundColumnDefs}
                    onSelectionChanged={onSelectionChanged}
                    onGridReady={scrollToPreselectedElement}
                />
            </div>
            <LimitParametersSelection
                selectedRow={selectedRow}
                currentTab={tabIndex}
                aerialAreas={aerialAreas}
                aerialTemperatures={aerialTemperatures}
                undergroundAreas={undergroundAreas}
                undergroundShapeFactor={undergroundShapeFactor}
            />
        </BasicModificationDialog>
    );
}
