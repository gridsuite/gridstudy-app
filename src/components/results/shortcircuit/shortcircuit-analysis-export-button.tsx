/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { ExportButton } from '../../utils/export-button';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { downloadShortCircuitResultZippedCsv } from '../../../services/study/short-circuit-analysis';
import { downloadZipFile } from '../../../services/utils';
import { ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';
import { UUID } from 'crypto';
import { BranchSide } from 'components/utils/constants';

interface ShortCircuitExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    csvHeaders?: string[];
    analysisType: number;
    disabled?: boolean;
}

export const ShortCircuitExportButton: FunctionComponent<ShortCircuitExportButtonProps> = (props) => {
    const { studyUuid, nodeUuid, currentRootNetworkUuid, csvHeaders, disabled = false, analysisType } = props;
    const { snackError } = useSnackMessage();

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);

    const intl = useIntl();

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [nodeUuid, analysisType]);

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
        downloadShortCircuitResultZippedCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            analysisType,
            csvHeaders,
            enumValueTranslations
        )
            .then((response) => {
                response.blob().then((fileBlob: Blob) => {
                    downloadZipFile(
                        fileBlob,
                        analysisType === ShortCircuitAnalysisType.ONE_BUS
                            ? 'oneBus-results.zip'
                            : 'allBuses_results.zip'
                    );
                    setIsCsvExportSuccessful(true);
                });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'shortCircuitAnalysisCsvResultsError',
                    }),
                });
                setIsCsvExportSuccessful(false);
            })
            .finally(() => setIsCsvExportLoading(false));
    }, [
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        intl,
        snackError,
        csvHeaders,
        analysisType,
        enumValueTranslations,
    ]);

    return (
        <ExportButton
            onClick={exportCsv}
            disabled={disabled}
            isDownloadLoading={isCsvExportLoading}
            isDownloadSuccessful={isCsvExportSuccessful}
        />
    );
};
