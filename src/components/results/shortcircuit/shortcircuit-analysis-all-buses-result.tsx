/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SCAFaultResult,
    SCAFeederResult,
    ShortCircuitAnalysisType,
} from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import { ShortCircuitAnalysisResult } from 'components/results/shortcircuit/shortcircuit-analysis-result';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useCallback, useState } from 'react';
import { ComputingType } from 'components/computing-status/computing-type';

export const ShortCircuitAnalysisAllBusesResult = () => {
    const allBusesShortCircuitNotif = useSelector(
        (state: ReduxState) => state.allBusesShortCircuitNotif
    );

    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );

    const [result, setResult] = useState<SCAFaultResult[]>([]);

    const updateResult = useCallback(
        (results: SCAFaultResult[] | SCAFeederResult[]) => {
            setResult(results as SCAFaultResult[]);
        },
        []
    );

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ALL_BUSES}
            analysisStatus={allBusesShortCircuitAnalysisStatus}
            result={result}
            updateResult={updateResult}
            shortCircuitNotif={allBusesShortCircuitNotif}
        />
    );
};
