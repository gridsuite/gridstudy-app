/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ExportCsvButton, useSnackMessage } from '@gridsuite/commons-ui';
import { downloadZipFile } from '../../../services/utils';
import type { UUID } from 'node:crypto';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import { exportPccMinResultsAsCsv } from 'services/study/pcc-min';
import { FROM_COLUMN_TO_FIELD_PCC_MIN } from './pcc-min-result.type';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { useComputationGlobalFilters } from '../common/global-filter/use-computation-global-filters';
import { buildValidGlobalFilters } from '../common/global-filter/build-valid-global-filters';

interface PccMinExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    csvHeaders?: string[];
    disabled?: boolean;
}

export const PccMinExportButton: FunctionComponent<PccMinExportButtonProps> = (props) => {
    const { studyUuid, nodeUuid, currentRootNetworkUuid, csvHeaders, disabled = false } = props;
    const { snackError } = useSnackMessage();
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);
    const { filters } = useFilterSelector(AgGridFilterType.PccMin, PCCMIN_RESULT);
    const { globalFiltersFromState } = useComputationGlobalFilters(AgGridFilterType.PccMin);
    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[PCCMIN_ANALYSIS_RESULT_SORT_STORE][PCCMIN_RESULT]
    );

    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [studyUuid, currentRootNetworkUuid, nodeUuid, appTabIndex]);

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
        const filter = filters ? mapFieldsToColumnsFilter(filters, FROM_COLUMN_TO_FIELD_PCC_MIN) : null;
        const globalFilters = buildValidGlobalFilters(globalFiltersFromState);
        exportPccMinResultsAsCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            sortConfig,
            filter,
            globalFilters,
            csvHeaders,
            language
        )
            .then((response) =>
                response.blob().then((blob: Blob) => {
                    downloadZipFile(blob, 'pccmin_results.zip');
                    setIsCsvExportSuccessful(true);
                })
            )
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'csvExportPccMinResultError',
                });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        filters,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        sortConfig,
        globalFiltersFromState,
        csvHeaders,
        language,
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
