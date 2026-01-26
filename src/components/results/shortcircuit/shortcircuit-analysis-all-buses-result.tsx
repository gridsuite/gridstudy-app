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
import { ComputingType } from '@gridsuite/commons-ui';
import { GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { GlobalFilter } from '../common/global-filter/global-filter-types';

interface ShortCircuitAnalysisAllBusResultProps {
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    globalFilter: GlobalFilter[];
}

export const ShortCircuitAnalysisAllBusesResult: FunctionComponent<ShortCircuitAnalysisAllBusResultProps> = ({
    onGridColumnsChanged,
    onRowDataUpdated,
    globalFilter,
}) => {
    const allBusesShortCircuitAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
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
            globalFilter={globalFilter}
        />
    );
};
