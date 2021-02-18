/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import VirtualizedTable from './util/virtualized-table';
import { FormattedMessage, useIntl } from 'react-intl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import LoaderWithOverlay from './loader-with-overlay';
import { useCallback } from 'react';

export const NMK_TYPE_RESULT = {
    CONSTRAINTS_FROM_CONTINGENCIES: 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS: 'contingencies-from-constraints',
};

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
    },
    tabs: {
        position: 'relative',
        top: 0,
        left: 0,
    },
    nmkResultSelect: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
}));

const SecurityAnalysisResult = ({ resultFetcher, onClickNmKConstraint }) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);
    const [resultFetched, setResultFetched] = React.useState(false);

    const [nmkTypeResult, setNmkTypeResult] = React.useState(
        NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
    );

    const intl = useIntl();

    const switchNmkTypeResult = () => {
        setNmkTypeResult(
            nmkTypeResult === NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
                ? NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS
                : NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES
        );
    };

    function computeLoading(limitViolation) {
        return (limitViolation.loading =
            (100 * limitViolation.value) /
            (limitViolation.limit * limitViolation.limitReduction));
    }

    function renderTableN(preContingencyResult) {
        // extend data with loading
        const rows = preContingencyResult.limitViolations.map(
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
            <VirtualizedTable
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
                columns={[
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Equipment' }),
                        dataKey: 'subjectId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
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

    function flattenNmKresultsContingencies(postContingencyResults) {
        const rows = [];
        postContingencyResults.forEach((postContingencyResult, index) => {
            if (
                postContingencyResult.limitViolationsResult.limitViolations
                    .length > 0 ||
                !postContingencyResult.limitViolationsResult.computationOk
            ) {
                rows.push({
                    contingencyIndex: index,
                    contingencyId: postContingencyResult.contingency.id,
                    computationOk: postContingencyResult.limitViolationsResult
                        .computationOk
                        ? intl.formatMessage({ id: 'true' })
                        : intl.formatMessage({ id: 'false' }),
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
                if (a === undefined && b === undefined) return 0;
                else if (b === undefined) return -mult;
                else if (a === undefined) return mult;
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
                currentSorting[currentSorting.length - 1].indexes.push(index); // we don't want to loose children
            } else {
                addRowToSort(row[key], index); // children need sorting
            }
        });
        /* add last group (if any) or all if root sorting */
        sortAndAddResults(result, currentSorting);
        return result;
    }

    function renderTableNmKContingencies(postContingencyResults) {
        const rows = flattenNmKresultsContingencies(postContingencyResults);
        return (
            <VirtualizedTable
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
                onCellClick={onClickNmKConstraint}
                sort={(dataKey, reverse, isNumeric) =>
                    sortResult(
                        rows,
                        new Set(['contingencyId', 'computationOk']),
                        dataKey,
                        reverse,
                        isNumeric
                    )
                }
                columns={[
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ContingencyId' }),
                        dataKey: 'contingencyId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ComputationOk' }),
                        dataKey: 'computationOk',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Constraint' }),
                        dataKey: 'subjectId',
                        clickable: true,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
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

    function flattenNmKresultsConstraints(postContingencyResults) {
        const rows = [];
        let mapConstraints = new Map();

        postContingencyResults.forEach((postContingencyResult, index) => {
            if (!postContingencyResult.limitViolationsResult.computationOk) {
                rows.push({
                    contingencyId: postContingencyResult.contingency.id,
                    computationOk: postContingencyResult.limitViolationsResult
                        .computationOk
                        ? intl.formatMessage({ id: 'true' })
                        : intl.formatMessage({ id: 'false' }),
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
                            computationOk: postContingencyResult
                                .limitViolationsResult.computationOk
                                ? intl.formatMessage({ id: 'true' })
                                : intl.formatMessage({ id: 'false' }),
                            constraintId: limitViolation.subjectId,
                            limitType: intl.formatMessage({
                                id: limitViolation.limitType,
                            }),
                            limit: limitViolation.limit,
                            value: limitViolation.value,
                            loading: limitViolation.loading,
                            side: limitViolation.side,
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
                    computationOk: contingency.computationOk,
                    constraintId: contingency.constraintId,
                    limitType: contingency.limitType,
                    limit: contingency.limit,
                    value: contingency.value,
                    loading: contingency.loading,
                    side: contingency.side,
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
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
                onCellClick={onClickNmKConstraint}
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
                        label: intl.formatMessage({ id: 'ComputationOk' }),
                        dataKey: 'computationOk',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
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
                            indicatorColor="primary"
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
                    {tabIndex === 0 &&
                        renderTableN(resultFetcher.values.preContingencyResult)}
                    {tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES &&
                        renderTableNmKContingencies(
                            resultFetcher.values.postContingencyResults
                        )}
                    {tabIndex === 1 &&
                        nmkTypeResult ===
                            NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS &&
                        renderTableNmKConstraints(
                            resultFetcher.values.postContingencyResults
                        )}
                </div>
            </>
        );
    }

    const waiter = useCallback(
        (renderer) => {
            if (resultFetcher.values === undefined) {
                if (resultFetched) {
                    setResultFetched(false);
                }
                resultFetcher.get(() => setResultFetched(true));
                return (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        isFixed={true}
                        loadingMessageText={'Loading'}
                    />
                );
            }
            return renderer();
        },
        [resultFetcher, resultFetched]
    );

    return waiter(() => renderTabs());
};

SecurityAnalysisResult.defaultProps = {
    resultFetcher: null,
};

SecurityAnalysisResult.propTypes = {
    resultFetcher: PropTypes.object,
    onClickNmKConstraint: PropTypes.func,
};

export default SecurityAnalysisResult;
