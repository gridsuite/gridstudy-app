/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import {
    ElementSearchDialog,
    equipmentStyles,
    EquipmentItem,
    EquipmentInfos,
    EquipmentType,
} from '@gridsuite/commons-ui';
import { FC } from 'react';
import { useSearchMatchingEquipments } from '../top-bar-equipment-seach-dialog/use-search-matching-equipments';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';
import { TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

interface EquipmentSearchDialogProps {
    open: boolean;
    onClose: () => void;
    onSelectionChange: (equipment: EquipmentInfos) => void;
    equipmentType: EquipmentType;
    currentNodeUuid: UUID;
}

/**
 * Dialog to search equipment with a given type
 * @param {Boolean} open: Is the dialog open ?
 * @param {Function} onClose: callback to call when closing the dialog
 * @param {Function} onSelectionChange: callback when the selection changes
 * @param {String} equipmentType: the type of equipment we want to search
 * @param {String} currentNodeUuid: the node selected
 */
const EquipmentSearchDialog: FC<EquipmentSearchDialogProps> = ({
    open,
    onClose,
    onSelectionChange,
    equipmentType,
    currentNodeUuid,
}) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const { searchTerm, updateSearchTerm, equipmentsFound, isLoading } = useSearchMatchingEquipments({
        studyUuid: studyUuid,
        nodeUuid: currentNodeUuid,
        inUpstreamBuiltParentNode: true,
        equipmentType: equipmentType,
    });

    return (
        <ElementSearchDialog
            open={open}
            onClose={onClose}
            searchTerm={searchTerm}
            onSearchTermChange={updateSearchTerm}
            onSelectionChange={(element) => {
                updateSearchTerm('');
                onSelectionChange(element);
            }}
            elementsFound={equipmentsFound}
            renderElement={(props) => <EquipmentItem styles={equipmentStyles} {...props} key={props.element.key} />}
            loading={isLoading}
            getOptionLabel={(equipment) => equipment.label}
            isOptionEqualToValue={(equipment1, equipment2) => equipment1.id === equipment2.id}
            renderInput={(displayedValue, params) => (
                <TextField
                    autoFocus={true}
                    {...params}
                    label={intl.formatMessage({
                        id: 'element_search/label',
                    })}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <Search color="disabled" />
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

export default EquipmentSearchDialog;
