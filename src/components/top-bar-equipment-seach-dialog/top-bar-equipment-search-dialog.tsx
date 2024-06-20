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
    equipmentStyles,
    useSnackMessage,
    // Equipment,
} from '@gridsuite/commons-ui';
import { FunctionComponent, useCallback } from 'react';
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
import { TextField } from '@mui/material';
import { Search, SearchOff } from '@mui/icons-material';

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

    const { searchTerm, updateSearchTerm, equipmentsFound, isLoading } =
        useTopBarSearchMatchingEquipment({
            studyUuid: studyUuid,
            nodeUuid: currentNode?.id,
        });
    const disabledSearchReason = useDisabledSearchReason();

    const enableSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(true);
    }, [setIsDialogSearchOpen]);
    const { snackWarning } = useSnackMessage();

    const onSelectionChange = useCallback(
        (element: EquipmentInfos) => {
            setIsDialogSearchOpen(false);
            updateSearchTerm('');
            addToLocalStorageSearchEquipmentHistory(studyUuid, element);
            fetchNetworkElementInfos(
                studyUuid,
                currentNode?.id,
                element.type,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                element.id,
                false
            )
                .then(() => {
                    showVoltageLevelDiagram(element);
                })
                .catch(() => {
                    excludeElementFromCurrentSearchHistory(studyUuid, element);
                    updateSearchTerm('');
                    snackWarning({
                        messageId: 'NetworkElementNotFound',
                        messageValues: { elementId: element.id },
                    });
                });
        },
        [
            updateSearchTerm,
            setIsDialogSearchOpen,
            showVoltageLevelDiagram,
            studyUuid,
            snackWarning,
            currentNode,
        ]
    );

    useSearchEvent(enableSearchDialog);

    return (
        <ElementSearchDialog
            open={isDialogSearchOpen}
            showResults={equipmentsFound.length > 0 || isLoading}
            onClose={() => setIsDialogSearchOpen(false)}
            searchTerm={searchTerm}
            onSearchTermChange={updateSearchTerm}
            onSelectionChange={onSelectionChange}
            elementsFound={equipmentsFound}
            renderElement={(props) => (
                <EquipmentItem
                    styles={equipmentStyles}
                    {...props}
                    key={'ei-' + props.element.key}
                    suffixRenderer={CustomSuffixRenderer}
                />
            )}
            searchTermDisabled={disabledSearchReason !== ''}
            searchTermDisableReason={disabledSearchReason}
            loading={isLoading}
            loadingText={intl.formatMessage({ id: 'equipmentsLoading' })}
            getOptionLabel={(equipment) => equipment.label}
            isOptionEqualToValue={(equipment1, equipment2) =>
                equipment1.id === equipment2.id
            }
            renderInput={(displayedValue, params) => (
                <TextField
                    autoFocus={true}
                    {...params}
                    label={intl.formatMessage({
                        id: 'equipment_search/label',
                    })}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                {disabledSearchReason !== '' ? (
                                    <SearchOff color="disabled" />
                                ) : (
                                    <Search color="disabled" />
                                )}
                                {params.InputProps.startAdornment}
                            </>
                        ),
                    }}
                    value={displayedValue}
                />
            )}
        />
    );
};
