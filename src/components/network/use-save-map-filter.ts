/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EquipmentInfos,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FILTER_NAME, NAME } from 'components/utils/field-constants';
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { createMapFilter } from '../../services/study/network-map.js';

interface IFilterCreation {
    [FILTER_NAME]: string | null;
    [NAME]: string;
    equipmentType: string | null;
}

type UseSaveMapFilterOutput = {
    pendingState: boolean;
    saveMapFilter: (
        equipments: EquipmentInfos[],
        filter: IFilterCreation,
        distDir: TreeViewFinderNodeProps
    ) => Promise<boolean>;
};

export const useSaveMapFilter = (): UseSaveMapFilterOutput => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNodeUuid = useSelector(
        (state: ReduxState) => state.currentTreeNode.id
    );
    const { snackInfo, snackError, snackWarning } = useSnackMessage();
    const [pendingState, setPendingState] = useState(false);

    const saveMapFilter = useCallback(
        async (
            equipments: EquipmentInfos[],
            filter: IFilterCreation,
            distDir: TreeViewFinderNodeProps
        ) => {
            setPendingState(true);
            try {
                const equipmentsIds = equipments.map(
                    (eq: EquipmentInfos) => eq.id
                );
                if (equipmentsIds.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: 'FilterCreationIgnored',
                    });
                } else {
                    await createMapFilter(
                        filter,
                        distDir,
                        studyUuid,
                        currentNodeUuid,
                        equipmentsIds
                    );
                    snackInfo({
                        messageTxt: intl.formatMessage(
                            {
                                id: 'FilterCreationSuccess',
                            },
                            {
                                filterName: filter.name,
                            }
                        ),
                    });
                }
            } catch (error: any) {
                snackError({
                    messageTxt: intl.formatMessage({
                        id: error.message,
                    }),
                    headerId: 'FilterCreationError',
                });
                return false;
            } finally {
                setPendingState(false);
            }
            return true; // success
        },
        [currentNodeUuid, intl, snackError, snackInfo, snackWarning, studyUuid]
    );
    return { pendingState, saveMapFilter };
};
