/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    EquipmentInfos,
    EquipmentType,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { SELECTION_TYPES } from './selection-types';
import {
    createMapContingencyList,
    createMapFilter,
} from '../../../services/study/network-map';
import { SelectionCreationPanelFormFields } from './selection-creation-panel';

export type UseSaveMapOutput = {
    pendingState: boolean;
    onSaveSelection: (
        equipments: EquipmentInfos[],
        selection: SelectionCreationPanelFormFields,
        distDir: TreeViewFinderNodeProps,
        nominalVoltages: number[]
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
            selection: SelectionCreationPanelFormFields,
            distDir: TreeViewFinderNodeProps,
            nominalVoltages: number[]
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
                            selection.equipmentType as EquipmentType,
                            selection.name,
                            distDir,
                            studyUuid,
                            currentNodeUuid,
                            selectedEquipmentsIds,
                            nominalVoltages
                        );
                        snackInfo({
                            messageTxt: intl.formatMessage({
                                id: 'FilterCreationSuccess',
                            }),
                        });
                    } else {
                        await createMapContingencyList(
                            selection.equipmentType as EquipmentType,
                            selection.name,
                            distDir,
                            studyUuid,
                            currentNodeUuid,
                            equipments,
                            nominalVoltages
                        );
                        snackInfo({
                            messageTxt: intl.formatMessage({
                                id: 'ContingencyListCreationSuccess',
                            }),
                        });
                    }
                }
            } catch (error: any) {
                if (error.message === 'EmptySelection') {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: error.message,
                        }),
                        headerId: isFilter
                            ? 'FilterCreationError'
                            : 'ContingencyListCreationError',
                    });
                } else {
                    snackError({
                        messageTxt: intl.formatMessage({
                            id: error.message,
                        }),
                        headerId: isFilter
                            ? 'FilterCreationError'
                            : 'ContingencyListCreationError',
                    });
                }
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
