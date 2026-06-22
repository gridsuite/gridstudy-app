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
import { translateLimitNameBackToFront } from '../common/utils';
import { MAX_INT32 } from 'services/utils';
import { SecurityAnalysisTable } from '@gridsuite/commons-ui';
import { getNoRowsMessage } from '../../utils/aggrid-rows-handler';

export const SecurityAnalysisResultN: FunctionComponent<SecurityAnalysisResultNProps> = ({
    result,
    isLoadingResult,
    columnDefs,
    resultStatusMessages,
    securityAnalysisStatus,
    onGridReady,
    hasError,
}) => {
    const intl: IntlShape = useIntl();

    const rows = useMemo(() => {
        if (hasError) return [];
        // Defensive guard: the N tab expects an array; a stale paginated result
        // ({ content, totalElements }) from the N-K tab must not reach result.map.
        return Array.isArray(result)
            ? result.map((preContingencyResult: PreContingencyResult) => {
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
              })
            : undefined;
    }, [intl, result, hasError]);

    const overlayNoRowsTemplate = getNoRowsMessage(
        resultStatusMessages,
        rows,
        securityAnalysisStatus,
        !isLoadingResult
    );

    return (
        <SecurityAnalysisTable
            rowData={rows}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            overlayNoRowsTemplate={overlayNoRowsTemplate}
        />
    );
};
