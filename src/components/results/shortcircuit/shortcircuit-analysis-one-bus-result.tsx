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
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { fetchShortCircuitAnalysisResult } from 'services/study/short-circuit-analysis';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { GridReadyEvent } from 'ag-grid-community';

interface ShortCircuitAnalysisOneBusResultProps {
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (params: GridReadyEvent) => void;
}

export const ShortCircuitAnalysisOneBusResult: FunctionComponent<
    ShortCircuitAnalysisOneBusResultProps
> = ({ onGridColumnsChanged, onRowDataUpdated }) => {
    const { snackError } = useSnackMessage();

    const oneBusShortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS],
    );

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode,
    );

    const [faultResult, setFaultResult] = useState<SCAFaultResult>();
    const [feederResults, setFeederResults] = useState<SCAFeederResult[]>();
    const [result, setResult] = useState<SCAFaultResult[]>([]);

    useEffect(() => {
        if (oneBusShortCircuitAnalysisStatus !== RunningStatus.SUCCEED) {
            return;
        }

        fetchShortCircuitAnalysisResult({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            type: ShortCircuitAnalysisType.ONE_BUS,
            mode: 'BASIC',
        }).then((result: SCAResult | null) => {
            if (result?.faults.length !== 1) {
                snackError({
                    messageId: 'ShortCircuitAnalysisResultsError',
                });
                console.error(
                    'We should have one and only one fault for one bus SCA results, or we found 0 or more than 1',
                );
                return;
            }
            setFaultResult(result?.faults[0]);
        });
    }, [snackError, studyUuid, currentNode, oneBusShortCircuitAnalysisStatus]);

    useEffect(() => {
        if (!faultResult || !feederResults) {
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

    const updateResult = useCallback(
        (results: SCAFaultResult[] | SCAFeederResult[] | null) => {
            setFeederResults((results as SCAFeederResult[]) ?? null);
        },
        [],
    );

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ONE_BUS}
            analysisStatus={oneBusShortCircuitAnalysisStatus}
            result={result}
            updateResult={updateResult}
            customTablePaginationProps={{
                labelRowsPerPageId:
                    'muiTablePaginationLabelRowsPerPageOneBusSCA',
            }}
            onGridColumnsChanged={onGridColumnsChanged}
            onRowDataUpdated={onRowDataUpdated}
        />
    );
};
