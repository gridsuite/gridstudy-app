/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { IntlShape, useIntl } from 'react-intl';
import {
    ConstraintsFromContingencyItem,
    ContingenciesFromConstraintItem,
    SecurityAnalysisNmkTableRow,
    SecurityAnalysisResultNmkProps,
} from './security-analysis.type';
import {
    flattenNmKResultsConstraints,
    flattenNmKResultsContingencies,
    handlePostSortRows,
    PAGE_OPTIONS,
    RESULT_TYPE,
    securityAnalysisTableNmKConstraintsColumnsDefinition,
    securityAnalysisTableNmKContingenciesColumnsDefinition,
} from './security-analysis-result-utils';
import { SecurityAnalysisTable } from './security-analysis-table';
import { ColDef, ICellRendererParams, RowClassParams } from 'ag-grid-community';
import { Box, Button, Tooltip, useTheme } from '@mui/material';
import { fetchLineOrTransformer } from '../../../services/study/network-map';
import { useSnackMessage } from '@gridsuite/commons-ui';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { BranchSide } from '../../utils/constants';
import { downloadSecurityAnalysisResultZippedCsv } from 'services/study/security-analysis';
import { downloadZipFile } from 'services/utils';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    button: {
        color: 'node.background',
    },
};

export const SecurityAnalysisResultNmk: FunctionComponent<
    SecurityAnalysisResultNmkProps
> = ({
    result,
    isLoadingResult,
    isFromContingency,
    openVoltageLevelDiagram,
    studyUuid,
    nodeUuid,
    paginationProps,
    sortProps,
    filterProps,
    filterEnums,
}) => {
    const { content } = result || {};

    const theme = useTheme();
    const intl: IntlShape = useIntl();
    const { snackError } = useSnackMessage();

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
                                    intl.formatMessage({ id: BranchSide.ONE })
                                ) {
                                    vlId = equipment.voltageLevelId1;
                                } else if (
                                    side ===
                                    intl.formatMessage({ id: BranchSide.TWO })
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

    const columnDefs = useMemo(
        () =>
            isFromContingency
                ? securityAnalysisTableNmKContingenciesColumnsDefinition(
                      intl,
                      SubjectIdRenderer,
                      filterProps,
                      sortProps,
                      filterEnums
                  )
                : securityAnalysisTableNmKConstraintsColumnsDefinition(
                      intl,
                      SubjectIdRenderer,
                      filterProps,
                      sortProps,
                      filterEnums
                  ),
        [
            isFromContingency,
            intl,
            SubjectIdRenderer,
            filterProps,
            sortProps,
            filterEnums,
        ]
    );

    const rows = useMemo(
        () =>
            isFromContingency
                ? flattenNmKResultsContingencies(
                      intl,
                      content as ConstraintsFromContingencyItem[]
                  )
                : flattenNmKResultsConstraints(
                      intl,
                      content as ContingenciesFromConstraintItem[]
                  ),
        [content, intl, isFromContingency]
    );

    const getRowStyle = useCallback(
        (params: RowClassParams) => {
            if (
                (isFromContingency && params?.data?.contingencyId) ||
                (!isFromContingency && params?.data?.subjectId)
            ) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [isFromContingency, theme.selectedRow.background]
    );

    const exportResultCsv = useCallback(() => {
        downloadSecurityAnalysisResultZippedCsv(studyUuid, nodeUuid, {
            resultType: isFromContingency
                ? RESULT_TYPE.NMK_CONTINGENCIES
                : RESULT_TYPE.NMK_LIMIT_VIOLATIONS,
        }).then((fileBlob) => downloadZipFile(fileBlob, 'nmk-results.zip'));
    }, [isFromContingency, studyUuid, nodeUuid]);

    const agGridProps = {
        postSortRows: handlePostSortRows,
        getRowStyle,
        tooltipShowDelay: 0,
    };

    return (
        <Box sx={styles.container}>
            <Box sx={{ flexGrow: 1 }}>
                <SecurityAnalysisTable
                    rows={rows}
                    columnDefs={columnDefs}
                    isLoadingResult={isLoadingResult}
                    agGridProps={agGridProps}
                    exportCsv={exportResultCsv}
                />
            </Box>
            <Box>
                <CustomTablePagination
                    rowsPerPageOptions={PAGE_OPTIONS}
                    {...paginationProps}
                />
            </Box>
        </Box>
    );
};
