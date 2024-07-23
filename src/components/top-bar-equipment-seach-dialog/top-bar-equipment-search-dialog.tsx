/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import {
    ElementSearchDialog,
    Equipment,
    EquipmentInfos,
    EquipmentItem,
    TagRendererProps,
    EquipmentType,
    equipmentStyles,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { CustomSuffixRenderer } from './custom-suffix-renderer';
import { useDisabledSearchReason } from './use-disabled-search-reason';
import { useSearchEvent } from './use-search-event';
import { useTopBarSearchMatchingEquipment } from './use-top-bar-search-matching-equipments';
import {
    addToLocalStorageSearchEquipmentHistory,
    excludeElementFromCurrentSearchHistory,
} from 'redux/local-storage/search-equipment-history';
import { fetchNetworkElementInfos } from 'services/study/network';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { TopBarEquipmentSearchInput } from './top-bar-equipment-search-input';

interface TopBarEquipmentSearchDialogProps {
    showVoltageLevelDiagram: (element: Equipment) => void;
    isDialogSearchOpen: boolean;
    setIsDialogSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBarEquipmentSearchDialog: FunctionComponent<
    TopBarEquipmentSearchDialogProps
> = (props) => {
    const {
        isDialogSearchOpen,
        setIsDialogSearchOpen,
        showVoltageLevelDiagram,
    } = props;
    const intl = useIntl();

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const [equipmentTypeFilter, setEquipmentTypeFilter] =
        useState<EquipmentType | null>(null);

    const { searchTerm, updateSearchTerm, equipmentsFound, isLoading } =
        useTopBarSearchMatchingEquipment({
            studyUuid: studyUuid,
            nodeUuid: currentNode?.id,
            equipmentType: equipmentTypeFilter ?? undefined,
        });
    const disabledSearchReason = useDisabledSearchReason();

    const enableSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(true);
    }, [setIsDialogSearchOpen]);

    const { snackWarning } = useSnackMessage();

    const closeDialog = useCallback(() => {
        setIsDialogSearchOpen(false);
    }, [setIsDialogSearchOpen]);

    const onSelectionChange = useCallback(
        (equipment: EquipmentInfos) => {
            closeDialog();
            updateSearchTerm('');
            addToLocalStorageSearchEquipmentHistory(studyUuid, equipment);
            fetchNetworkElementInfos(
                studyUuid,
                currentNode?.id,
                equipment.type,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                equipment.id,
                false
            )
                .then(() => {
                    showVoltageLevelDiagram(equipment);
                })
                .catch(() => {
                    excludeElementFromCurrentSearchHistory(
                        studyUuid,
                        equipment
                    );
                    updateSearchTerm('');
                    snackWarning({
                        messageId: 'NetworkEquipmentNotFound',
                        messageValues: { equipmentId: equipment.id },
                    });
                });
        },
        [
            updateSearchTerm,
            closeDialog,
            showVoltageLevelDiagram,
            studyUuid,
            snackWarning,
            currentNode,
        ]
    );

    const suffixRenderer = useCallback(
        (props: TagRendererProps) => (
            <CustomSuffixRenderer {...props} onClose={closeDialog} />
        ),
        [closeDialog]
    );

    useSearchEvent(enableSearchDialog);

    return (
        <ElementSearchDialog
            open={isDialogSearchOpen}
            showResults={
                disabledSearchReason === '' &&
                (equipmentsFound.length > 0 || isLoading)
            }
            onClose={closeDialog}
            searchTerm={searchTerm}
            onSearchTermChange={updateSearchTerm}
            onSelectionChange={onSelectionChange}
            elementsFound={equipmentsFound}
            renderElement={(props) => (
                <EquipmentItem
                    styles={equipmentStyles}
                    {...props}
                    key={'ei-' + props.element.key}
                    suffixRenderer={suffixRenderer}
                />
            )}
            searchTermDisabled={disabledSearchReason !== ''}
            searchTermDisableReason={disabledSearchReason}
            disableClearable
            loading={isLoading}
            loadingText={intl.formatMessage({ id: 'equipmentsLoading' })}
            getOptionLabel={(equipment) => equipment.label}
            isOptionEqualToValue={(equipment1, equipment2) =>
                equipment1.id === equipment2.id
            }
            renderInput={(displayedValue, params) => (
                <TopBarEquipmentSearchInput
                    displayedValue={displayedValue}
                    params={params}
                    setEquipmentType={setEquipmentTypeFilter}
                    equipmentType={equipmentTypeFilter}
                    disabledSearchReason={disabledSearchReason}
                />
            )}
        />
    );
};
