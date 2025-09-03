/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import SensitivityAnalysisTabs from './sensitivity-analysis-tabs.js';
import PagedSensitivityAnalysisResult from './paged-sensitivity-analysis-result';
import { FUNCTION_TYPES, isSensiKind, SensitivityResultTabs } from './sensitivity-analysis-result-utils';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { exportSensitivityResultsAsCsv } from '../../../services/study/sensitivity-analysis';
import { downloadZipFile } from '../../../services/utils';
import { ComputingType, PARAM_LANGUAGE, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { ExportButton } from '../../utils/export-button';
import { AppState } from '../../../redux/reducer';
import { UUID } from 'crypto';
import {
    COMPUTATION_RESULTS_LOGS,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import useGlobalFilters from '../common/global-filter/use-global-filters';
import GlobalFilterSelector from '../common/global-filter/global-filter-selector';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { useGlobalFilterOptions } from '../common/global-filter/use-global-filter-options';

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
    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);

    const { globalFilters, handleGlobalFilterChange, getGlobalFilterParameter } = useGlobalFilters({});
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();

    const initTable = () => {
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
            language: language,
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
    }, [snackError, studyUuid, nodeUuid, currentRootNetworkUuid, intl, nOrNkIndex, sensiTab, csvHeaders, language]);

    const filterableEquipmentTypes: EQUIPMENT_TYPES[] = useMemo(() => {
        return sensiTab === SENSITIVITY_AT_NODE ? [] : [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER, EQUIPMENT_TYPES.LINE];
    }, [sensiTab]);

    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

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
                        <Box sx={{ display: 'flex', flexGrow: 0 }}>
                            <GlobalFilterSelector
                                onChange={handleGlobalFilterChange}
                                filters={globalFilterOptions}
                                filterableEquipmentTypes={filterableEquipmentTypes}
                                genericFiltersStrictMode={true}
                                disableGenericFilters={sensiTab === SENSITIVITY_AT_NODE}
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
                        setCsvHeaders={setCsvHeaders}
                        setIsCsvButtonDisabled={setIsCsvButtonDisabled}
                        globalFilters={getGlobalFilterParameter(globalFilters)}
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
