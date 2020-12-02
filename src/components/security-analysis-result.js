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
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';

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

const SecurityAnalysisResult = ({ result, onClickConstraint }) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);

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
                    limitTypeIdent: limitViolation.limitType,
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
                        label: intl.formatMessage({ id: 'ID' }),
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
                    .length > 0
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
                });
                postContingencyResult.limitViolationsResult.limitViolations.forEach(
                    (limitViolation) => {
                        rows.push({
                            contingencyIndex: index,
                            subjectId: limitViolation.subjectId,
                            limitTypeIdent: limitViolation.limitType,
                            limitType: intl.formatMessage({
                                id: limitViolation.limitType,
                            }),
                            limit: limitViolation.limit,
                            value: limitViolation.value,
                            loading: computeLoading(limitViolation),
                            side: limitViolation.side,
                        });
                    }
                );
            }
        });
        return rows;
    }

    function renderTableNmKContingencies(postContingencyResults) {
        const rows = flattenNmKresultsContingencies(postContingencyResults);
        return (
            <VirtualizedTable
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
                onCellClick={onClickConstraint}
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'subjectId',
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Limit' }),
                        dataKey: 'limit',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Value' }),
                        dataKey: 'value',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Loading' }),
                        dataKey: 'loading',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                ]}
            />
        );
    }

    function flattenNmKresultsConstraints(postContingencyResults) {
        const rows = [];
        let mapConstraints = new Map();

        postContingencyResults.forEach((postContingencyResult, index) => {
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
                            constraintId: limitViolation.subjectId,
                            limitTypeIdent: limitViolation.limitType,
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

        mapConstraints.forEach((contingencies, subjectId) => {
            rows.push({
                subjectId: subjectId,
            });

            contingencies.forEach((contingency) => {
                rows.push({
                    contingencyId: contingency.contingencyId,
                    constraintId: contingency.constraintId,
                    limitTypeIdent: contingency.limitTypeIdent,
                    limitType: contingency.limitType,
                    limit: contingency.limit,
                    value: contingency.value,
                    loading: contingency.loading,
                    side: contingency.side,
                });
            });
        });

        return rows;
    }

    function renderTableNmKConstraints(postContingencyResults) {
        const rows = flattenNmKresultsConstraints(postContingencyResults);

        return (
            <VirtualizedTable
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
                onCellClick={onClickConstraint}
                columns={[
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'subjectId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ContingencyId' }),
                        dataKey: 'contingencyId',
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LimitType' }),
                        dataKey: 'limitType',
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Limit' }),
                        dataKey: 'limit',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Value' }),
                        dataKey: 'value',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Loading' }),
                        dataKey: 'loading',
                        numeric: true,
                        fractionDigits: 1,
                        side: 'side',
                    },
                ]}
            />
        );
    }

    function renderTabs() {
        return (
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
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
                        {tabIndex === 0 &&
                            renderTableN(result.preContingencyResult)}
                        {tabIndex === 1 &&
                            nmkTypeResult ===
                                NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES &&
                            renderTableNmKContingencies(
                                result.postContingencyResults
                            )}
                        {tabIndex === 1 &&
                            nmkTypeResult ===
                                NMK_TYPE_RESULT.CONTINGENCIES_FROM_CONSTRAINTS &&
                            renderTableNmKConstraints(
                                result.postContingencyResults
                            )}
                    </div>
                )}
            </AutoSizer>
        );
    }

    return result && renderTabs();
};

SecurityAnalysisResult.defaultProps = {
    result: null,
};

SecurityAnalysisResult.propTypes = {
    result: PropTypes.object,
    onClickConstraint: PropTypes.func,
};

export default SecurityAnalysisResult;
