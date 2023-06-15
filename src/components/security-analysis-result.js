/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import VirtualizedTable from './utils/virtualized-table';
import { FormattedMessage, useIntl } from 'react-intl';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from '@mui/material/MenuItem';
import { useSelector } from 'react-redux';
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { DEFAULT_SORT_ORDER } from './spreadsheet/utils/config-tables';
import { Button } from '@mui/material';
import { useTheme } from '@mui/styles';

export const NMK_TYPE_RESULT = {
    CONSTRAINTS_FROM_CONTINGENCIES: 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS: 'contingencies-from-constraints',
};

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        position: 'relative',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    nmkResultSelect: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(1),
    },
    button: {
        color: theme.link.color,
    },
}));

const SecurityAnalysisResult = ({ onClickNmKConstraint, result }) => {
    const classes = useStyles();
    const theme = useTheme();

    const [tabIndex, setTabIndex] = React.useState(0);

    const [nmkTypeResult, setNmkTypeResult] = React.useState(
        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
    );

    const intl = useIntl();

    const saNotif = useSelector((state) => state.saNotif);

    const switchNmkTypeResult = () => {
        setNmkTypeResult(
            nmkTypeResult === NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    function computeLoading(limitViolation) {
        return (limitViolation.loading =
            limitViolation.limitType === 'CURRENT'
                ? (100 * limitViolation.value) /
                  (limitViolation.limit * limitViolation.limitReduction)
                : undefined);
    }

    const columns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'Equipment' }),
                field: 'subjectId',
                sort: DEFAULT_SORT_ORDER,
                filter: 'agTextColumnFilter',
                width: 400,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                filter: 'agTextColumnFilter',
                width: 400,
            },
            {
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.data?.limit?.toFixed(1),
                width: 400,
            },
            {
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params) => params.data?.value?.toFixed(1),
                width: 400,
            },
            {
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params) => params.data?.loading?.toFixed(1),
                width: 400,
            },
        ];
    }, [intl]);

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        }),
        []
    );

    function renderTableN(preContingencyResult) {
        // extend data with loading
        const rows =
            preContingencyResult.limitViolationsResult.limitViolations.map(
                (limitViolation) => {
                    return {
                        subjectId: limitViolation.subjectId,
                        limitType: intl.formatMessage({
                            id: limitViolation.limitType,
                        }),
                        limit: limitViolation.limit,
                        value: limitViolation.value,
                        loading: computeLoading(limitViolation),
                    };
                }
            );

        return (
            <CustomAGGrid
                rowData={rows}
                columnDefs={columns}
                defaultColDef={defaultColDef}
            />
        );
    }

    function flattenNmKresultsContingencies(postContingencyResults) {
        const rows = [];
        postContingencyResults.forEach((postContingencyResult, index) => {
            if (
                postContingencyResult.limitViolationsResult.limitViolations
                    .length > 0 ||
                postContingencyResult.status !== 'CONVERGED'
            ) {
                rows.push({
                    contingencyIndex: index,
                    contingencyId: postContingencyResult.contingency.id,
                    computationStatus: postContingencyResult.status,
                    violationCount:
                        postContingencyResult.limitViolationsResult
                            .limitViolations.length,
                    _group: index,
                    _root: true,
                });
                postContingencyResult.limitViolationsResult.limitViolations.forEach(
                    (limitViolation) => {
                        rows.push({
                            contingencyIndex: index,
                            subjectId: limitViolation.subjectId,
                            limitType: intl.formatMessage({
                                id: limitViolation.limitType,
                            }),
                            limit: limitViolation.limit,
                            value: limitViolation.value,
                            loading: computeLoading(limitViolation),
                            side: limitViolation.side,
                            _group: index,
                            linkedElementId:
                                postContingencyResult.contingency.id,
                        });
                    }
                );
            }
        });
        return rows;
    }

    /**
     * sortResult : generate an array of index representing the rows sorted by key
     * rows are grouped by their attribute _group, the first one is root, the other children, we assume that the rows
     * are already grouped (next to each other)
     *
     * rows : rows to sort
     * rootSet : Set of keys of the root row (if key is in root, we sort root lines, not the children inside
     *           else we sort children for each root (and do not change order of root)
     * key : sort key
     * reverse : ascending or descending sort
     * isNumeric : is the associated column numeric
     * */
    function sortResult(rows, rootSet, key, reverse, isNumeric) {
        /* utility functions */
        function sortAndAddResults(result, array) {
            const compareValue = (a, b) => {
                const mult = reverse ? 1 : -1;
                if (a === undefined && b === undefined) {
                    return 0;
                }
                if (b === undefined) {
                    return -mult;
                }
                if (a === undefined) {
                    return mult;
                }
                return isNumeric
                    ? (Number(a) < Number(b) ? 1 : -1) * mult
                    : ('' + a).localeCompare(b) * mult;
            };

            const getIndexes = (k) => [k.index].concat(k.indexes);
            array
                .sort((a, b) => compareValue(a.key, b.key))
                .flatMap((k) => getIndexes(k))
                .map((i) => result.push(i));
        }

        let currentSorting = [];
        const addRowToSort = (key, index) => {
            currentSorting.push({
                key: key,
                index: index,
                indexes: [],
            });
        };

        const rootSorting = rootSet.has(key);
        let group = undefined;
        let result = [];
        /* now we sort */
        rows.forEach((row, index) => {
            if (group !== row._group) {
                /* new set of lines */
                if (!rootSorting) {
                    sortAndAddResults(result, currentSorting); // add previous batch
                    currentSorting = [];
                    result.push(index); // add current row (we do not sort root)
                } else {
                    addRowToSort(row[key], index); // we sort root
                }
                group = row._group;
            } else if (rootSorting) {
                currentSorting[currentSorting.length - 1].indexes.push(index); // we don't want to lose children
            } else {
                addRowToSort(row[key], index); // children need sorting
            }
        });
        /* add last group (if any) or all if root sorting */
        sortAndAddResults(result, currentSorting);
        return result;
    }

    const SubjectIdRenderer = useCallback(
        (props) => {
            const onClick = () => {
                onClickNmKConstraint(props?.node?.data, props?.colDef);
            };
            if (props.value) {
                return (
                    <Button className={classes.button} onClick={onClick}>
                        {props.value}
                    </Button>
                );
            }
        },
        [onClickNmKConstraint, classes.button]
    );
    const columnsNmKContingencies = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'ContingencyId' }),
                field: 'contingencyId',
                width: 200,
            },
            {
                headerName: intl.formatMessage({ id: 'ComputationStatus' }),
                field: 'computationStatus',
                width: 200,
            },
            {
                headerName: intl.formatMessage({ id: 'Constraint' }),
                field: 'subjectId',
                cellRenderer: SubjectIdRenderer,
                width: 200,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                width: 200,
            },
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'LimitName' }),
                field: 'limitName',
            },
            {
                width: 90,
                headerName: intl.formatMessage({ id: 'LimitSide' }),
                field: 'side',
            },
            {
                width: 160,
                headerName: intl.formatMessage({
                    id: 'LimitAcceptableDuration',
                }),
                field: 'acceptableDuration',
            },
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.data?.limit?.toFixed(1),
            },
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params) => params.data?.value?.toFixed(1),
            },
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params) => params.data?.loading?.toFixed(1),
            },
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl, SubjectIdRenderer]);

    const groupPostSort = (sortedRows, idField, linkedElementId) => {
        const result = [];
        // get all id rows, they will form the groups parents
        const idRows = sortedRows.filter((row) => row.data[idField] != null);
        // for each of those groups ...
        idRows.forEach((idRow) => {
            //add group's parent to result first
            result.push(idRow);
            //then add all elements which belongs to this group
            result.push(
                ...sortedRows.filter(
                    (row) => row.data[linkedElementId] === idRow.data[idField]
                )
            );
        });

        return result;
    };

    const handlePostSortRows = (params) => {
        const rows = params.nodes;
        return Object.assign(
            rows,
            groupPostSort(rows, 'contingencyId', 'linkedElementId')
        );
    };
    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.contingencyId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );
    function renderTableNmKContingencies(postContingencyResults) {
        const rows = flattenNmKresultsContingencies(postContingencyResults);
        return (
            <CustomAGGrid
                rowData={rows}
                columnDefs={columnsNmKContingencies}
                postSortRows={handlePostSortRows}
                defaultColDef={defaultColDef}
                getRowStyle={getRowStyle}
            />
        );
    }

    function flattenNmKresultsConstraints(postContingencyResults) {
        const rows = [];
        let mapConstraints = new Map();

        postContingencyResults.forEach((postContingencyResult, index) => {
            if (postContingencyResult.status !== 'CONVERGED') {
                rows.push({
                    contingencyId: postContingencyResult.contingency.id,
                    computationStatus: postContingencyResult.status,
                });
            }

            if (
                postContingencyResult.limitViolationsResult.limitViolations
                    .length > 0
            ) {
                postContingencyResult.limitViolationsResult.limitViolations.forEach(
                    (limitViolation) => {
                        let contingencies;
                        if (!mapConstraints.has(limitViolation.subjectId)) {
                            contingencies = [];
                            mapConstraints.set(
                                limitViolation.subjectId,
                                contingencies
                            );
                        } else {
                            contingencies = mapConstraints.get(
                                limitViolation.subjectId
                            );
                        }

                        contingencies.push({
                            contingencyId: postContingencyResult.contingency.id,
                            computationStatus: postContingencyResult.status,
                            constraintId: limitViolation.subjectId,
                            limitType: intl.formatMessage({
                                id: limitViolation.limitType,
                            }),
                            limit: limitViolation.limit,
                            value: limitViolation.value,
                            loading: limitViolation.loading,
                            side: limitViolation.side,
                            acceptableDuration:
                                limitViolation.acceptableDuration,
                            limitName: limitViolation.limitName,
                        });
                    }
                );
            }
        });

        let group = 0;
        mapConstraints.forEach((contingencies, subjectId) => {
            rows.push({
                subjectId: subjectId,
                _group: group,
                _root: true,
            });

            contingencies.forEach((contingency) => {
                rows.push({
                    contingencyId: contingency.contingencyId,
                    computationStatus: contingency.computationStatus,
                    constraintId: contingency.constraintId,
                    limitType: contingency.limitType,
                    limit: contingency.limit,
                    value: contingency.value,
                    loading: contingency.loading,
                    side: contingency.side,
                    acceptableDuration: contingency.acceptableDuration,
                    limitName: contingency.limitName,
                    _group: group,
                });
            });
            group++;
        });

        return rows;
    }

    function renderTableNmKConstraints(postContingencyResults) {
        const rows = flattenNmKresultsConstraints(postContingencyResults);

        return (
            <VirtualizedTable
                rows={rows}
                onCellClick={onClickNmKConstraint}
                sortable={true}
                sort={(dataKey, reverse, isNumeric) =>
                    sortResult(
                        rows,
                        new Set(['subjectId']),
                        dataKey,
                        reverse,
                        isNumeric
                    )
                }
                columns={[
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Constraint' }),
                        dataKey: 'subjectId',
                        clickable: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ContingencyId' }),
                        dataKey: 'contingencyId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ComputationStatus' }),
                        dataKey: 'computationStatus',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitName' }),
                        dataKey: 'limitName',
                    },
                    {
                        width: 90,
                        label: intl.formatMessage({ id: 'LimitSide' }),
                        dataKey: 'side',
                    },
                    {
                        width: 160,
                        label: intl.formatMessage({
                            id: 'LimitAcceptableDuration',
                        }),
                        dataKey: 'acceptableDuration',
                        numeric: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Limit' }),
                        dataKey: 'limit',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Value' }),
                        dataKey: 'value',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Loading' }),
                        dataKey: 'loading',
                        numeric: true,
                        fractionDigits: 1,
                    },
                ]}
            />
        );
    }

    function renderTabs() {
        return (
            <>
                <div className={classes.container}>
                    <div className={classes.tabs}>
                        <Tabs
                            value={tabIndex}
                            onChange={(event, newTabIndex) =>
                                setTabIndex(newTabIndex)
                            }
                        >
                            <Tab label="N" />
                            <Tab label="N-K" />
                        </Tabs>
                    </div>

                    {tabIndex === 1 && (
                        <div className={classes.nmkResultSelect}>
                            <Select
                                labelId="nmk-type-result-label"
                                value={nmkTypeResult}
                                onChange={switchNmkTypeResult}
                                autoWidth={true}
                                size="small"
                            >
                                <MenuItem
                                    value={
                                        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                                    }
                                >
                                    <FormattedMessage id="ConstraintsFromContingencies" />
                                </MenuItem>
                                <MenuItem
                                    value={
                                        NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                                    }
                                >
                                    <FormattedMessage id="ContingenciesFromConstraints" />
                                </MenuItem>
                            </Select>
                        </div>
                    )}
                </div>
                <div style={{ flexGrow: 1 }}>
                    {saNotif &&
                        result &&
                        tabIndex === 0 &&
                        renderTableN(result.preContingencyResult)}
                    {saNotif &&
                        result &&
                        tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES &&
                        renderTableNmKContingencies(
                            result.postContingencyResults
                        )}
                    {saNotif &&
                        result &&
                        tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS &&
                        renderTableNmKConstraints(
                            result.postContingencyResults
                        )}
                </div>
            </>
        );
    }

    return renderTabs();
};

SecurityAnalysisResult.defaultProps = {
    result: null,
};

SecurityAnalysisResult.propTypes = {
    result: PropTypes.object,
    onClickNmKConstraint: PropTypes.func,
};

export default SecurityAnalysisResult;
