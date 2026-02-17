/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo } from 'react';
import {
    PreContingencyResult,
    SecurityAnalysisNTableRow,
    SecurityAnalysisResultNProps,
} from './security-analysis.type';
import { IntlShape, useIntl } from 'react-intl';
import { SecurityAnalysisTable } from './security-analysis-table';
import { translateLimitNameBackToFront } from '../common/utils';
import { MAX_INT32 } from 'services/utils';

export const SecurityAnalysisResultN: FunctionComponent<SecurityAnalysisResultNProps> = ({
    result,
    isLoadingResult,
    columnDefs,
    computationSubType,
}) => {
    const intl: IntlShape = useIntl();

    const rows = useMemo(() => {
        return result?.length // check if it's not Page object
            ? (result?.map((preContingencyResult: PreContingencyResult) => {
                  const { limitViolation, subjectId } = preContingencyResult;
                  return {
                      subjectId: subjectId,
                      locationId: limitViolation?.locationId,
                      limitType: limitViolation?.limitType,
                      // TODO: Remove this check after fixing the acceptableDuration issue on the Powsybl side
                      acceptableDuration:
                          limitViolation?.acceptableDuration === MAX_INT32 ? null : limitViolation?.acceptableDuration,
                      limitName: translateLimitNameBackToFront(limitViolation?.limitName, intl),
                      limit: limitViolation?.limit,
                      value: limitViolation?.value,
                      loading: limitViolation?.loading,
                      side: limitViolation?.side,
                      patlLoading: limitViolation?.patlLoading,
                      patlLimit: limitViolation?.patlLimit,
                      nextLimitName: translateLimitNameBackToFront(limitViolation?.nextLimitName, intl),
                      upcomingAcceptableDuration:
                          limitViolation?.upcomingAcceptableDuration === MAX_INT32
                              ? null
                              : limitViolation?.upcomingAcceptableDuration,
                  } as SecurityAnalysisNTableRow;
              }) ?? [])
            : [];
    }, [intl, result]);

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
            computationSubType={computationSubType}
        />
    );
};
