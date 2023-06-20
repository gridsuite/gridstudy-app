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
                width: 300,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                filter: 'agTextColumnFilter',
                width: 300,
            },
            {
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.data?.limit?.toFixed(1),
                width: 300,
            },
            {
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params) => params.data?.value?.toFixed(1),
                width: 300,
            },
            {
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params) => params.data?.loading?.toFixed(1),
                width: 300,
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
            preContingencyResult?.limitViolationsResult?.limitViolations?.map(
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
        postContingencyResults?.forEach((postContingencyResult, index) => {
            if (
                postContingencyResult?.limitViolationsResult?.limitViolations
                    .length > 0 ||
                postContingencyResult.status !== 'CONVERGED'
            ) {
                rows.push({
                    contingencyId: postContingencyResult.contingency.id,
                    computationStatus: postContingencyResult.status,
                    violationCount:
                        postContingencyResult.limitViolationsResult
                            .limitViolations.length,
                });
                postContingencyResult?.limitViolationsResult?.limitViolations?.forEach(
                    (limitViolation) => {
                        rows.push({
                            subjectId: limitViolation.subjectId,
                            limitType: intl.formatMessage({
                                id: limitViolation.limitType,
                            }),
                            limit: limitViolation.limit,
                            value: limitViolation.value,
                            loading: computeLoading(limitViolation),
                            side: limitViolation.side,
                            linkedElementId:
                                postContingencyResult.contingency.id,
                        });
                    }
                );
            }
        });
        return rows;
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
                width: 150,
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
                width: 150,
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'LimitName' }),
                field: 'limitName',
            },
            {
                width: 90,
                headerName: intl.formatMessage({ id: 'LimitSide' }),
                field: 'side',
            },
            {
                width: 150,
                headerName: intl.formatMessage({
                    id: 'LimitAcceptableDuration',
                }),
                field: 'acceptableDuration',
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.data?.limit?.toFixed(1),
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params) => params.data?.value?.toFixed(1),
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params) => params.data?.loading?.toFixed(1),
            },
            //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
            //it is used for sorting actions
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl, SubjectIdRenderer]);

    const groupPostSort = (
        sortedRows,
        idField,
        linkedElementId,
        isContingency
    ) => {
        const result = [];
        //get all groups ids
        const idRows = sortedRows.filter((row) => row.data[idField] != null);
        if (isContingency) {
            //get all rows with no id group and add them at the beginning.
            const unconvergerRows = sortedRows.filter(
                (row) => !row.data[linkedElementId] && !row.data[idField]
            );
            result.push(...unconvergerRows);
        }
        //for each of those groups
        idRows.forEach((idRow) => {
            //add group's parent first
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

    const handlePostSortRows = (params, isFromContingency) => {
        const rows = params.nodes;
        return Object.assign(
            rows,
            groupPostSort(
                rows,
                isFromContingency ? 'contingencyId' : 'subjectId',
                'linkedElementId',
                !isFromContingency
            )
        );
    };

    const getRowStyle = useCallback(
        (params, isFromContingency) => {
            if (
                (isFromContingency && params?.data?.contingencyId) ||
                (!isFromContingency && params?.data?.subjectId)
            ) {
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
                postSortRows={(params) => handlePostSortRows(params, true)}
                defaultColDef={defaultColDef}
                getRowStyle={(params) => getRowStyle(params, true)}
            />
        );
    }

    function flattenNmKresultsConstraints(postContingencyResults) {
        const rows = [];
        let mapConstraints = new Map();

        postContingencyResults?.forEach((postContingencyResult, index) => {
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
                postContingencyResult?.limitViolationsResult?.limitViolations?.forEach(
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

        mapConstraints.forEach((contingencies, subjectId) => {
            rows.push({
                subjectId: subjectId,
            });

            contingencies?.forEach((contingency) => {
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
                    linkedElementId: subjectId,
                });
            });
        });

        return rows;
    }

    const nmKConstraintsColumns = useMemo(() => {
        return [
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'Constraint' }),
                field: 'subjectId',
                cellRenderer: SubjectIdRenderer,
            },
            {
                width: 200,
                headerName: intl.formatMessage({ id: 'ContingencyId' }),
                field: 'contingencyId',
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'ComputationStatus' }),
                field: 'computationStatus',
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'LimitName' }),
                field: 'limitName',
            },
            {
                width: 90,
                headerName: intl.formatMessage({ id: 'LimitSide' }),
                field: 'side',
            },
            {
                width: 150,
                headerName: intl.formatMessage({
                    id: 'LimitAcceptableDuration',
                }),
                field: 'acceptableDuration',
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.data?.limit?.toFixed(1),
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Value' }),
                field: 'value',
                valueFormatter: (params) => params.data?.value?.toFixed(1),
            },
            {
                width: 150,
                headerName: intl.formatMessage({ id: 'Loading' }),
                field: 'loading',
                valueFormatter: (params) => params.data?.loading?.toFixed(1),
            },
            //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
            //it is used for sorting actions
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [intl, SubjectIdRenderer]);

    function renderTableNmKConstraints(postContingencyResults) {
        const rows = flattenNmKresultsConstraints(postContingencyResults);
        return (
            <CustomAGGrid
                rowData={rows}
                columnDefs={nmKConstraintsColumns}
                postSortRows={(params) => handlePostSortRows(params, false)}
                defaultColDef={defaultColDef}
                getRowStyle={(params) => getRowStyle(params, false)}
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
                        result?.preContingencyResult &&
                        tabIndex === 0 &&
                        renderTableN(result?.preContingencyResult)}
                    {saNotif &&
                        result?.postContingencyResults &&
                        tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES &&
                        renderTableNmKContingencies(
                            result?.postContingencyResults
                        )}
                    {saNotif &&
                        result?.postContingencyResults &&
                        tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS &&
                        renderTableNmKConstraints(
                            result?.postContingencyResults
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
