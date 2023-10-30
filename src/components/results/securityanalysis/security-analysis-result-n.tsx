/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo } from 'react';
import {
    PreContingencyResult,
    SecurityAnalysisResultNProps,
} from './security-analysis.type';
import { IntlShape, useIntl } from 'react-intl';
import { LimitViolation } from './security-analysis.type';
import { SecurityAnalysisTable } from './security-analysis-table';
import {
    computeLoading,
    securityAnalysisTableNColumnsDefinition,
} from './security-analysis-result-utils';

export const SecurityAnalysisResultN: FunctionComponent<
    SecurityAnalysisResultNProps
> = ({ result, isLoadingResult }) => {
    const intl: IntlShape = useIntl();

    const limitViolations =
        (result as PreContingencyResult)?.limitViolationsResult
            ?.limitViolations || [];

    const rows = limitViolations.map((limitViolation: LimitViolation) => {
        return {
            subjectId: limitViolation.subjectId,
            limitType: intl.formatMessage({
                id: limitViolation.limitType,
            }),
            limit: limitViolation.limit,
            value: limitViolation.value,
            loading: computeLoading(limitViolation),
        };
    });

    const columnDefs = useMemo(
        () => securityAnalysisTableNColumnsDefinition(intl),
        [intl]
    );

    return (
        <SecurityAnalysisTable
            rows={rows}
            columnDefs={columnDefs}
            isLoadingResult={isLoadingResult}
        />
    );
};
