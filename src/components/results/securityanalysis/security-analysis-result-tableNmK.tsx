/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import {
    NmKConstraintRow,
    PostContingencyResult,
    SecurityAnalysisResultTableNmKProps,
    ResultConstraint,
} from './security-analysis.type';
import { useTheme } from '@mui/material';
import { IntlShape, useIntl } from 'react-intl';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { ComputingType } from '../../computing-status/computing-type';
import {
    GridReadyEvent,
    ICellRendererParams,
    PostSortRowsParams,
    RowClassParams,
} from 'ag-grid-community';
import { Button, Theme } from '@mui/material';
import {
    flattenNmKresultsConstraints,
    flattenNmKresultsContingencies,
    groupPostSort,
    NMK_TYPE_RESULT,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

export const SecurityAnalysisResultTableNmK: FunctionComponent<
    SecurityAnalysisResultTableNmKProps
> = ({
    postContingencyResults,
    onClickNmKConstraint,
    nmkTypeResult,
    isWaiting,
}) => {
    const theme = useTheme();
    const styles = {
        button: (theme: Theme) => ({
            color: theme.link.color,
        }),
    };
    const intl = useIntl();
    const messages = useIntlResultStatusMessages(intl);
    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );
    const isFromContingency = useMemo(
        () => nmkTypeResult === NMK_TYPE_RESULT.CONSTRAINTS_FROM_CONTINGENCIES,
        [nmkTypeResult]
    );

    const SubjectIdRenderer = useCallback(
        (props: ICellRendererParams) => {
            const onClick = () => {
                const row: NmKConstraintRow = { ...props?.node?.data };
                onClickNmKConstraint(row, props?.colDef);
            };
            if (props.value) {
                return (
                    <Button sx={styles.button} onClick={onClick}>
                        {props.value}
                    </Button>
                );
            }
        },
        [styles.button, onClickNmKConstraint]
    );

    const getRowStyle = useCallback(
        (params: RowClassParams, isFromContingency: boolean) => {
            if (
                (isFromContingency && params?.data?.contingencyId) ||
                (!isFromContingency && params?.data?.subjectId)
            ) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
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

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    const handlePostSortRows = (
        params: PostSortRowsParams,
        isFromContingency: boolean
    ) => {
        const rows = params.nodes;
        return Object.assign(
            rows,
            groupPostSort(
                rows,
                isFromContingency ? 'contingencyId' : 'subjectId',
                'linkedElementId',
                !isFromContingency
            )
        );
    };

    const securityAnalysisColumns = useMemo(() => {
        if (isFromContingency) {
            return securityAnalysisTableNmKContingenciesColumnsDefinition(
                intl,
                SubjectIdRenderer
            );
        }
        return securityAnalysisTableNmKConstraintsColumnsDefinition(
            intl,
            SubjectIdRenderer
        );
    }, [intl, SubjectIdRenderer, isFromContingency]);

    const getRowsResult = (
        intl: IntlShape,
        isFromContingency: boolean,
        postContingencyResults?: PostContingencyResult[]
    ) => {
        if (isFromContingency) {
            return flattenNmKresultsContingencies(intl, postContingencyResults);
        }
        return flattenNmKresultsConstraints(intl, postContingencyResults);
    };

    const rows: ResultConstraint[] = getRowsResult(
        intl,
        isFromContingency,
        postContingencyResults
    );

    const message = getNoRowsMessage(
        messages,
        rows,
        securityAnalysisStatus,
        !isWaiting
    );
    const rowsToShow = getRows(rows, securityAnalysisStatus);

    return (
        <CustomAGGrid
            rowData={rowsToShow}
            columnDefs={securityAnalysisColumns}
            postSortRows={(params) =>
                handlePostSortRows(params, isFromContingency)
            }
            defaultColDef={defaultColDef}
            getRowStyle={(params) => getRowStyle(params, isFromContingency)}
            onGridReady={onGridReady}
            overlayNoRowsTemplate={message}
            tooltipShowDelay={0}
        />
    );
};
