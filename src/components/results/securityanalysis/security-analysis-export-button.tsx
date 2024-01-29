import { useSnackMessage } from '@gridsuite/commons-ui';
import { ExportButton } from 'components/utils/export-button';
import { UUID } from 'crypto';
import {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useIntl } from 'react-intl';
import { downloadSecurityAnalysisResultZippedCsv } from 'services/study/security-analysis';
import { downloadZipFile } from 'services/utils';
import { RESULT_TYPE } from './security-analysis-result-utils';

interface SecurityAnalysisExportButtonProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    csvHeaders?: string[];
    resultType: RESULT_TYPE;
    disabled?: boolean;
}

export const SecurityAnalysisExportButton: FunctionComponent<
    SecurityAnalysisExportButtonProps
> = (props) => {
    const { studyUuid, nodeUuid, csvHeaders, disabled, resultType } = props;
    const { snackError } = useSnackMessage();

    const [isCsvExportLoading, setIsCsvExportLoading] = useState(false);
    const [isCsvExportSuccessful, setIsCsvExportSuccessful] = useState(false);

    const intl = useIntl();

    useEffect(() => {
        setIsCsvExportSuccessful(false);
    }, [nodeUuid, resultType]);

    const enumValueTranslations = useMemo(() => {
        const returnedValue: Record<string, string> = {};
        const enumValuesToTranslate = [
            'CURRENT',
            'HIGH_VOLTAGE',
            'LOW_VOLTAGE',
            'ACTIVE_POWER',
            'APPARENT_POWER',
            'MAX_ITERATION_REACHED',
            'OTHER',
            'SOLVER_FAILED',
            'CONVERGED',
            'FAILED',
            'ONE',
            'TWO',
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
            {
                resultType,
            },
            csvHeaders,
            enumValueTranslations
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
        csvHeaders,
        enumValueTranslations,
        studyUuid,
        nodeUuid,
        snackError,
        intl,
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
