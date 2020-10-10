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
import { useIntl } from 'react-intl';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

const SecurityAnalysisResult = ({ result }) => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const intl = useIntl();

    function renderTableN(preContingencyResult) {
        return (
            <VirtualizedTable
                rowCount={preContingencyResult.limitViolations.length}
                rowGetter={({ index }) =>
                    preContingencyResult.limitViolations[index]
                }
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
                ]}
            />
        );
    }

    function flattenNmKresults(postContingencyResults) {
        const rows = [];
        postContingencyResults.forEach((postContingencyResult, index) => {
            rows.push({
                contingencyIndex: index,
                contingencyId: postContingencyResult.contingency.id,
                computationOk: postContingencyResult.limitViolationsResult
                    .computationOk
                    ? intl.formatMessage({ id: 'true' })
                    : intl.formatMessage({ id: 'false' }),
            });
            postContingencyResult.limitViolationsResult.limitViolations.forEach(
                (limitViolation) => {
                    rows.push({
                        contingencyIndex: index,
                        subjectId: limitViolation.subjectId,
                        limitType: limitViolation.limitType,
                        limit: limitViolation.limit,
                        value: limitViolation.value,
                    });
                }
            );
        });
        return rows;
    }

    function renderTableNmK(postContingencyResults) {
        const rows = flattenNmKresults(postContingencyResults);
        return (
            <VirtualizedTable
                rowCount={rows.length}
                rowGetter={({ index }) => rows[index]}
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
                ]}
            />
        );
    }

    function renderTabs() {
        return (
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
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
                        {tabIndex === 0 &&
                            renderTableN(result.preContingencyResult)}
                        {tabIndex === 1 &&
                            renderTableNmK(result.postContingencyResults)}
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
};

export default SecurityAnalysisResult;
