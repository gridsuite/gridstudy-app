/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SCAFaultResult,
    SCAFeederResult,
    SCAResult,
    ShortCircuitAnalysisType,
} from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import { ShortCircuitAnalysisResult } from 'components/results/shortcircuit/shortcircuit-analysis-result';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useCallback, useEffect, useState } from 'react';
import { fetchShortCircuitAnalysisResult } from 'services/study/short-circuit-analysis';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const ShortCircuitAnalysisOneBusResult = () => {
    const { snackError } = useSnackMessage();

    const oneBusShortCircuitNotif = useSelector(
        (state: ReduxState) => state.oneBusShortCircuitNotif
    );
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const [faultResult, setFaultResult] = useState<SCAFaultResult>();
    const [feederResults, setFeederResults] = useState<SCAFeederResult[]>([]);
    const [result, setResult] = useState<SCAFaultResult[]>([]);

    useEffect(() => {
        fetchShortCircuitAnalysisResult({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            type: ShortCircuitAnalysisType.ONE_BUS,
            mode: 'BASIC',
        }).then((result: SCAResult) => {
            if (result.faults.length !== 1) {
                snackError({
                    messageId: 'ShortCircuitAnalysisResultsError',
                });
                console.error(
                    'We should have one and only one fault for one bus SCA results, or we found 0 or more than 1'
                );
                return;
            }
            setFaultResult(result.faults[0]);
        });
    }, [snackError, studyUuid, currentNode]);

    useEffect(() => {
        if (!faultResult || !feederResults.length) {
            setResult([]);
            return;
        }
        const faultWithPagedFeeders: SCAFaultResult[] = [
            {
                ...faultResult,
                feederResults,
            },
        ];
        setResult(faultWithPagedFeeders);
    }, [faultResult, feederResults]);

    const handleFetchResultPage = useCallback(
        (results: SCAFaultResult[] | SCAFeederResult[]) => {
            setFeederResults(results as SCAFeederResult[]);
        },
        []
    );

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ONE_BUS}
            result={result}
            handleFetchResultPage={handleFetchResultPage}
            shortCircuitNotif={oneBusShortCircuitNotif}
        />
    );
};
