/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SCAAllBusesResult,
    SCAResult,
    ShortCircuitAnalysisType,
} from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import { ShortCircuitAnalysisResult } from 'components/results/shortcircuit/shortcircuit-analysis-result';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

export const ShortCircuitAnalysisAllBusesResult = () => {
    const allBusesShortCircuitNotif = useSelector(
        (state: ReduxState) => state.allBusesShortCircuitNotif
    );

    function formatResult(result: SCAResult) {
        const {
            page: { content },
        } = result as SCAAllBusesResult;
        return content;
    }

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ALL_BUSES}
            formatResult={formatResult}
            shortCircuitNotif={allBusesShortCircuitNotif}
        />
    );
};
