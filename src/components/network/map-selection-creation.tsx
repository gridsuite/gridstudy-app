/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import SelectionCreationPanel from './selection-creation-panel';
import { useIntl } from 'react-intl'; // For internationalization
import {
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    createMapContingencyList,
    createMapFilter,
} from 'services/study/network-map';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { useCallback } from 'react';
import { SELECTION_TYPES } from 'components/utils/selection-types';
import { IEquipment } from 'services/study/contingency-list';

interface INetworkMap {
    getSelectedLines: () => [];
    getSelectedSubstations: () => [];
}
interface MapSelectionCreationProps {
    networkMapref: React.MutableRefObject<INetworkMap>;
    onCancel: () => void;
}

interface ISelection {
    selectionType: string;
    equipmentType: string;
}

const MapSelectionCreation: React.FC<MapSelectionCreationProps> = ({
    networkMapref,
    onCancel,
}) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const { snackInfo, snackError, snackWarning } = useSnackMessage();

    const onSaveSelection = useCallback(
        async (
            selection: ISelection,
            distDir: TreeViewFinderNodeProps,
            setIsLoading: (isLoading: boolean) => void
        ) => {
            const isFilter = selection.selectionType === SELECTION_TYPES.FILTER;

            setIsLoading(true);
            try {
                //we want to calculate selectedLine or selectedSubstation only when needed
                //call getSelectedLines if the user want to create a filter with lines
                //for all others case we call getSelectedSubstations
                const selectedEquipments =
                    selection.equipmentType === EQUIPMENT_TYPES.LINE
                        ? networkMapref.current.getSelectedLines()
                        : networkMapref.current.getSelectedSubstations();
                const selectedEquipmentsIds = selectedEquipments.map(
                    (eq: IEquipment) => eq.id
                );
                if (selectedEquipments.length === 0) {
                    snackWarning({
                        messageTxt: intl.formatMessage({
                            id: 'EmptySelection',
                        }),
                        headerId: isFilter
                            ? 'FilterCreationIgnored'
                            : 'ContingencyListCreationIgnored',
                    });
                } else {
                    if (isFilter) {
                        await createMapFilter(
                            selection,
                            distDir,
                            studyUuid,
                            currentNode.id,
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
                            currentNode?.id,
                            selectedEquipments
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
            }
            setIsLoading(false);
        },
        [
            currentNode?.id,
            intl,
            snackError,
            snackInfo,
            snackWarning,
            studyUuid,
            networkMapref,
        ]
    );

    return (
        <SelectionCreationPanel
            onSaveSelection={onSaveSelection}
            onCancel={onCancel}
        />
    );
};

export default MapSelectionCreation;
