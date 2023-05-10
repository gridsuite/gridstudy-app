/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
import { FilterPanel } from './spreadsheet/filter-panel/filter-panel';
import { Box } from '@mui/system';
import {
    FILTER_TARGET,
    FILTER_TYPE,
    useGroupFilter,
} from './spreadsheet/filter-panel/use-group-filter';
import { AppBar, Button, Grid, IconButton, TextField } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

const ShortCircuitAnalysisResult = ({ result }) => {
    const intl = useIntl();
    const theme = useTheme();
    const gridRef = useRef();
    const [bottomBarOpen, setBottomBarOpen] = useState(false);

    const shortCircuitNotif = useSelector((state) => state.shortCircuitNotif);

    useEffect(() => {
        const openSearch = (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                setBottomBarOpen(true);
            }
        };
        document.addEventListener('keydown', openSearch);
        return () => document.removeEventListener('keydown', openSearch);
    }, []);

    const filtersDef = useMemo(
        () => [
            {
                field: 'elementId',
                label: intl.formatMessage({ id: 'IDNode' }),
                type: FILTER_TYPE.TEXT,
                target: FILTER_TARGET.PARENT,
            },
            {
                field: 'faultType',
                label: intl.formatMessage({ id: 'Type' }),
                type: FILTER_TYPE.SELECT,
                options: [intl.formatMessage({ id: 'THREE_PHASE' })],
                target: FILTER_TARGET.PARENT,
            },
            {
                field: 'connectableId',
                label: intl.formatMessage({ id: 'Feeders' }),
                type: FILTER_TYPE.TEXT,
                target: FILTER_TARGET.CHILD,
            },
            {
                field: 'limitType',
                label: intl.formatMessage({ id: 'LimitType' }),
                type: FILTER_TYPE.SELECT,
                options: [
                    intl.formatMessage({ id: 'LOW_SHORT_CIRCUIT_CURRENT' }),
                    intl.formatMessage({ id: 'HIGH_SHORT_CIRCUIT_CURRENT' }),
                ],
                target: FILTER_TARGET.PARENT,
            },
        ],
        [intl]
    );

    const focusCell = (index, columnName) => {
        gridRef.current?.api.ensureIndexVisible(index, 'middle');
        gridRef.current?.api.setFocusedCell(index, columnName);
    };

    const { filterResult, updateFilter } = useGroupFilter(
        filtersDef,
        'elementId',
        'parentElementId'
    );

    const columns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
                cellRenderer: (props) => console.log('aaa', props),
            },
            {
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
            },
            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            },
            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                fractionDigits: 1,
                numeric: true,
            },
        ];
    }, [intl]);

    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    function flattenResult(shortcutAnalysisResult) {
        const rows = [];
        shortcutAnalysisResult?.faults?.forEach((f) => {
            const fault = f.fault;
            const limitViolations = f.limitViolations;
            let firstLimitViolation;
            if (limitViolations.length > 0) {
                let lv = limitViolations[0];
                firstLimitViolation = {
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : null,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : null,
                    limitName: lv.limitName,
                    current: lv.value,
                };
            }
            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: f.shortCircuitPower,
                current: f.current,
                ...firstLimitViolation,
            });
            limitViolations.slice(1).forEach((lv) => {
                rows.push({
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : null,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? lv.limit
                            : null,
                    limitName: lv.limitName,
                    current: lv.value,
                });
            });
            const feederResults = f.feederResults;
            feederResults.forEach((fr) => {
                rows.push({
                    connectableId: fr.connectableId,
                    current: fr.current,
                    parentElementId: fault.elementId,
                });
            });
        });
        return rows;
    }

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
        }),
        []
    );

    const rows = useMemo(
        () => filterResult(flattenResult(result)),
        [result, filterResult, flattenResult]
    );

    const rowsWithoutHiddenValues = useMemo(
        () =>
            rows.map((row) => {
                const rowWithoutHiddenValue = {};
                const displayedColumnsField = columns.map(
                    (column) => column.field
                );

                for (const [key, value] of Object.entries(row)) {
                    if (displayedColumnsField.includes(key)) {
                        rowWithoutHiddenValue[key] = value;
                    }
                }

                return rowWithoutHiddenValue;
            }),
        [rows, columns]
    );

    const renderResult = () => {
        return (
            result &&
            shortCircuitNotif && (
                <CustomAGGrid
                    ref={gridRef}
                    rowData={rows}
                    columnDefs={columns}
                    getRowStyle={getRowStyle}
                    defaultColDef={defaultColDef}
                />
            )
        );
    };

    return (
        <>
            <Box m={1}>
                <FilterPanel
                    updateFilter={updateFilter}
                    filtersDef={filtersDef}
                />
            </Box>
            {renderResult()}
            {bottomBarOpen && (
                <Box height={16} m={3}>
                    <Counter
                        rows={rowsWithoutHiddenValues}
                        onChange={focusCell}
                        onClose={() => setBottomBarOpen(false)}
                    />
                </Box>
            )}
        </>
    );
};

