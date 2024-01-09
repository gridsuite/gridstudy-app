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

    const csvHeaders = useMemo(
        () => [
            intl.formatMessage({
                id: 'Equipment',
            }),
            intl.formatMessage({
                id: 'ViolationType',
            }),
            intl.formatMessage({
                id: 'LimitName',
            }),
            intl.formatMessage({
                id: 'Limit',
            }),
            intl.formatMessage({
                id: 'CalculatedValue',
            }),
            intl.formatMessage({
                id: 'Loading',
            }),
            intl.formatMessage({
                id: 'Overload',
            }),
            intl.formatMessage({ id: 'LimitSide' }),
        ],
        [intl]
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
        ).then((fileBlob) => downloadZipFile(fileBlob, 'n-results.zip'));
    }, [enumValueTranslations, csvHeaders, studyUuid, nodeUuid]);

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

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
            exportCsv={exportResultCsv}
        />
    );
};
