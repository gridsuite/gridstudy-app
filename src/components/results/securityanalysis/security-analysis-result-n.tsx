/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import {
    PreContingencyResult,
    SecurityAnalysisNTableRow,
    SecurityAnalysisResultNProps,
} from './security-analysis.type';
import { IntlShape, useIntl } from 'react-intl';
import { SecurityAnalysisTable } from './security-analysis-table';
import {
    MAX_INT32,
    RESULT_TYPE,
    securityAnalysisTableNColumnsDefinition,
} from './security-analysis-result-utils';
import { convertSide } from '../loadflow/load-flow-result-utils';
import { downloadSecurityAnalysisResultZippedCsv } from 'services/study/security-analysis';
import { downloadZipFile } from 'services/utils';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const SecurityAnalysisResultN: FunctionComponent<
    SecurityAnalysisResultNProps
> = ({
    result,
    isLoadingResult,
    sortProps,
    filterProps,
    filterEnums,
    studyUuid,
    nodeUuid,
    enumValueTranslations,
}) => {
    const intl: IntlShape = useIntl();
    const { snackError } = useSnackMessage();
    const rows = useMemo(() => {
        return result?.length // check if it's not Page object
            ? result?.map((preContingencyResult: PreContingencyResult) => {
                  const { limitViolation, subjectId } = preContingencyResult;
                  return {
                      subjectId: subjectId,
                      limitType: intl.formatMessage({
                          id: limitViolation?.limitType,
                      }),
                      // TODO: Remove this check after fixing the acceptableDuration issue on the Powsybl side
                      acceptableDuration:
                          limitViolation?.acceptableDuration === MAX_INT32
                              ? null
                              : limitViolation?.acceptableDuration,
                      limitName: limitViolation?.limitName,
                      limit: limitViolation?.limit,
                      value: limitViolation?.value,
                      loading: limitViolation?.loading,
                      side: convertSide(limitViolation?.side || '', intl),
                  } as SecurityAnalysisNTableRow;
              }) ?? []
            : [];
    }, [intl, result]);

    const columnDefs = useMemo(
        () =>
            securityAnalysisTableNColumnsDefinition(
                intl,
                sortProps,
                filterProps,
                filterEnums
            ),
        [intl, sortProps, filterProps, filterEnums]
    );

    const csvHeaders = useMemo(
        () => columnDefs.map((cDef) => cDef.headerName),
        [columnDefs]
    );

    const exportResultCsv = useCallback(() => {
        downloadSecurityAnalysisResultZippedCsv(
            studyUuid,
            nodeUuid,
            {
                resultType: RESULT_TYPE.N,
            },
            csvHeaders,
            enumValueTranslations
        )
            .then((fileBlob) => downloadZipFile(fileBlob, 'n-results.zip'))
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'securityAnalysisCsvResultsError',
                    }),
                });
            });
    }, [enumValueTranslations, csvHeaders, studyUuid, nodeUuid]);

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
            exportCsv={exportResultCsv}
        />
    );
};
