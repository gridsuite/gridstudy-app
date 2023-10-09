/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { PreContingencyResult } from './security-analysis.type';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { IntlShape, useIntl } from 'react-intl';
import {
    computeLoading,
    securityAnalysisTableNColumnsDefinition,
} from './security-analysis-result-utils';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { GridReadyEvent } from 'ag-grid-community';
import { ReduxState } from '../../../redux/reducer.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

export const SecurityAnalysisTableN: FunctionComponent<
    PreContingencyResult
> = ({ limitViolationsResult, isWaiting }) => {
    const intl: IntlShape = useIntl();
    const messages = useIntlResultStatusMessages(intl);
    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const rows = limitViolationsResult?.limitViolations.map(
        (limitViolation) => {
            return {
                subjectId: limitViolation.subjectId,
                limitType: intl.formatMessage({
                    id: limitViolation.limitType,
                }),
                limit: limitViolation.limit,
                value: limitViolation.value,
                loading: computeLoading(limitViolation),
            };
        }
    );

    const message = getNoRowsMessage(
        messages,
        rows,
        securityAnalysisStatus,
        !isWaiting
    );
    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            resizable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressMovable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );
    const rowsToShow = getRows(rows, securityAnalysisStatus);
    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);
    const securityAnalysisTableNColumns = useMemo(() => {
        return securityAnalysisTableNColumnsDefinition(intl);
    }, [intl]);

    return (
        <CustomAGGrid
            rowData={rowsToShow}
            columnDefs={securityAnalysisTableNColumns}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            overlayNoRowsTemplate={message}
        />
    );
};
