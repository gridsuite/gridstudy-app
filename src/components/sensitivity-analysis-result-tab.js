/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import { fetchSensitivityAnalysisResultTabbed } from '../utils/rest-api';
import WaitingLoader from './util/waiting-loader';
import SensitivityAnalysisResult from './sensitivity-analysis-result';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CHANGE_WAYS, KeyedColumnsRowIndexer } from '@gridsuite/commons-ui';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage } from 'react-intl/lib';
import { TablePagination } from '@mui/material';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';

const sensitivityAnalysisResultInvalidations = ['sensitivityAnalysisResult'];

export const FUNCTION_TYPES = Object.freeze([
    'BRANCH_ACTIVE_POWER_1',
    'BRANCH_CURRENT_1',
    'BUS_VOLTAGE',
]);

const PAGE_OPTIONS = Object.freeze([
    10,
    25,
    100,
    1000,
    { label: 'All', value: -1 },
]);
const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[1];

export const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKindIndex, setSensiKindIndex] = useState(0);

    const pagedSensitivityResult = useMemo(
        () => (
            <>
                <PagedSensitivityResult
                    nOrNkIndex={nOrNkIndex}
                    sensiKindIndex={sensiKindIndex}
                    studyUuid={studyUuid}
                    nodeUuid={nodeUuid}
                />
            </>
        ),
        [nOrNkIndex, sensiKindIndex, studyUuid, nodeUuid]
    );

    return (
        <>
            <SensibilityTabs
                sensiKindIndex={sensiKindIndex}
                setSensiKindIndex={setSensiKindIndex}
            />
            <Tabs
                value={nOrNkIndex}
                onChange={(event, newTabIndex) => setNOrNkIndex(newTabIndex)}
            >
                <Tab label="N" />
                <Tab label="N-K" />
            </Tabs>
            {pagedSensitivityResult}
        </>
    );
};

const DATA_KEY_TO_FILTER_KEY = {
    funcId: 'functionIds',
    varId: 'variableIds',
    contingencyId: 'contingencyIds',
};

const DATA_KEY_TO_SORT_KEY = {
    funcId: 'FUNCTION',
    varId: 'VARIABLE',
    contingencyId: 'CONTINGENCY',
    functionReference: 'REFERENCE',
    value: 'SENSITIVITY',
    functionReferenceAfter: 'POST_REFERENCE',
    valueAfter: 'POST_SENSITIVITY',
};

function addIndexerParamsToSelector(indexer, selector) {
    if (!indexer) return;

    const sortKeysWithWeightAndDirection = {};
    const sortingAsKeyAndDirSign = indexer.getSortingAsKeyAndCodedRank();
    sortingAsKeyAndDirSign.forEach(([k, v]) => {
        const sortKey = DATA_KEY_TO_SORT_KEY[k];
        if (sortKey) sortKeysWithWeightAndDirection[sortKey] = v;
    });
    if (Object.keys(sortKeysWithWeightAndDirection).length) {
        selector.sortKeysWithWeightAndDirection =
            sortKeysWithWeightAndDirection;
    }
    const userFiltering = indexer.getUserFiltering();
    Object.entries(userFiltering).forEach(([k, v]) => {
        const filterKey = DATA_KEY_TO_FILTER_KEY[k];
        if (filterKey) selector[filterKey] = v;
    });
}

const tellDiff = (what, was, now) => {
    if (was !== now) {
        console.debug(what + ' has changed', was, now);
        return true;
    }
    return false;
};

