/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import {
    COMPUTATION_RESULTS_LOGS,
    DATA_KEY_TO_FILTER_KEY,
    FUNCTION_TYPES,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_A,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-content';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { REPORT_TYPES } from '../../utils/report-type';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import React, { useCallback } from 'react';
import { exportSensitivityResultsAsCsv } from '../../../services/study/sensitivity-analysis';
import { downloadZipFile } from '../../../services/utils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

export const SensitivityResultTabs = [
    { id: 'N', label: 'N' },
    { id: 'N_K', label: 'N-K' },
];

const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKind, setSensiKind] = useState(SENSITIVITY_IN_DELTA_MW);
    const [resultDownloadSuccess, setResultDownloadSuccess] = useState(false);
    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [page, setPage] = useState(0);
    const sensitivityAnalysisStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        DATA_KEY_TO_FILTER_KEY
    );

    // Add default sort on sensitivity col
    const defaultSortColumn = nOrNkIndex ? 'valueAfter' : 'value';
    const defaultSortOrder = SORT_WAYS.asc;
    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: defaultSortColumn,
        sortWay: defaultSortOrder,
    });
    const initTable = (nOrNkIndex) => {
        initFilters();
        initSort(nOrNkIndex ? 'valueAfter' : 'value');

        /* set page to 0 to avoid being in out of range (0 to 0, but page is > 0)
           for the page prop of MUI TablePagination if was not on the first page
           for the prev sensiKind */
        setPage(0);
        setResultDownloadSuccess(false);
    };

    const handleSensiKindChange = (newSensiKind) => {
        initTable(nOrNkIndex);
        setSensiKind(newSensiKind);
        setResultDownloadSuccess(false);
    };

    const handleSensiNOrNkIndexChange = (event, newNOrNKIndex) => {
        initTable(newNOrNKIndex);
        setNOrNkIndex(newNOrNKIndex);
        setResultDownloadSuccess(false);
    };

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const sensiResultKind = [
        SENSITIVITY_IN_DELTA_MW,
        SENSITIVITY_IN_DELTA_A,
        SENSITIVITY_AT_NODE,
    ];

    const [csvHeaders, setCsvHeaders] = useState([]);

    const handleCsvHeadersChange = useCallback((headersCsv) => {
        setCsvHeaders(headersCsv);
    }, []);

    const exportResultAsCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setResultDownloadSuccess(false);
        exportSensitivityResultsAsCsv(studyUuid, nodeUuid, {
            csvHeaders,
            resultTab: SensitivityResultTabs[nOrNkIndex].id,
            sensitivityFunctionType: FUNCTION_TYPES[sensiKind],
        })
            .then((response) => {
                response.blob().then((blob) => {
                    downloadZipFile(blob, 'sensitivity_analyse_results.zip');
                    setResultDownloadSuccess(true);
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'csvExportSensitivityResultError',
                    }),
                });
                setResultDownloadSuccess(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        snackError,
        studyUuid,
        nodeUuid,
        csvHeaders,
        intl,
        nOrNkIndex,
        sensiKind,
    ]);

    return (
        <>
            <SensitivityAnalysisTabs
                sensiKind={sensiKind}
                setSensiKind={handleSensiKindChange}
            />
            {sensiResultKind.includes(sensiKind) && (
                <>
                    <Tabs
                        value={nOrNkIndex}
                        onChange={handleSensiNOrNkIndexChange}
                    >
                        {SensitivityResultTabs.map((tab) => (
                            <Tab key={tab.label} label={tab.label} />
                        ))}
                    </Tabs>
                    <PagedSensitivityAnalysisResult
                        nOrNkIndex={nOrNkIndex}
                        sensiKind={sensiKind}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        page={page}
                        setPage={setPage}
                        sortProps={{
                            onSortChanged,
                            sortConfig,
                        }}
                        filterProps={{
                            updateFilter,
                            filterSelector,
                        }}
                        handleCsvHeadersChange={handleCsvHeadersChange}
                        exportResultAsCsv={exportResultAsCsv}
                        isCsvExportLoading={isCsvExportLoading}
                        isCsvExportSuccessful={resultDownloadSuccess}
                    />
                </>
            )}
            {sensiKind === COMPUTATION_RESULTS_LOGS && (
                <>
                    <Box sx={{ height: '4px' }}>
                        {openLoader && <LinearProgress />}
                    </Box>
                    {(sensitivityAnalysisStatus === RunningStatus.SUCCEED ||
                        sensitivityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer
                            reportType={REPORT_TYPES.SENSITIVITY_ANALYSIS}
                        />
                    )}
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
