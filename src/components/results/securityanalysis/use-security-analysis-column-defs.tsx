import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SecurityAnalysisNmkTableRow } from './security-analysis.type';
import { ColDef } from 'ag-grid-community';
import { UUID } from 'crypto';
import { fetchLineOrTransformer } from 'services/study/network-map';
import { BranchSide } from 'components/utils/constants';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { ICellRendererParams } from 'ag-grid-community';
import { Button, Tooltip } from '@mui/material';
import {
    RESULT_TYPE,
    securityAnalysisTableNColumnsDefinition,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { SortPropsType } from 'hooks/use-aggrid-sort';
import { FilterEnumsType, FilterPropsType } from 'hooks/use-aggrid-row-filter';

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
    openVoltageLevelDiagram: (id: string) => void,
    studyUuid: UUID,
    nodeUuid: UUID
) => ColDef<any>[];

export const useSecurityAnalysisColumnsDefs: UseSecurityAnalysisColumnsDefsProps =
    (
        sortProps,
        filterProps,
        filterEnums,
        resultType,
        openVoltageLevelDiagram,
        nodeUuid,
        studyUuid
    ) => {
        const intl = useIntl();
        const { snackError } = useSnackMessage();

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