function PagedSensitivityResult({
    nOrNkIndex,
    sensiKindIndex,
    studyUuid,
    nodeUuid,
}) {
    const [userRowsPerPage, setUserRowsPerPage] = useState(DEFAULT_PAGE_COUNT);
    const [page, setPage] = useState(0);
    const [version, setVersion] = useState();
    const [overAllCount, setOverAllCount] = useState(null);
    const [filteredCount, setFilteredCount] = useState(null);

    const synthRef = useRef();
    const [next, prev] = [{}, synthRef.current];
    next.sensiKindIndex = sensiKindIndex;
    next.nOrNkIndex = nOrNkIndex;
    next.nodeUuid = nodeUuid;
    next.indexer = prev?.indexer;
    next.askedFilterVersion = prev?.askedFilterVersion;
    next.page = prev?.page;
    next.userRowsPerPage = prev?.userRowsPerPage;
    next.version = prev?.version;

    if (
        tellDiff('node', prev?.nodeUuid, nodeUuid) ||
        tellDiff('sensi kind ', prev?.sensiKindIndex, sensiKindIndex) ||
        tellDiff('pre/post aleas', prev?.nOrNkIndex, nOrNkIndex)
    ) {
        setUserRowsPerPage(DEFAULT_PAGE_COUNT);
        setPage(0);
        setOverAllCount(null);
        setFilteredCount(null);
        setVersion(0);

        const pars = [true, false, null, setVersion];
        const rowIndexer = new KeyedColumnsRowIndexer(...pars);
        const colKey = nOrNkIndex === 0 ? 'value' : 'valueAfter';
        const changeWay = CHANGE_WAYS.SIMPLE;
        rowIndexer.updateSortingFromUser(colKey, changeWay);
        rowIndexer.updateSortingFromUser(colKey, changeWay);

        next.indexer = rowIndexer;
        next.askedFilterVersion = rowIndexer.filterVersion;
        next.version = rowIndexer.version;
        next.page = 0;
    } else if (prev.isFetchNeedy) {
        next.fetcher = prev.fetcher;
        next.isFetchNeedy = prev.isFetchNeedy;
        next.askedFilterVersion = prev.askedFilterVersion;
    } else if (!prev.fetched) {
        // probably fetch failed, worth retrying
    } else if (prev.fetched.sensitivities.length === overAllCount) {
        if (
            userRowsPerPage <= 0 ||
            (prev.userRowsPerPage >= 0 &&
                prev.userRowsPerPage <= userRowsPerPage)
        ) {
            // enough room when having already all -> keep
            next.fetcher = prev.fetcher;
            next.askedFilterVersion = prev.indexer.filterVersion;
        } else {
            // strictly less room when having already all -> trim
            const copy = [...prev.fetched.sensitivities];
            copy.splice(userRowsPerPage);
            next.fetcher = () =>
                Promise.resolve({
                    ...prev.fetched,
                    sensitivities: copy,
                });
            next.fetched = null; // to trigger change on *next* turn
        }
        next.userRowsPerPage = userRowsPerPage;
    } else if (prev.indexer.filterVersion !== prev.askedFilterVersion) {
        tellDiff(
            'filter version',
            prev.askedFilterVersion,
            prev.indexer.filterVersion
        );
    } else if (prev.page !== page) {
        tellDiff('page', prev.page, page);
    } else if (filteredCount === prev.fetched.sensitivities.length) {
        if (filteredCount > userRowsPerPage && userRowsPerPage >= 0) {
            // strictly less room when having all filtered -> trim
            const copy = [...prev.fetched.sensitivities];
            copy.splice(userRowsPerPage);
            next.fetcher = () =>
                Promise.resolve({
                    ...prev.fetched,
                    sensitivities: copy,
                });
            next.fetched = null;
            next.userRowsPerPage = userRowsPerPage;
        } else if (prev.fetcher) {
            next.fetcher = prev.fetcher;
        }
    } else if (prev.userRowsPerPage !== userRowsPerPage) {
        tellDiff('page size', prev.userRowsPerPage, userRowsPerPage);
    } else if (prev.version !== version) {
        tellDiff('sorting', prev.version, version);
    } else {
        next.fetcher = prev.fetcher;
    }

    if (!next.fetcher) {
        next.isFetchNeedy = true;
        next.askedFilterVersion = next.indexer?.filterVersion;
        if (filteredCount >= userRowsPerPage) {
            next.page = page;
        } else {
            next.page = 0;
            if (page > 0) setPage(0);
        }
        next.userRowsPerPage = userRowsPerPage;
        next.version = next.indexer?.version;
        next.fetcher = () => {
            const selector = {
                isJustBefore: nOrNkIndex === 0,
                functionType: FUNCTION_TYPES[sensiKindIndex],
                offset: next.page * userRowsPerPage,
                chunkSize: userRowsPerPage,
            };
            addIndexerParamsToSelector(next.indexer, selector);

            return fetchSensitivityAnalysisResultTabbed(
                studyUuid,
                nodeUuid,
                selector
            );
        };
    }

    const handleChangePage = useCallback(
        (evt, pageIndex) => {
            setPage(pageIndex);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = useCallback((evt) => {
        setUserRowsPerPage(parseInt(evt.target.value));
    }, []);

    // beware : loading does not pass to true as soon as could be thought
    const [fetched, isLoading, errorMessage] = useNodeData(
        studyUuid,
        nodeUuid,
        next.fetcher,
        sensitivityAnalysisResultInvalidations
    );

    if (!prev?.isFetchNeedy) {
        // OK, next
    } else if (fetched && prev.fetched !== fetched) {
        next.isFetchNeedy = false;
        setOverAllCount(fetched.totalSensitivitiesCount);
        setFilteredCount(fetched.filteredSensitivitiesCount);
        next.indexer.setColFilterOuterParams('funcId', fetched.allFunctionIds);
        next.indexer.setColFilterOuterParams('varId', fetched.allVariablesIds);
        const contingencyIds = fetched.allContingencyIds;
        next.indexer.setColFilterOuterParams('contingencyId', contingencyIds);
    } else if (!isLoading && prev?.isLoading && errorMessage) {
        next.isFetchNeedy = false; // for next change to try and fetch
    }
    next.fetched = fetched;
    next.isLoading = isLoading;

    synthRef.current = next;

    return (
        <>
            <WaitingLoader message={'LoadingRemoteData'} loading={isLoading}>
                {fetched?.sensitivities && (
                    <SensitivityAnalysisResult
                        result={fetched?.sensitivities}
                        nOrNkIndex={nOrNkIndex}
                        sensiToIndex={sensiKindIndex}
                        indexer={next.indexer}
                    />
                )}
            </WaitingLoader>
            <TablePagination
                component="div"
                rowsPerPageOptions={PAGE_OPTIONS}
                colSpan={3}
                count={filteredCount ?? 0}
                rowsPerPage={userRowsPerPage}
                page={next?.page ?? 0}
                showFirstButton={true}
                showLastButton={true}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
            >
                <span>{isLoading ? 'waiting' : 'finished'}</span>
            </TablePagination>
        </>
    );
}

function SensibilityTabs({ sensiKindIndex, setSensiKindIndex }) {
    return (
        <Tabs
            value={sensiKindIndex}
            onChange={(event, newTabIndex) => setSensiKindIndex(newTabIndex)}
        >
            <Tab label={<FormattedMessage id={'SensitivityInDeltaMW'} />} />
            <Tab label={<FormattedMessage id={'SensitivityInDeltaA'} />} />
            <Tab label={<FormattedMessage id={'SensitivityAtNode'} />} />
        </Tabs>
    );
}
