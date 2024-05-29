/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import SelectionCreationPanel from './selection-creation-panel';
import { useIntl } from 'react-intl'; // For internationalization
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    EQUIPMENT_TYPES,
    SELECTION_TYPES,
} from 'components/utils/equipment-types';
import {
    createMapContingencyList,
    createMapFilter,
} from 'services/study/network-map';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

interface MapSelectionCreationProps {
    networkMapref: React.RefObject<any>;
    onCancel: () => void;
}

interface ISelection {
    selectionType: string;
    equipmentType: string;
}

interface IEquipment {
    id: string;
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

    const createFilter = async (
        selection: ISelection,
        distDir: any,
        selectedEquipmentsIds: IEquipment[]
    ) => {
        try {
            await createMapFilter(
                selection,
                distDir,
                studyUuid,
                currentNode?.id,
                selectedEquipmentsIds
            );
            snackInfo({
                messageTxt: intl.formatMessage({
                    id: 'FilterCreationSuccess',
                }),
            });
        } catch (error: any) {
            snackWarning({
                messageTxt: intl.formatMessage({
                    id: error.message,
                }),
                headerId: 'FilterCreationError',
            });
        }
    };

    const createContingencyList = async (
        selection: ISelection,
        distDir: any,
        selectedEquipments: String[]
    ) => {
        try {
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
        } catch (error: any) {
            snackWarning({
                messageTxt: intl.formatMessage({
                    id: error.message,
                }),
                headerId: 'ContingencyListCreationError',
            });
        }
    };

    const onSaveSelection = async (selection: ISelection, distDir: any) => {
        const isFilter = selection.selectionType === SELECTION_TYPES.FILTER;

        try {
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
                return;
            }

            if (isFilter) {
                await createFilter(selection, distDir, selectedEquipmentsIds);
            } else {
                await createContingencyList(
                    selection,
                    distDir,
                    selectedEquipments
                );
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
    };

    return (
        <SelectionCreationPanel
            onSaveSelection={onSaveSelection}
            onCancel={onCancel}
        />
    );
};

export default MapSelectionCreation;
