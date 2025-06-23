/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, useCallback, useState } from 'react';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs.js';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { FUNCTION_TYPES, isSensiKind, SensitivityResultTabs } from './sensitivity-analysis-result-utils';
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
import { AppState } from '../../../redux/reducer';
import { UUID } from 'crypto';
import { COMPUTATION_RESULTS_LOGS, SensiTab, SENSITIVITY_IN_DELTA_MW } from './sensitivity-analysis-result.type';
import useGlobalFilters from '../common/global-filter/use-global-filters';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { useGlobalFilterData } from '../common/global-filter/use-global-filter-data';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';

export type SensitivityAnalysisResultTabProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
};

function SensitivityAnalysisResultTab({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}: Readonly<SensitivityAnalysisResultTabProps>) {
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const [nOrNkIndex, setNOrNkIndex] = useState<number>(0);
    const [sensiTab, setSensiTab] = useState<SensiTab>(SENSITIVITY_IN_DELTA_MW);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState<boolean>(false);
    const [isCsvExportLoading, setIsCsvExportLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const { globalFilters, handleGlobalFilterChange } = useGlobalFilters({});
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterData();

    const initTable = () => {
        /* set page to 0 to avoid being in out of range (0 to 0, but page is > 0)
           for the page prop of MUI TablePagination if was not on the first page
           for the prev sensiKind */
        setPage(0);

        setIsCsvExportSuccessful(false);
    };

    const handleSensiTabChange = (newSensiTab: SensiTab) => {
        initTable();
        setSensiTab(newSensiTab);
    };

    const handleSensiNOrNkIndexChange = (event: SyntheticEvent, newNOrNKIndex: number) => {
        initTable();
        setNOrNkIndex(newNOrNKIndex);
    };

    const openLoader = useOpenLoaderShortWait({
        isLoading: sensitivityAnalysisStatus === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const handleExportResultAsCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
        exportSensitivityResultsAsCsv(studyUuid, nodeUuid, currentRootNetworkUuid, {
            csvHeaders: csvHeaders,
            resultTab: SensitivityResultTabs[nOrNkIndex].id,
            sensitivityFunctionType: isSensiKind(sensiTab) ? FUNCTION_TYPES[sensiTab] : undefined,
        })
            .then((response) => {
                response.blob().then((blob: Blob) => {
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
    }, [snackError, studyUuid, nodeUuid, currentRootNetworkUuid, intl, nOrNkIndex, sensiTab, csvHeaders]);

    return (
        <>
            <SensitivityAnalysisTabs sensiTab={sensiTab} setSensiTab={handleSensiTabChange} />
            {isSensiKind(sensiTab) && (
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
                        <Box>
                            <GlobalFilterSelector
                                onChange={handleGlobalFilterChange}
                                filters={[...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter]}
                                filterableEquipmentTypes={[EQUIPMENT_TYPES.SUBSTATION, EQUIPMENT_TYPES.VOLTAGE_LEVEL]}
                            />
                        </Box>
                        <ExportButton
                            disabled={isCsvButtonDisabled}
                            onClick={handleExportResultAsCsv}
                            isDownloadLoading={isCsvExportLoading}
                            isDownloadSuccessful={isCsvExportSuccessful}
                        />
                    </Box>
                    <PagedSensitivityAnalysisResult
                        nOrNkIndex={nOrNkIndex}
                        sensiKind={sensiTab}
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        page={page}
                        setPage={setPage}
                        setCsvHeaders={setCsvHeaders}
                        setIsCsvButtonDisabled={setIsCsvButtonDisabled}
                        globalFilters={globalFilters}
                    />
                </>
            )}
            {sensiTab === COMPUTATION_RESULTS_LOGS && (
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
}

export default SensitivityAnalysisResultTab;
