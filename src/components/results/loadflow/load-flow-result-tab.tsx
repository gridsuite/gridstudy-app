/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage } from 'react-intl/lib';
import { LoadFlowTabProps, QueryParamsType } from './load-flow-result.type';
import { LoadFlowResult } from './load-flow-result';
import { useNodeData } from '../../study-container';
import { fetchLimitViolations, fetchLoadFlowResult } from '../../../services/study/loadflow';
import { SORT_WAYS, useAgGridSort } from 'hooks/use-aggrid-sort';
import {
    FROM_COLUMN_TO_FIELD,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const loadflowResultInvalidations = ['loadflowResult'];
    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: 'subjectId',
        sortWay: SORT_WAYS.asc,
    });

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        FROM_COLUMN_TO_FIELD,
        () => {}
    );
    const [tabIndex, setTabIndex] = useState(0);
    const [hasFilter, setHasFilter] = useState<boolean>(false);

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(hasFilter, setHasFilter);

    const fetchLoadflowResultWithQueryParams = useCallback(
        (studyUuid: string, nodeUuid: string) => {
            /* if (tabIndex === LOGS_TAB_INDEX) {
                return Promise.resolve();
            } */

            const queryParams: QueryParamsType = {};

            if (sortConfig) {
                const { sortWay, colKey } = sortConfig;
                queryParams['sort'] = {
                    colKey: FROM_COLUMN_TO_FIELD[colKey],
                    sortWay,
                };
            }

            if (filterSelector) {
                queryParams['filters'] = filterSelector;
            }

            return fetchLimitViolations(studyUuid, nodeUuid, queryParams);
        },
        [sortConfig, filterSelector]
    );

    const [loadflowResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchLoadflowResultWithQueryParams,
        loadflowResultInvalidations
    );

    return (
        <>
            <div>
                <Tabs
                    value={tabIndex}
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsCurrentViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsVoltageViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'LoadFlowResultsStatus'} />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'ComputationResultsLogs'} />
                        }
                    />
                </Tabs>
            </div>
            <LoadFlowResult
                result={loadflowResult}
                studyUuid={studyUuid}
                nodeUuid={nodeUuid}
                tabIndex={tabIndex}
                isWaiting={isWaiting}
                sortProps={{
                    onSortChanged,
                    sortConfig,
                }}
                filterProps={{
                    updateFilter,
                    filterSelector,
                }}
                filterEnums={filterEnums}
                fetchLoadflowResultWithQueryParams={
                    fetchLoadflowResultWithQueryParams
                }
            />
        </>
    );
};
