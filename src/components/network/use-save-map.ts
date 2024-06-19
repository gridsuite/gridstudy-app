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
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { SELECTION_TYPES } from '../utils/selection-types';
import {
    createMapContingencyList,
    createMapFilter,
} from '../../services/study/network-map';

export interface ISelection {
    selectionType: string;
    equipmentType: string;
}
export type UseSaveMapOutput = {
    pendingState: boolean;
    onSaveSelection: (
        equipments: EquipmentInfos[],
        selection: ISelection,
        distDir: TreeViewFinderNodeProps
    ) => Promise<boolean>;
};

export const useSaveMap = (): UseSaveMapOutput => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNodeUuid = useSelector(
        (state: ReduxState) => state.currentTreeNode.id
    );
    const { snackInfo, snackError, snackWarning } = useSnackMessage();
    const [pendingState, setPendingState] = useState(false);

    const onSaveSelection = useCallback(
        async (
            equipments: EquipmentInfos[],
            selection: ISelection,
            distDir: TreeViewFinderNodeProps
        ) => {
            const isFilter = selection.selectionType === SELECTION_TYPES.FILTER;

            setPendingState(true);
            try {
                //we want to calculate selectedLine or selectedSubstation only when needed
                //call getSelectedLines if the user want to create a filter with lines
                //for all others case we call getSelectedSubstations
                const selectedEquipmentsIds = equipments.map(
                    (eq: EquipmentInfos) => eq.id
                );
                if (selectedEquipmentsIds.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: isFilter
                            ? 'FilterCreationIgnored'
                            : 'ContingencyListCreationIgnored',
                    });
                    return false;
                } else {
                    if (isFilter) {
                        await createMapFilter(
                            selection,
                            distDir,
                            studyUuid,
                            currentNodeUuid,
                            selectedEquipmentsIds
                        );
                        snackInfo({
                            messageTxt: intl.formatMessage({
                                id: 'FilterCreationSuccess',
                            }),
                        });
                    } else {
                        await createMapContingencyList(
                            selection,
                            distDir,
                            studyUuid,
                            currentNodeUuid,
                            equipments
                        );
                        snackInfo({
                            messageTxt: intl.formatMessage({
                                id: 'ContingencyListCreationSuccess',
                            }),
                        });
                    }
                }
            } catch (error: any) {
                snackError({
                    messageTxt: intl.formatMessage({
                        id: error.message,
                    }),
                    headerId: isFilter
                        ? 'FilterCreationError'
                        : 'ContingencyListCreationError',
                });
                return false;
            } finally {
                setPendingState(false);
            }
            return true; // success
        },
        [currentNodeUuid, intl, snackError, snackInfo, snackWarning, studyUuid]
    );

    return { pendingState, onSaveSelection };
};
