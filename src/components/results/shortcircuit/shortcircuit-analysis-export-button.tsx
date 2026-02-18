/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { ExportCsvButton, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import {
    downloadShortCircuitResultZippedCsv,
    ShortCircuitCsvExportParams,
} from '../../../services/study/short-circuit-analysis';
import { downloadZipFile } from '../../../services/utils';
import { ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';
import type { UUID } from 'node:crypto';
import { BranchSide } from 'components/utils/constants';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { TableType } from '../../../types/custom-aggrid-types';
import { getSelectedGlobalFilters } from '../common/global-filter/use-selected-global-filters';
import {
    convertFilterValues,
    FROM_COLUMN_TO_FIELD,
    FROM_COLUMN_TO_FIELD_ONE_BUS,
    mappingTabs,
} from './shortcircuit-analysis-result-content';
import { SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import { buildValidGlobalFilters } from '../common/global-filter/build-valid-global-filters';

interface ShortCircuitExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    csvHeader: string[];
    analysisType: number;
    disabled?: boolean;
}

export const ShortCircuitExportButton: FunctionComponent<ShortCircuitExportButtonProps> = (props) => {
    const {
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        csvHeader,
        disabled = false,
        analysisType,
    } = props;
    const { snackError } = useSnackMessage();

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);

    const intl = useIntl();
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    const { filters } = useFilterSelector(TableType.ShortcircuitAnalysis, mappingTabs(analysisType));
    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE][mappingTabs(analysisType)]
    );

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [studyUuid, currentRootNetworkUuid, nodeUuid, analysisType, appTabIndex]);

    useEffect(() => {
        if (disabled) {
            // reinit the success state when the button is disabled,
            // for example when the calcul status change or results change
            setIsCsvExportSuccessful(false);
        }
    }, [disabled]);

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {};
        const enumValuesToTranslate = [
            'THREE_PHASE',
            'SINGLE_PHASE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'CURRENT',
            'LOW_VOLTAGE',
            'HIGH_VOLTAGE',
            'LOW_SHORT_CIRCUIT_CURRENT',
            'HIGH_SHORT_CIRCUIT_CURRENT',
            BranchSide.ONE,
            BranchSide.TWO,
            'OTHER',
        ];

        enumValuesToTranslate.forEach((value) => {
            returnedValue[value] = intl.formatMessage({ id: value });
        });

        return returnedValue;
    }, [intl]);
    const exportCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);

        const oneBusCase = analysisType === ShortCircuitAnalysisType.ONE_BUS;
        const fromFrontColumnToBackKeys = oneBusCase ? FROM_COLUMN_TO_FIELD_ONE_BUS : FROM_COLUMN_TO_FIELD;

        const backSortConfig = sortConfig?.map((sort) => ({
            ...sort,
            colId: fromFrontColumnToBackKeys[sort.colId],
        }));

        const updatedFilters = filters
            ? mapFieldsToColumnsFilter(convertFilterValues(filters), fromFrontColumnToBackKeys)
            : null;

        const selector = {
            filter: updatedFilters,
            sort: backSortConfig,
        };

        const exportParams: ShortCircuitCsvExportParams = {
            csvHeader,
            enumValueTranslations,
            language,
            oneBusCase,
        };
        downloadShortCircuitResultZippedCsv({
            studyUuid,
            currentNodeUuid: nodeUuid,
            currentRootNetworkUuid,
            type: analysisType,
            globalFilters: buildValidGlobalFilters(getSelectedGlobalFilters(TableType.ShortcircuitAnalysis)),
            selector,
            csvParams: exportParams,
        })
            .then((response) => {
                response.blob().then((fileBlob: Blob) => {
                    downloadZipFile(fileBlob, oneBusCase ? 'oneBus-results.zip' : 'allBuses_results.zip');
                    setIsCsvExportSuccessful(true);
                });
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'shortCircuitAnalysisCsvResultsError' });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        sortConfig,
        filters,
        analysisType,
        csvHeader,
        enumValueTranslations,
        language,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
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