const Counter = ({ rows, onChange, onClose }) => {
    const searchInputRef = useRef();
    const [counter, setCounter] = useState(0);
    const [searchResult, setSearchResult] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    const handleChange = (value) => {
        setSearchInput(value);

        if (!value) {
            setSearchResult([]);
            setCounter(0);
            return;
        }

        const newSearchResult = [];
        rows.forEach((row, index) =>
            searchOccurencesInObjectValues(row, value).forEach((r) =>
                newSearchResult.push([index, r])
            )
        );

        //onChange(newSearchResult[0][0], newSearchResult[0][1]);

        //searchInputRef.current.focus();
        setSearchResult(newSearchResult);
        setCounter(0);
    };

    const searchOccurencesInObjectValues = (object, str) => {
        const result = [];
        console.log('object', object);

        for (const [key, value] of Object.entries(object)) {
            console.log(value);
            if (value?.toString().indexOf(str) >= 0) {
                result.push(key);
            }
        }

        return result;
    };

    const updateCounter = useCallback(
        (action) => {
            if (action === 'NEXT') {
                setCounter((oldCounter) => {
                    const newCounter =
                        oldCounter + 1 < searchResult.length
                            ? oldCounter + 1
                            : 0;
                    onChange(
                        searchResult[newCounter][0],
                        searchResult[newCounter][1]
                    );
                    return newCounter;
                });
            } else if (action === 'PREV') {
                setCounter((oldCounter) => {
                    const newCounter =
                        oldCounter - 1 >= 0
                            ? oldCounter - 1
                            : searchResult.length - 1;
                    onChange(
                        searchResult[newCounter][0],
                        searchResult[newCounter][1]
                    );
                    return newCounter;
                });
            }
        },
        [searchResult, onChange]
    );

    // useEffect(() => {
    //     const openSearch = (e) => {
    //         if (e.key === 'Enter') {
    //             e.preventDefault();
    //             updateCounter('NEXT');
    //         }
    //     };
    //     document.addEventListener('keydown', openSearch);

    //     return () => document.removeEventListener('keydown', openSearch);
    // }, [updateCounter]);

    const noResult = useMemo(() => searchResult.length === 0, [searchResult]);

    return (
        <AppBar style={{ bottom: 0, top: 'auto' }}>
            <Grid
                spacing={2}
                p={1}
                alignItems={'center'}
                direction="row"
                container
            >
                <Grid xs={6} item>
                    <TextField
                        inputRef={searchInputRef}
                        size="small"
                        value={searchInput}
                        onChange={(e) => handleChange(e.target.value)}
                        label="Rechercher"
                    />
                    <IconButton
                        disabled={noResult}
                        onClick={() => updateCounter('PREV')}
                    >
                        <KeyboardArrowUpIcon />
                    </IconButton>
                    <IconButton
                        disabled={noResult}
                        onClick={() => updateCounter('NEXT')}
                    >
                        <KeyboardArrowDownIcon />
                    </IconButton>
                    {searchInput.length !== 0 && !noResult && (
                        <>
                            Occurence {counter + 1} sur {searchResult.length}
                        </>
                    )}
                    {searchInput.length !== 0 && noResult && (
                        <>Aucun résultat</>
                    )}
                </Grid>
                <Grid xs={6} item textAlign={'right'}>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </AppBar>
    );
};

ShortCircuitAnalysisResult.defaultProps = {
    result: null,
};

ShortCircuitAnalysisResult.propTypes = {
    result: PropTypes.object,
};

export default ShortCircuitAnalysisResult;
