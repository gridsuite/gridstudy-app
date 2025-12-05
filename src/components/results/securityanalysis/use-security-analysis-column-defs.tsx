/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SecurityAnalysisNmkTableRow } from './security-analysis.type';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { fetchVoltageLevelIdForLineOrTransformerBySide } from 'services/study/network-map';
import { BranchSide } from 'components/utils/constants';
import { OverflowableText, useSnackMessage } from '@gridsuite/commons-ui';
import { Button } from '@mui/material';
import {
    getStoreFields,
    RESULT_TYPE,
    securityAnalysisTableNColumnsDefinition,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { resultsStyles } from '../common/utils';
import { FilterEnumsType } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { openSLD } from '../../../redux/slices/workspace-slice';
import { FilterConfig, FilterType } from '../../../types/custom-aggrid-types';
import { useComputationColumnsFilters } from '../../../hooks/use-computation-columns-filters';
import { PanelType } from '../../workspace/types/workspace.types';

export interface SecurityAnalysisFilterEnumsType {
    n: FilterEnumsType;
    nmk: FilterEnumsType;
}

type UseSecurityAnalysisColumnsDefsProps = (
    filterEnums: SecurityAnalysisFilterEnumsType,
    resultType: RESULT_TYPE,
    tabIndex: number,
    memoizedSetPageCallback: () => void
) => ColDef[];

export const useSecurityAnalysisColumnsDefs: UseSecurityAnalysisColumnsDefsProps = (
    filterEnums,
    resultType,
    tabIndex,
    memoizedSetPageCallback
) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const nodeUuid = currentNode?.id;

    const getEnumLabel = useCallback(
        (value: string) =>
            intl.formatMessage({
                id: value,
                defaultMessage: value,
            }),
        [intl]
    );

    const { persistFilters } = useComputationColumnsFilters(FilterType.SecurityAnalysis, getStoreFields(tabIndex));

    const onFilter = useCallback(
        (colId: string, api: GridApi, filters: FilterConfig[]) => {
            memoizedSetPageCallback();
            persistFilters(colId, api, filters);
        },
        [memoizedSetPageCallback, persistFilters]
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
                            if (!voltageLevelId) {
                                // if we didnt find a line or transformer, it's a voltage level
                                vlId = subjectId;
                            } else {
                                vlId = voltageLevelId;
                            }
                        })
                        .finally(() => {
                            if (vlId) {
                                dispatch(openSLD({ id: vlId, panelType: PanelType.SLD_VOLTAGE_LEVEL }));
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
                    onFilter
                );
            case RESULT_TYPE.NMK_LIMIT_VIOLATIONS:
                return securityAnalysisTableNmKConstraintsColumnsDefinition(
                    intl,
                    SubjectIdRenderer,
                    filterEnums.nmk,
                    getEnumLabel,
                    tabIndex,
                    onFilter
                );
            case RESULT_TYPE.N:
                return securityAnalysisTableNColumnsDefinition(intl, filterEnums.n, getEnumLabel, tabIndex, onFilter);
        }
    }, [resultType, intl, SubjectIdRenderer, filterEnums.nmk, filterEnums.n, getEnumLabel, tabIndex, onFilter]);

    return columnDefs;
};
