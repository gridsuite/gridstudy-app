/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SCAFaultResult,
    SCAOneBusResult,
    SCAResult,
    ShortCircuitAnalysisType,
} from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import { ShortCircuitAnalysisResult } from 'components/results/shortcircuit/shortcircuit-analysis-result';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

export const ShortCircuitAnalysisOneBusResult = () => {
    const oneBusShortCircuitNotif = useSelector(
        (state: ReduxState) => state.oneBusShortCircuitNotif
    );

    function formatResult(result: SCAResult) {
        const {
            page: { content },
            faultResult,
        } = result as SCAOneBusResult;
        const faultWithPagedFeeders: SCAFaultResult[] = [
            {
                ...faultResult,
                feederResults: content,
            },
        ];
        return faultWithPagedFeeders;
    }

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ONE_BUS}
            formatResult={formatResult}
            shortCircuitNotif={oneBusShortCircuitNotif}
        />
    );
};
