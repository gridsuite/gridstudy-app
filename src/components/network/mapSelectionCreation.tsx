/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { STUDY_DISPLAY_MODE, setStudyDisplayMode } from 'redux/actions';
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
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { UUID } from 'crypto';

interface MapSelectionCreationProps {
    studyUuid: UUID;
    currentNode: UUID;
    networkMapref: React.RefObject<any>; // Replace 'any' with the actual type if known
}

const MapSelectionCreation: React.FC<MapSelectionCreationProps> = ({
    studyUuid,
    currentNode,
    networkMapref,
}) => {
    const intl = useIntl();
    const { snackInfo, snackError, snackWarning } = useSnackMessage();

    const dispatch = useDispatch();

    const onCancelFunction = useCallback(() => {
        networkMapref.current.cleanDraw();
        dispatch(setStudyDisplayMode(STUDY_DISPLAY_MODE.MAP));
    }, [dispatch, networkMapref]);

    const createFilter = async (
        selection: any,
        distDir: any,
        selectedEquipmentsIds: string[]
    ) => {
        try {
            await createMapFilter(
                selection,
                distDir,
                studyUuid,
                currentNode,
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
        selection: any,
        distDir: any,
        selectedEquipments: any[]
    ) => {
        try {
            await createMapContingencyList(
                selection,
                distDir,
                studyUuid,
                currentNode,
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

    const onSaveSelection = async (selection: any, distDir: any) => {
        const isFilter = selection.selectionType === SELECTION_TYPES.FILTER;

        try {
            const selectedEquipments =
                selection.equipmentType === EQUIPMENT_TYPES.LINE
                    ? networkMapref.current.getSelectedLines()
                    : networkMapref.current.getSelectedSubstations();
            const selectedEquipmentsIds = selectedEquipments.map(
                (eq: any) => eq.id
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
            onCancel={onCancelFunction}
        />
    );
};

export default MapSelectionCreation;
