/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SecurityAnalysisNmkTableRow } from './security-analysis.type';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { fetchLineOrTransformer } from 'services/study/network-map';
import { BranchSide } from 'components/utils/constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { Button, Tooltip } from '@mui/material';
import {
    RESULT_TYPE,
    securityAnalysisTableNColumnsDefinition,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { SortPropsType } from 'hooks/use-aggrid-sort';
import { FilterEnumsType, FilterPropsType } from 'hooks/use-aggrid-row-filter';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

const styles = {
    button: {
        color: 'node.background',
    },
};

type UseSecurityAnalysisColumnsDefsProps = (
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnumsType,
    resultType: RESULT_TYPE,
    openVoltageLevelDiagram: (id: string) => void
) => ColDef<any>[];

export const useSecurityAnalysisColumnsDefs: UseSecurityAnalysisColumnsDefsProps =
    (
        sortProps,
        filterProps,
        filterEnums,
        resultType,
        openVoltageLevelDiagram
    ) => {
        const intl = useIntl();
        const { snackError } = useSnackMessage();
        const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
        const currentNode = useSelector(
            (state: ReduxState) => state.currentTreeNode
        );

        const nodeUuid = currentNode.id;

        // for nmk views, click handler on subjectId cell
        const onClickNmKConstraint = useCallback(
            (row: SecurityAnalysisNmkTableRow, column?: ColDef) => {
                if (studyUuid && nodeUuid) {
                    if (column?.field === 'subjectId') {
                        let vlId: string | undefined = '';
                        const { subjectId, side } = row || {};
                        // ideally we would have the type of the network element, but we don't
                        fetchLineOrTransformer(studyUuid, nodeUuid, subjectId)
                            .then((equipment) => {
                                if (!equipment) {
                                    // if we didnt find a line or transformer, it's a voltage level
                                    vlId = subjectId;
                                } else if (row.side) {
                                    if (
                                        side ===
                                        intl.formatMessage({
                                            id: BranchSide.ONE,
                                        })
                                    ) {
                                        vlId = equipment.voltageLevelId1;
                                    } else if (
                                        side ===
                                        intl.formatMessage({
                                            id: BranchSide.TWO,
                                        })
                                    ) {
                                        vlId = equipment.voltageLevelId2;
                                    } else {
                                        vlId = equipment.voltageLevelId3;
                                    }
                                } else {
                                    vlId = equipment.voltageLevelId1;
                                }
                            })
                            .finally(() => {
                                if (!vlId) {
                                    console.error(
                                        `Impossible to open the SLD for equipment ID '${row.subjectId}'`
                                    );
                                    snackError({
                                        messageId: 'NetworkElementNotFound',
                                        messageValues: {
                                            elementId: row.subjectId || '',
                                        },
                                    });
                                } else {
                                    if (openVoltageLevelDiagram) {
                                        openVoltageLevelDiagram(vlId);
                                    }
                                }
                            });
                    }
                }
            },
            [nodeUuid, openVoltageLevelDiagram, snackError, studyUuid, intl]
        );

        // for nmk views, custom view for subjectId cell
        const SubjectIdRenderer = useCallback(
            (props: ICellRendererParams) => {
                const { value, node, colDef } = props || {};
                const onClick = () => {
                    const row: SecurityAnalysisNmkTableRow = { ...node?.data };
                    onClickNmKConstraint(row, colDef);
                };
                if (value) {
                    return (
                        <Tooltip title={value}>
                            <Button sx={styles.button} onClick={onClick}>
                                {value}
                            </Button>
                        </Tooltip>
                    );
                }
            },
            [onClickNmKConstraint]
        );

        const columnDefs = useMemo(() => {
            switch (resultType) {
                case RESULT_TYPE.NMK_CONTINGENCIES:
                    return securityAnalysisTableNmKContingenciesColumnsDefinition(
                        intl,
                        SubjectIdRenderer,
                        filterProps,
                        sortProps,
                        filterEnums
                    );
                case RESULT_TYPE.NMK_LIMIT_VIOLATIONS:
                    return securityAnalysisTableNmKConstraintsColumnsDefinition(
                        intl,
                        SubjectIdRenderer,
                        filterProps,
                        sortProps,
                        filterEnums
                    );
                case RESULT_TYPE.N:
                    return securityAnalysisTableNColumnsDefinition(
                        intl,
                        sortProps,
                        filterProps,
                        filterEnums
                    );
            }
        }, [
            resultType,
            intl,
            SubjectIdRenderer,
            filterProps,
            sortProps,
            filterEnums,
        ]);

        return columnDefs;
    };
