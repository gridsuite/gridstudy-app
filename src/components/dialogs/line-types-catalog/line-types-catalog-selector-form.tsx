/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AutocompleteInput, Option } from '@gridsuite/commons-ui';
import GridItem from '../commons/grid-item';
import GridSection from '../commons/grid-section';
import { Grid, Tab, Tabs } from '@mui/material';
import {
    AERIAL_AREAS,
    AERIAL_TEMPERATURES,
    SELECTED_CATEGORIES_TAB,
    UNDERGROUND_AREAS,
    UNDERGROUND_SHAPE_FACTORS,
} from '../../utils/field-constants';
import { CATEGORIES_TABS, LineTypeInfo } from './line-catalog.type';
import { areIdsEqual } from '../../utils/utils';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import LimitCustomAgGrid from './limit-custom-aggrid';
import { useCallback, useEffect, useState } from 'react';
import { useColumnDefinitions } from './use-column-definitions';
import { useRowData } from './use-row-data';
import { AgGridReact } from 'ag-grid-react';

interface LineTypesCatalogSelectorFormProps {
    gridRef: React.RefObject<AgGridReact>;
    selectedRow: LineTypeInfo | null;
    preselectedRowId: string;
    rowData: LineTypeInfo[];
    onSelectionChanged: () => void;
    areasOptions: Option[];
    aerialTemperatures: Option[];
    undergroundShapeFactor: Option[];
}

export default function LineTypesCatalogSelectorForm({
    gridRef,
    selectedRow,
    preselectedRowId,
    rowData,
    onSelectionChanged,
    areasOptions,
    aerialTemperatures,
    undergroundShapeFactor,
}: Readonly<LineTypesCatalogSelectorFormProps>) {
    const [tabIndex, setTabIndex] = useState<number>(CATEGORIES_TABS.AERIAL.id);
    const { setValue } = useFormContext();
    const { aerialColumnDefs, undergroundColumnDefs } = useColumnDefinitions();
    const { aerialRowData, undergroundRowData } = useRowData(rowData);

    const handleTabChange = useCallback(
        (newValue: number) => {
            setValue(SELECTED_CATEGORIES_TAB, newValue);
            setTabIndex(newValue);
        },
        [setValue]
    );

    // Select the correct tab when opening the dialog, if a row is preselected
    useEffect(() => {
        if (preselectedRowId && rowData) {
            const preselectedRow = rowData?.find((entry) => entry.id === preselectedRowId);
            const newTabIndex =
                preselectedRow?.category === CATEGORIES_TABS.UNDERGROUND.name
                    ? CATEGORIES_TABS.UNDERGROUND.id
                    : CATEGORIES_TABS.AERIAL.id;
            setValue(SELECTED_CATEGORIES_TAB, newTabIndex);
        }
    }, [rowData, preselectedRowId, setValue]);

    // Tries to find the selected row to highlight it
    const highlightSelectedRow = useCallback(() => {
        const rowIdToHighlight = selectedRow?.id ?? preselectedRowId;
        if (rowIdToHighlight && rowData) {
            gridRef.current?.api?.forEachNode(function (node: any) {
                node.setSelected(node.data?.id === rowIdToHighlight);
            });
        }
    }, [selectedRow?.id, preselectedRowId, rowData, gridRef]);

    const scrollToPreselectedElement = useCallback(() => {
        const preselectedRow = rowData?.find((entry) => entry.id === preselectedRowId);
        preselectedRow && gridRef.current?.api?.ensureNodeVisible(preselectedRow, 'middle');
        highlightSelectedRow();
    }, [rowData, gridRef, highlightSelectedRow, preselectedRowId]);

    // Tries to highlight the preselected row when changing tabs
    useEffect(() => {
        highlightSelectedRow();
    }, [highlightSelectedRow, setValue, tabIndex]);

    const renderTabContent = (isAerial: boolean) => (
        <>
            <div style={{ height: '75%', marginTop: '1%' }}>
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

            <GridSection title="parameters" />

            <Grid container spacing={2}>
                {isAerial ? (
                    <>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={AERIAL_AREAS}
                                label="aerialAreas"
                                options={areasOptions}
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={AERIAL_TEMPERATURES}
                                label="aerialTemperatures"
                                options={aerialTemperatures}
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                    </>
                ) : (
                    <>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={UNDERGROUND_AREAS}
                                label="undergroundAreas"
                                options={areasOptions}
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                        <GridItem size={4}>
                            <AutocompleteInput
                                name={UNDERGROUND_SHAPE_FACTORS}
                                label="undergroundShapeFactors"
                                options={undergroundShapeFactor}
                                isOptionEqualToValue={areIdsEqual}
                                size="small"
                            />
                        </GridItem>
                    </>
                )}
            </Grid>
        </>
    );

    return (
        <>
            <Tabs value={tabIndex} variant="scrollable" onChange={(_event, newValue) => handleTabChange(newValue)}>
                <Tab label={<FormattedMessage id="lineTypes.category.aerial" />} value={0} />
                <Tab label={<FormattedMessage id="lineTypes.category.underground" />} value={1} />
            </Tabs>

            {tabIndex === CATEGORIES_TABS.AERIAL.id && renderTabContent(true)}
            {tabIndex === CATEGORIES_TABS.UNDERGROUND.id && renderTabContent(false)}
        </>
    );
}
