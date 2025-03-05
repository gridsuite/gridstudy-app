/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Equipment, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { SELECTION_TYPES } from './selection-types';
import { createMapContingencyList, createMapFilter } from '../../../services/study/network-map';
import { DestinationFolder, SelectionCreationPanelNotNadFields } from './selection-creation-schema';

export type UseSaveMapOutput = {
    pendingState: boolean;
    onSaveSelection: (
        equipments: Equipment[],
        selection: SelectionCreationPanelNotNadFields,
        distDir: DestinationFolder,
        nominalVoltages: number[]
    ) => Promise<boolean>;
};

export const useSaveMap = (): UseSaveMapOutput => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const { snackInfo, snackError, snackWarning } = useSnackMessage();
    const [pendingState, setPendingState] = useState(false);

    const onSaveSelection = useCallback(
        async (
            equipments: Equipment[],
            selection: SelectionCreationPanelNotNadFields,
            distDir: DestinationFolder,
            nominalVoltages: number[]
        ) => {
            const isFilter = selection.selectionType === SELECTION_TYPES.FILTER;

            setPendingState(true);
            try {
                //we want to calculate selectedLine or selectedSubstation only when needed
                //call getSelectedLines if the user want to create a filter with lines
                //for all others case we call getSelectedSubstations
                const selectedEquipmentsIds = equipments.map((eq) => eq.id);
                if (selectedEquipmentsIds.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: isFilter ? 'FilterCreationIgnored' : 'ContingencyListCreationIgnored',
                    });
                    return false;
                }

                if (isFilter) {
                    await createMapFilter(
                        selection.equipmentType,
                        selection.name,
                        distDir.folderId,
                        // @ts-expect-error TODO: manage null case
                        studyUuid,
                        currentNodeUuid,
                        currentRootNetworkUuid,
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
                        selection.equipmentType,
                        selection.name,
                        distDir.folderId,
                        // @ts-expect-error TODO: manage null case
                        studyUuid,
                        currentNodeUuid,
                        currentRootNetworkUuid,
                        equipments,
                        nominalVoltages
                    );
                    snackInfo({
                        messageTxt: intl.formatMessage({
                            id: 'ContingencyListCreationSuccess',
                        }),
                    });
                }
            } catch (error: any) {
                if (error.message === 'EmptySelection') {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: error.message,
                        }),
                        headerId: isFilter ? 'FilterCreationError' : 'ContingencyListCreationError',
                    });
                } else {
                    snackError({
                        messageTxt: intl.formatMessage({
                            id: error.message,
                        }),
                        headerId: isFilter ? 'FilterCreationError' : 'ContingencyListCreationError',
                    });
                }
                return false;
            } finally {
                setPendingState(false);
            }
            return true; // success
        },
        [currentNodeUuid, currentRootNetworkUuid, intl, snackError, snackInfo, snackWarning, studyUuid]
    );

    return { pendingState, onSaveSelection };
};
