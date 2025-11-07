/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { OverloadedEquipment } from './load-flow-result.type';
import { ColDef } from 'ag-grid-community';
import { fetchVoltageLevelIdForLineOrTransformerBySide } from '../../../services/study/network-map';
import { BranchSide } from '../../utils/constants';
import type { UUID } from 'node:crypto';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

type UseLoadFlowResultColumnActionsProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    openVoltageLevelDiagram: (id: string) => void;
};

export const useLoadFlowResultColumnActions = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    openVoltageLevelDiagram,
}: UseLoadFlowResultColumnActionsProps) => {
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const getBranchSide = useCallback(
        (side: string | undefined) => {
            if (side === intl.formatMessage({ id: BranchSide.ONE })) {
                return BranchSide.ONE;
            } else if (side === intl.formatMessage({ id: BranchSide.TWO })) {
                return BranchSide.TWO;
            }
            return null;
        },
        [intl]
    );

    const onLinkClick = useCallback(
        (row: OverloadedEquipment, column?: ColDef) => {
            if (studyUuid && nodeUuid && currentRootNetworkUuid) {
                if (column?.field === 'subjectId') {
                    let vlId: string | undefined = '';
                    const { subjectId, side } = row || {};
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
                                vlId = subjectId;
                            } else {
                                vlId = voltageLevelId;
                            }
                        })
                        .finally(() => {
                            if (!vlId) {
                                snackError({
                                    messageId: 'NetworkEquipmentNotFound',
                                    messageValues: {
                                        equipmentId: row.subjectId || '',
                                    },
                                });
                            } else if (openVoltageLevelDiagram) {
                                openVoltageLevelDiagram(vlId);
                            }
                        });
                }
            }
        },
        [studyUuid, nodeUuid, currentRootNetworkUuid, getBranchSide, openVoltageLevelDiagram, snackError]
    );

    return { onLinkClick };
};
