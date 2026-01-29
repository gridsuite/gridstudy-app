/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementSearchDialog,
    EquipmentInfos,
    EquipmentInfosTypes,
    EquipmentItem,
    equipmentStyles,
    EquipmentType,
    ExtendedEquipmentType,
    fetchNetworkElementInfos,
    StudyContext,
    TagRendererProps,
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
} from 'redux/session-storage/search-equipment-history';
import { TopBarEquipmentSearchInput } from './top-bar-equipment-search-input';
import { UUID } from 'node:crypto';

interface TopBarEquipmentSearchDialogProps {
    studyContext: StudyContext;
    showVoltageLevelDiagram: (element: EquipmentInfos) => void;
    isDialogSearchOpen: boolean;
    setIsDialogSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
    disableEventSearch?: boolean;
    disablCenterSubstation?: boolean;
    disableKeyboardShortcut?: boolean;
}

export const TopBarEquipmentSearchDialog: FunctionComponent<TopBarEquipmentSearchDialogProps> = (props) => {
    const {
        studyContext,
        isDialogSearchOpen,
        setIsDialogSearchOpen,
        showVoltageLevelDiagram,
        disableEventSearch,
        disablCenterSubstation = false,
        disableKeyboardShortcut = false,
    } = props;
    const intl = useIntl();
    const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<EquipmentType | ExtendedEquipmentType | null>(null);

    const { searchTerm, updateSearchTerm, equipmentsFound, isLoading } = useTopBarSearchMatchingEquipment({
        studyContext,
        equipmentType: equipmentTypeFilter ?? undefined,
    });
    const disabledSearchReason = useDisabledSearchReason();

    const enableSearchDialog = useCallback(() => {
        if (!disableEventSearch) {
            setIsDialogSearchOpen(true);
        }
    }, [disableEventSearch, setIsDialogSearchOpen]);

    const { snackWarning } = useSnackMessage();

    const closeDialog = useCallback(() => {
        setIsDialogSearchOpen(false);
    }, [setIsDialogSearchOpen]);

    const onSelectionChange = useCallback(
        (equipment: EquipmentInfos) => {
            closeDialog();
            updateSearchTerm('');
            addToLocalStorageSearchEquipmentHistory(studyContext.studyId, equipment);
            fetchNetworkElementInfos(
                studyContext.studyId,
                studyContext.nodeId,
                studyContext.rootNetworkId,
                equipment.type,
                EquipmentInfosTypes.LIST.type,
                equipment.id as UUID,
                false
            )
                .then(() => {
                    showVoltageLevelDiagram(equipment);
                })
                .catch(() => {
                    excludeElementFromCurrentSearchHistory(studyContext.studyId, equipment);
                    updateSearchTerm('');
                    snackWarning({
                        messageId: 'NetworkEquipmentNotFound',
                        messageValues: { equipmentId: equipment.id },
                    });
                });
        },
        [updateSearchTerm, closeDialog, showVoltageLevelDiagram, snackWarning, studyContext]
    );

    const suffixRenderer = useCallback(
        (props: TagRendererProps) => (
            <CustomSuffixRenderer disablCenterSubstation={disablCenterSubstation} {...props} onClose={closeDialog} />
        ),
        [closeDialog, disablCenterSubstation]
    );

    useSearchEvent(disableKeyboardShortcut ? () => {} : enableSearchDialog);

    return (
        <ElementSearchDialog
            open={isDialogSearchOpen}
            showResults={disabledSearchReason === '' && (equipmentsFound.length > 0 || isLoading)}
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
            isOptionEqualToValue={(equipment1, equipment2) => equipment1.id === equipment2.id}
            renderInput={(displayedValue, params) => (
                <TopBarEquipmentSearchInput
                    displayedValue={displayedValue}
                    params={params}
                    setEquipmentType={setEquipmentTypeFilter}
                    equipmentType={equipmentTypeFilter}
                />
            )}
        />
    );
};
