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
    PostContingencyResultProps,
    ResultConstraint,
} from './security-analysis.type';
import { Theme } from '@mui/material';
import { useTheme } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
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
import { Button } from '@mui/material';
import {
    flattenNmKresultsConstraints,
    flattenNmKresultsContingencies,
    groupPostSort,
    NMK_TYPE_RESULT,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';

export const SecurityAnalysisResultTableNmK: FunctionComponent<
    PostContingencyResultProps
> = ({ postContingencyResults, onClickNmKConstraint, nmkTypeResult }) => {
    const theme = useTheme();
    const useStyles = makeStyles<Theme>((theme) => ({
        button: {
            color: theme.link.color,
        },
    }));
    const classes = useStyles();
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
                    <Button className={classes.button} onClick={onClick}>
                        {props.value}
                    </Button>
                );
            }
        },
        [classes.button, onClickNmKConstraint]
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
        }),
        []
    );

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
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
        postContingencyResults: PostContingencyResult[],
        intl: IntlShape,
        isFromContingency: boolean
    ) => {
        if (isFromContingency) {
            return flattenNmKresultsContingencies(postContingencyResults, intl);
        }
        return flattenNmKresultsConstraints(postContingencyResults, intl);
    };

    const rows: ResultConstraint[] = getRowsResult(
        postContingencyResults,
        intl,
        isFromContingency
    );
    const message = getNoRowsMessage(messages, rows, securityAnalysisStatus);
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
        />
    );
};
