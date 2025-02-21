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
import { AppState } from 'redux/reducer';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { fetchShortCircuitAnalysisResult } from 'services/study/short-circuit-analysis';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';

interface ShortCircuitAnalysisOneBusResultProps {
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
}

export const ShortCircuitAnalysisOneBusResult: FunctionComponent<ShortCircuitAnalysisOneBusResultProps> = ({
    onGridColumnsChanged,
    onRowDataUpdated,
}) => {
    const { snackError } = useSnackMessage();

    const oneBusShortCircuitAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

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
            currentRootNetworkUuid: currentRootNetworkUuid!,
            type: ShortCircuitAnalysisType.ONE_BUS,
        }).then((result: SCAResult | null) => {
            if (result?.faults.length !== 1) {
                snackError({
                    messageId: 'ShortCircuitAnalysisResultsError',
                });
                console.error(
                    'We should have one and only one fault for one bus SCA results, or we found 0 or more than 1'
                );
                return;
            }
            setFaultResult(result?.faults[0]);
        });
    }, [snackError, studyUuid, currentNode, currentRootNetworkUuid, oneBusShortCircuitAnalysisStatus]);

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

    const updateResult = useCallback((results: SCAFaultResult[] | SCAFeederResult[] | null) => {
        setFeederResults((results as SCAFeederResult[]) ?? null);
    }, []);

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ONE_BUS}
            analysisStatus={oneBusShortCircuitAnalysisStatus}
            result={result}
            updateResult={updateResult}
            customTablePaginationProps={{
                labelRowsPerPageId: 'muiTablePaginationLabelRowsPerPageOneBusSCA',
            }}
            onGridColumnsChanged={onGridColumnsChanged}
            onRowDataUpdated={onRowDataUpdated}
        />
    );
};
