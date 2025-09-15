/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { ExportButton } from 'components/utils/export-button';
import { UUID } from 'crypto';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { downloadSecurityAnalysisResultZippedCsv } from 'services/study/security-analysis';
import { downloadZipFile } from 'services/utils';
import { RESULT_TYPE } from './security-analysis-result-utils';
import { PERMANENT_LIMIT_NAME } from '../common/utils';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { PARAM_LANGUAGE } from '../../../utils/config-params';

interface SecurityAnalysisExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    csvHeaders?: string[];
    resultType: RESULT_TYPE;
    disabled?: boolean;
}

export const SecurityAnalysisExportButton: FunctionComponent<SecurityAnalysisExportButtonProps> = (props) => {
    const { studyUuid, nodeUuid, rootNetworkUuid, csvHeaders, disabled, resultType } = props;
    const { snackError } = useSnackMessage();

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);
    const language = useSelector((state: AppState) => state[PARAM_LANGUAGE]);

    const intl = useIntl();

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [studyUuid, nodeUuid, rootNetworkUuid, resultType]);

    useEffect(() => {
        if (disabled) {
            // reinit the success state when the button is disabled,
            // for example when the calcul status change or results change
            setIsCsvExportSuccessful(false);
        }
    }, [disabled]);

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {
            [PERMANENT_LIMIT_NAME]: intl.formatMessage({
                id: 'PermanentLimitName',
            }),
        };
        const enumValuesToTranslate = [
            'CURRENT',
            'HIGH_VOLTAGE',
            'LOW_VOLTAGE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'MAX_ITERATION_REACHED',
            'OTHER',
            'CONVERGED',
            'FAILED',
            'ONE',
            'TWO',
            'NO_CALCULATION',
        ];

        enumValuesToTranslate.forEach((value) => {
            returnedValue[value] = intl.formatMessage({ id: value });
        });

        return returnedValue;
    }, [intl]);

    const exportResultCsv = useCallback(() => {
        setIsCsvExportLoading(true);
        setIsCsvExportSuccessful(false);
        downloadSecurityAnalysisResultZippedCsv(
            studyUuid,
            nodeUuid,
            rootNetworkUuid,
            {
                resultType,
            },
            csvHeaders,
            enumValueTranslations,
            language
        )
            .then((fileBlob) => {
                downloadZipFile(fileBlob, `${resultType}-results.zip`);
                setIsCsvExportSuccessful(true);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'securityAnalysisCsvResultsError',
                    }),
                });
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        resultType,
        csvHeaders,
        enumValueTranslations,
        studyUuid,
        nodeUuid,
        rootNetworkUuid,
        snackError,
        intl,
        language,
    ]);

    return (
        <ExportButton
            onClick={exportResultCsv}
            disabled={disabled}
            isDownloadLoading={isCsvExportLoading}
            isDownloadSuccessful={isCsvExportSuccessful}
        />
    );
};
