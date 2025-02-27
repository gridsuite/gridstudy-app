/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import {
    COMPUTATION_RESULTS_LOGS,
    FUNCTION_TYPES,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_A,
    SENSITIVITY_IN_DELTA_MW,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { exportSensitivityResultsAsCsv } from '../../../services/study/sensitivity-analysis';
import { downloadZipFile } from '../../../services/utils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { ExportButton } from '../../utils/export-button';

function getDisplayedColumns(params) {
    return params.api.getColumnDefs()?.map((c) => c.headerComponentParams.displayName);
}

const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid, currentRootNetworkUuid }) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const [nOrNkIndex, setNOrNkIndex] = useState(0);
    const [sensiKind, setSensiKind] = useState(SENSITIVITY_IN_DELTA_MW);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);
    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [page, setPage] = useState(0);
    const sensitivityAnalysisStatus = useSelector((state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);

    const initTable = () => {
        /* set page to 0 to avoid being in out of range (0 to 0, but page is > 0)
           for the page prop of MUI TablePagination if was not on the first page
           for the prev sensiKind */
        setPage(0);

        setIsCsvExportSuccessful(false);
    };

    const handleSensiKindChange = (newSensiKind) => {
        initTable();
        setSensiKind(newSensiKind);
    };

    const handleSensiNOrNkIndexChange = (event, newNOrNKIndex) => {
        initTable();
        setNOrNkIndex(newNOrNKIndex);
    };

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const sensiResultKind = [SENSITIVITY_IN_DELTA_MW, SENSITIVITY_IN_DELTA_A, SENSITIVITY_AT_NODE];

    const [csvHeaders, setCsvHeaders] = useState([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const handleGridColumnsChanged = useCallback((params) => {
        if (params?.api) {
            setCsvHeaders(getDisplayedColumns(params));
        }
    }, []);

    const handleRowDataUpdated = useCallback((params) => {
        if (params?.api) {
            setIsCsvButtonDisabled(params.api.getDisplayedRowCount() === 0);
        }
    }, []);

    const handleExportResultAsCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
        exportSensitivityResultsAsCsv(studyUuid, nodeUuid, currentRootNetworkUuid, {
            csvHeaders: csvHeaders,
            resultTab: SensitivityResultTabs[nOrNkIndex].id,
            sensitivityFunctionType: FUNCTION_TYPES[sensiKind],
        })
            .then((response) => {
                response.blob().then((blob) => {
                    downloadZipFile(blob, 'sensitivity_analyse_results.zip');
                    setIsCsvExportSuccessful(true);
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'csvExportSensitivityResultError',
                    }),
                });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [snackError, studyUuid, nodeUuid, currentRootNetworkUuid, intl, nOrNkIndex, sensiKind, csvHeaders]);

    return (
        <>
            <SensitivityAnalysisTabs sensiKind={sensiKind} setSensiKind={handleSensiKindChange} />
            {sensiResultKind.includes(sensiKind) && (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                        }}
                    >
                        <Tabs value={nOrNkIndex} onChange={handleSensiNOrNkIndexChange}>
                            {SensitivityResultTabs.map((tab) => (
                                <Tab key={tab.label} label={tab.label} />
                            ))}
                        </Tabs>
                        <ExportButton
                            disabled={isCsvButtonDisabled}
                            onClick={handleExportResultAsCsv}
                            isDownloadLoading={isCsvExportLoading}
                            isDownloadSuccessful={isCsvExportSuccessful}
                        />
                    </Box>
                    <PagedSensitivityAnalysisResult
                        nOrNkIndex={nOrNkIndex}
                        sensiKind={sensiKind}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        page={page}
                        setPage={setPage}
                        onGridColumnsChanged={handleGridColumnsChanged}
                        onRowDataUpdated={handleRowDataUpdated}
                    />
                </>
            )}
            {sensiKind === COMPUTATION_RESULTS_LOGS && (
                <>
                    <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
                    {(sensitivityAnalysisStatus === RunningStatus.SUCCEED ||
                        sensitivityAnalysisStatus === RunningStatus.FAILED) && (
                        <ComputationReportViewer reportType={ComputingType.SENSITIVITY_ANALYSIS} />
                    )}
                </>
            )}
        </>
    );
};

SensitivityAnalysisResultTab.propTypes = {
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
    currentRootNetworkUuid: PropTypes.string.isRequired,
};

export default SensitivityAnalysisResultTab;
