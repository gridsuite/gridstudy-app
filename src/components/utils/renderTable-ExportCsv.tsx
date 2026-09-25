/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import {
    RenderTableAndExportCsv as RenderTableAndExportCsvBase,
    RenderTableAndExportCsvProps as BaseProps,
    TableType,
    updateAgGridFilters,
} from '@gridsuite/commons-ui';
import { useAgGridInitialColumnFilters } from '../results/common/use-ag-grid-initial-column-filters';

interface RenderTableAndExportCsvProps extends Omit<BaseProps, 'onGridReady'> {
    computationType: TableType;
    computationSubType: string;
}

export const RenderTableAndExportCsv: FunctionComponent<RenderTableAndExportCsvProps> = ({
    computationType,
    computationSubType,
    gridRef,
    ...rest
}) => {
    const onGridReady = useAgGridInitialColumnFilters(computationType, computationSubType);

    return <RenderTableAndExportCsvBase gridRef={gridRef} onGridReady={onGridReady} {...rest} />;
};
