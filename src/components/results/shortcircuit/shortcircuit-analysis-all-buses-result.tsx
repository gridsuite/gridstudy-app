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
import { AppState } from 'redux/reducer';
import { FunctionComponent, useCallback, useState } from 'react';
import { ComputationType } from 'components/computing-status/computation-type';
import { GridReadyEvent } from 'ag-grid-community';

interface ShortCircuitAnalysisAllBusResultProps {
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (params: GridReadyEvent) => void;
}

export const ShortCircuitAnalysisAllBusesResult: FunctionComponent<ShortCircuitAnalysisAllBusResultProps> = ({
    onGridColumnsChanged,
    onRowDataUpdated,
}) => {
    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.SHORT_CIRCUIT]
    );

    const [result, setResult] = useState<SCAFaultResult[]>([]);

    const updateResult = useCallback((results: SCAFaultResult[] | SCAFeederResult[] | null) => {
        setResult((results as SCAFaultResult[]) ?? []);
    }, []);

    return (
        <ShortCircuitAnalysisResult
            analysisType={ShortCircuitAnalysisType.ALL_BUSES}
            analysisStatus={allBusesShortCircuitAnalysisStatus}
            result={result}
            updateResult={updateResult}
            customTablePaginationProps={{
                labelRowsPerPageId: 'muiTablePaginationLabelRowsPerPageAllBusesSCA',
            }}
            onGridColumnsChanged={onGridColumnsChanged}
            onRowDataUpdated={onRowDataUpdated}
        />
    );
};
