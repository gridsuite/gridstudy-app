/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import {
    DATA_KEY_TO_FILTER_KEY,
    DATA_KEY_TO_SORT_KEY,
} from './sensitivity-analysis-content';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { Box } from '@mui/system';

export const SensitivityResultTabs = [
    { id: 'N', label: 'N' },
    { id: 'N_K', label: 'N-K' },
];

const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKindIndex, setSensiKindIndex] = useState(0);
    const [page, setPage] = useState(0);
    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        DATA_KEY_TO_FILTER_KEY
    );

    // Add default sort on sensitivity col
    const defaultSortColumn = nOrNkIndex ? 'valueAfter' : 'value';
    const defaultSortOrder = SORT_WAYS.desc;
    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        dataKeyToSortKey: DATA_KEY_TO_SORT_KEY,
        initSortConfig: {
            colKey: defaultSortColumn,
            sortWay: defaultSortOrder,
        },
    });

    const initTable = (nOrNkIndex) => {
        initFilters();
        initSort(nOrNkIndex ? 'valueAfter' : 'value');

        /* set page to 0 to avoid being in out of range (0 to 0, but page is > 0)
           for the page prop of MUI TablePagination if was not on the first page
           for the prev sensiKindIndex */
        setPage(0);
    };

    const handleSensiKindIndexChange = (newSensiKindIndex) => {
        initTable(nOrNkIndex);
        setSensiKindIndex(newSensiKindIndex);
    };

    const handleSensiNOrNkIndexChange = (event, newNOrNKIndex) => {
        initTable(newNOrNKIndex);
        setNOrNkIndex(newNOrNKIndex);
    };

    return (
        <>
            <SensitivityAnalysisTabs
                sensiKindIndex={sensiKindIndex}
                setSensiKindIndex={handleSensiKindIndexChange}
            />
            {sensiKindIndex < 3 && (
                <>
                    <Tabs
                        value={nOrNkIndex}
                        onChange={handleSensiNOrNkIndexChange}
                    >
                        {SensitivityResultTabs.map((tab) => (
                            <Tab label={tab.label} />
                        ))}
                    </Tabs>
                    <PagedSensitivityAnalysisResult
                        nOrNkIndex={nOrNkIndex}
                        sensiKindIndex={sensiKindIndex}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        updateFilter={updateFilter}
                        filterSelector={filterSelector}
                        onSortChanged={onSortChanged}
                        sortConfig={sortConfig}
                        page={page}
                        setPage={setPage}
                    />
                </>
            )}
            {sensiKindIndex === 3 &&
                sensitivityAnalysisStatus === RunningStatus.SUCCEED && (
                    <>
                        <Box sx={{ height: '4px' }}></Box>
                        <ComputationReportViewer
                            reportType={ComputingType.SENSITIVITY_ANALYSIS}
                        />
                    </>
                )}
        </>
    );
};

SensitivityAnalysisResultTab.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
};

export default SensitivityAnalysisResultTab;
