/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ExportCsvButton, GsLangUser, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { downloadZipFile } from 'services/utils';
import { RESULT_TYPE } from './security-analysis.type';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';

interface SecurityAnalysisExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    resultType: RESULT_TYPE;
    enumValueTranslations: Record<string, string>;
    downloadZipResult: (
        studyUuid: UUID,
        nodeUuid: UUID,
        rootNetworkUuid: UUID,
        enumValueTranslations: Record<string, string>,
        language: GsLangUser
    ) => Promise<Blob>;
    disabled?: boolean;
}

export const SecurityAnalysisExportButton: FunctionComponent<SecurityAnalysisExportButtonProps> = (props) => {
    const { studyUuid, nodeUuid, rootNetworkUuid, disabled, resultType, enumValueTranslations, downloadZipResult } =
        props;
    const { snackError } = useSnackMessage();
    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const appTabIndex = useSelector((state: AppState) => state.appTabIndex);

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [studyUuid, nodeUuid, rootNetworkUuid, resultType, appTabIndex]);

    useEffect(() => {
        if (disabled) {
            // reinit the success state when the button is disabled,
            // for example when the calcul status change or results change
            setIsCsvExportSuccessful(false);
        }
    }, [disabled]);

    const exportResultCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
        downloadZipResult(studyUuid, nodeUuid, rootNetworkUuid, enumValueTranslations, language)
            .then((fileBlob) => {
                downloadZipFile(fileBlob, `${resultType}-results.zip`);
                setIsCsvExportSuccessful(true);
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'securityAnalysisCsvResultsError' });
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        resultType,
        enumValueTranslations,
        snackError,
        language,
        downloadZipResult,
    ]);

    return (
        <ExportCsvButton
            onClick={exportResultCsv}
            disabled={disabled}
            isDownloadLoading={isCsvExportLoading}
            isDownloadSuccessful={isCsvExportSuccessful}
        />
    );
};
