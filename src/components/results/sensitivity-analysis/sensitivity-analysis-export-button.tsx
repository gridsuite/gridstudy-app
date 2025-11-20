/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ExportCsvButton, PARAM_LANGUAGE, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { downloadZipFile } from '../../../services/utils';
import type { UUID } from 'node:crypto';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { useFilterSelector } from 'hooks/use-filter-selector';
import {
    DATA_KEY_TO_FILTER_KEY_N,
    DATA_KEY_TO_FILTER_KEY_NK,
    DATA_KEY_TO_SORT_KEY,
    FUNCTION_TYPES,
    isSensiKind,
    mappingTabs,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { exportSensitivityResultsAsCsv } from 'services/study/sensitivity-analysis';
import { SensiKind } from './sensitivity-analysis-result.type';
import { FilterType as AgGridFilterType, SortWay } from '../../../types/custom-aggrid-types';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { GlobalFilters } from '../common/global-filter/global-filter-types';

interface SensitivityExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    csvHeaders: string[];
    nOrNkIndex: number;
    sensiKind: SensiKind;
    globalFilters?: GlobalFilters;
    disabled?: boolean;
}

export const SensitivityExportButton: FunctionComponent<SensitivityExportButtonProps> = (props) => {
    const {
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        csvHeaders,
        disabled = false,
        nOrNkIndex,
        sensiKind,
        globalFilters,
    } = props;
    const { snackError } = useSnackMessage();

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);

    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);
    const { filters } = useFilterSelector(AgGridFilterType.SensitivityAnalysis, mappingTabs(sensiKind, nOrNkIndex));
    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SENSITIVITY_ANALYSIS_RESULT_SORT_STORE][mappingTabs(sensiKind, nOrNkIndex)]
    );

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [studyUuid, currentRootNetworkUuid, nodeUuid, nOrNkIndex, sensiKind, globalFilters, sortConfig, appTabIndex]);

    useEffect(() => {
        if (disabled) {
            // reinit the success state when the button is disabled,
            // for example when the calcul status change or results change
            setIsCsvExportSuccessful(false);
        }
    }, [disabled]);

    const exportCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
        const mappedFilters = filters?.map((elem) => {
            const keyMap = nOrNkIndex === 0 ? DATA_KEY_TO_FILTER_KEY_N : DATA_KEY_TO_FILTER_KEY_NK;
            const newColumn = keyMap[elem.column as keyof typeof keyMap];
            return { ...elem, column: newColumn };
        });
        const sortSelector = sortConfig?.length
            ? {
                  sortKeysWithWeightAndDirection: Object.fromEntries(
                      sortConfig.map((value) => [
                          DATA_KEY_TO_SORT_KEY[value.colId as keyof typeof DATA_KEY_TO_SORT_KEY],
                          value.sort === SortWay.DESC ? -1 : 1,
                      ])
                  ),
              }
            : {};
        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKind],
            offset: 0,
            pageNumber: 0,
            pageSize: -1, // meaning 'All'
            ...sortSelector,
        };

        exportSensitivityResultsAsCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            {
                csvHeaders: csvHeaders,
                resultTab: SensitivityResultTabs[nOrNkIndex].id,
                sensitivityFunctionType: isSensiKind(sensiKind) ? FUNCTION_TYPES[sensiKind] : undefined,
                language: language,
            },
            selector,
            mappedFilters,
            globalFilters
        )
            .then((response) => {
                response.blob().then((blob: Blob) => {
                    downloadZipFile(blob, 'sensitivity_analyse_results.zip');
                    setIsCsvExportSuccessful(true);
                });
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'csvExportSensitivityResultError' });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        filters,
        sortConfig,
        nOrNkIndex,
        sensiKind,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        csvHeaders,
        language,
        globalFilters,
        snackError,
    ]);

    return (
        <ExportCsvButton
            onClick={exportCsv}
            disabled={disabled}
            isDownloadLoading={isCsvExportLoading}
            isDownloadSuccessful={isCsvExportSuccessful}
        />
    );
};
