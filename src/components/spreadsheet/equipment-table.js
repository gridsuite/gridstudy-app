/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useTheme } from '@mui/styles';
import LoaderWithOverlay from '../utils/loader-with-overlay';
import { ALLOWED_KEYS } from './utils/config-tables';
import { CustomAGGrid } from 'components/dialogs/custom-aggrid';
import { FILTER_TYPE, useRowFilter } from './filter-panel/use-row-filter';
import { useIntl } from 'react-intl';
import { FilterPanel } from './filter-panel/filter-panel';
import { SearchBar } from './search-bar/search-bar';
import { useSearchBar } from './search-bar/use-search-bar';

const PINNED_ROW_HEIGHT = 42;
const DEFAULT_ROW_HEIGHT = 28;

export const EquipmentTable = ({
    rowData,
    topPinnedData,
    columnData,
    scrollToIndex,
    gridRef,
    handleColumnDrag,
    handleRowEditing,
    handleCellEditing,
    handleEditingStopped,
    handleGridReady,
    fetched,
    network,
    shouldHidePinnedHeaderRightBorder,
}) => {
    const theme = useTheme();
    const intl = useIntl();

    const filtersDef = useMemo(
        () => [
            {
                field: 'id',
                label: intl.formatMessage({ id: 'IDNode' }),
                type: FILTER_TYPE.TEXT,
            },
        ],
        [intl]
    );

    const { filterResult, updateFilter } = useRowFilter(filtersDef);
    const [searchBarOpen, setSearchBarOpen] = useState(false);

    const getRowStyle = useCallback(
        (params) => {
            if (params.rowIndex === scrollToIndex) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            } else if (
                params.rowIndex === 0 &&
                params.node.rowPinned === 'top'
            ) {
                return {
                    borderTop: '1px solid ' + theme.palette.primary.main,
                    borderBottom: '1px solid ' + theme.palette.primary.main,
                };
            }
        },
        [
            scrollToIndex,
            theme.palette.primary.main,
            theme.selectedRow.background,
        ]
    );

    const getRowId = useCallback((params) => params.data.id, []);

    //we filter enter key event to prevent closing or opening edit mode
    const suppressKeyEvent = (params) => {
        return !ALLOWED_KEYS.includes(params.event.key);
    };

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressKeyboardEvent: (params) => suppressKeyEvent(params),
        }),
        []
    );

    const gridContext = useMemo(() => {
        return {
            network: network,
            editErrors: {},
            dynamicValidation: {},
            isEditing: topPinnedData ? true : false,
        };
    }, [network, topPinnedData]);

    const getRowHeight = useCallback(
        (params) =>
            params.node.rowPinned ? PINNED_ROW_HEIGHT : DEFAULT_ROW_HEIGHT,
        []
    );

    const filteredResults = useMemo(
        () => filterResult(rowData),
        [rowData, filterResult]
    );

    useEffect(() => {
        const openSearch = (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                setSearchBarOpen(true);
            }
        };
        document.addEventListener('keydown', openSearch);
        return () => document.removeEventListener('keydown', openSearch);
    }, []);

    const {
        calculateSearchBarResults,
        focusCell,
        searchInput,
        setSearchInput,
        searchResult,
    } = useSearchBar(gridRef);

    useEffect(() => {
        calculateSearchBarResults();
    }, [filteredResults, searchInput, calculateSearchBarResults]);

    return (
        <>
            {!fetched ? (
                <div>
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                </div>
            ) : (
                <>
                    <FilterPanel
                        filtersDef={filtersDef}
                        updateFilter={updateFilter}
                    />
                    <CustomAGGrid
                        ref={gridRef}
                        getRowId={getRowId}
                        rowData={filteredResults}
                        pinnedTopRowData={topPinnedData}
                        getRowStyle={getRowStyle}
                        columnDefs={columnData}
                        defaultColDef={defaultColDef}
                        enableCellTextSelection={true}
                        undoRedoCellEditing={true}
                        editType={'fullRow'}
                        onCellValueChanged={handleCellEditing}
                        onRowValueChanged={handleRowEditing}
                        onRowEditingStopped={handleEditingStopped}
                        onColumnMoved={handleColumnDrag}
                        suppressDragLeaveHidesColumns={true}
                        suppressPropertyNamesCheck={true}
                        suppressColumnVirtualisation={true}
                        suppressClickEdit={true}
                        context={gridContext}
                        onGridReady={handleGridReady}
                        shouldHidePinnedHeaderRightBorder={
                            shouldHidePinnedHeaderRightBorder
                        }
                        getRowHeight={getRowHeight}
                        onSortChanged={calculateSearchBarResults}
                        onFilterChanged={calculateSearchBarResults}
                        //onColumnMoved={calculateSearchBarResults}
                    />
                    {searchBarOpen && (
                        <SearchBar
                            searchResult={searchResult}
                            setSearchInput={(value) => {
                                setSearchInput(value);
                            }}
                            searchInput={searchInput}
                            focusCellCallback={focusCell}
                            onClose={() => setSearchBarOpen(false)}
                        />
                    )}
                </>
            )}
        </>
    );
};
