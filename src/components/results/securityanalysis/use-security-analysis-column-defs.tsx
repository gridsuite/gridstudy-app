/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { RESULT_TYPE, SecurityAnalysisNmkTableRow } from './security-analysis.type';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { fetchVoltageLevelIdForLineOrTransformerBySide } from 'services/study/network-map';
import { BranchSide } from 'components/utils/constants';
import { OverflowableText, useSnackMessage } from '@gridsuite/commons-ui';
import { Button } from '@mui/material';
import {
    securityAnalysisTableNColumnsDefinition,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { resultsStyles } from '../common/utils';
import { useWorkspacePanelActions } from '../../workspace/hooks/use-workspace-panel-actions';
import { PanelType } from '../../workspace/types/workspace.types';
import { FilterEnumsType } from '../../../types/custom-aggrid-types';

export interface SecurityAnalysisFilterEnumsType {
    n: FilterEnumsType;
    nmk: FilterEnumsType;
}

type UseSecurityAnalysisColumnsDefsProps = (
    filterEnums: SecurityAnalysisFilterEnumsType,
    resultType: RESULT_TYPE,
    tabIndex: number,
    goToFirstPage: () => void
) => ColDef[];

export const useSecurityAnalysisColumnsDefs: UseSecurityAnalysisColumnsDefsProps = (
    filterEnums,
    resultType,
    tabIndex,
    goToFirstPage
) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const { openSLD } = useWorkspacePanelActions();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const nodeUuid = currentNode?.id;

    const getEnumLabel = useCallback(
        (value: string) =>
            value
                ? intl.formatMessage({
                      id: value,
                      defaultMessage: value,
                  })
                : '',
        [intl]
    );

    // for nmk views, click handler on subjectId cell
    const onClickNmKConstraint = useCallback(
        (row: SecurityAnalysisNmkTableRow, column?: ColDef) => {
            if (studyUuid && nodeUuid && currentRootNetworkUuid) {
                if (column?.field === 'subjectId') {
                    let vlId: string | undefined = '';
                    const { subjectId, side } = row || {};
                    const getBranchSide = (side: string | undefined): BranchSide | null => {
                        if (side === intl.formatMessage({ id: BranchSide.ONE })) {
                            return BranchSide.ONE;
                        } else if (side === intl.formatMessage({ id: BranchSide.TWO })) {
                            return BranchSide.TWO;
                        }
                        return null;
                    };

                    // ideally we would have the type of the network element, but we don't
                    fetchVoltageLevelIdForLineOrTransformerBySide(
                        studyUuid,
                        nodeUuid,
                        currentRootNetworkUuid,
                        subjectId ?? '',
                        getBranchSide(side) ?? BranchSide.ONE
                    )
                        .then((voltageLevelId) => {
                            if (voltageLevelId) {
                                vlId = voltageLevelId;
                            } else {
                                // if we didnt find a line or transformer, it's a voltage level
                                vlId = subjectId;
                            }
                        })
                        .finally(() => {
                            if (vlId) {
                                openSLD({ equipmentId: vlId, panelType: PanelType.SLD_VOLTAGE_LEVEL });
                                return;
                            }
                            console.error(`Impossible to open the SLD for equipment ID '${row.subjectId}'`);
                            snackError({
                                messageId: 'NetworkEquipmentNotFound',
                                messageValues: {
                                    equipmentId: row.subjectId || '',
                                },
                            });
                        });
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [nodeUuid, currentRootNetworkUuid, snackError, studyUuid, intl]
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
                    <Button sx={resultsStyles.sldLink} onClick={onClick}>
                        <OverflowableText text={value} />
                    </Button>
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
                    filterEnums.nmk,
                    getEnumLabel,
                    tabIndex,
                    goToFirstPage
                );
            case RESULT_TYPE.NMK_LIMIT_VIOLATIONS:
                return securityAnalysisTableNmKConstraintsColumnsDefinition(
                    intl,
                    SubjectIdRenderer,
                    filterEnums.nmk,
                    getEnumLabel,
                    tabIndex,
                    goToFirstPage
                );
            case RESULT_TYPE.N:
                return securityAnalysisTableNColumnsDefinition(
                    intl,
                    filterEnums.n,
                    getEnumLabel,
                    tabIndex,
                    goToFirstPage
                );
        }
    }, [resultType, intl, SubjectIdRenderer, filterEnums.nmk, filterEnums.n, getEnumLabel, tabIndex, goToFirstPage]);

    return columnDefs;
};
