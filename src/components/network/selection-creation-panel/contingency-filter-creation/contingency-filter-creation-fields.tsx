/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    CONTINGENCY_LIST_EQUIPMENTS,
    ElementType,
    FILTER_EQUIPMENTS,
    SelectInput,
    UniqueNameInput,
} from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { DESTINATION_FOLDER, EQUIPMENT_TYPE_FIELD, NAME } from 'components/utils/field-constants';
import { FC, useMemo } from 'react';
import { SELECTION_TYPES } from '../selection-types';
import { SelectionCreationPanelDirectorySelector } from './contingency-filter-creation-directory-selector';
import { SelectionCreationPanelFormSchema } from '../selection-creation-schema';
import { useWatch } from 'react-hook-form';

interface ContingencyFilterCreationListProps {
    pendingState: boolean;
    selectionType: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER;
}

const selectionTypeToElementType = (selectionType: SELECTION_TYPES.CONTIGENCY_LIST | SELECTION_TYPES.FILTER) => {
    if (selectionType === SELECTION_TYPES.CONTIGENCY_LIST) {
        return ElementType.CONTINGENCY_LIST;
    }

    return ElementType.FILTER;
};

export const ContingencyFilterCreationFields: FC<ContingencyFilterCreationListProps> = (props) => {
    const { selectionType, pendingState } = props;
    const destinationFolderWatcher = useWatch<SelectionCreationPanelFormSchema, typeof DESTINATION_FOLDER>({
        name: `${DESTINATION_FOLDER}`,
    });

    const equipmentTypesOptions = useMemo(() => {
        return Object.values(
            selectionType === SELECTION_TYPES.FILTER ? FILTER_EQUIPMENTS : CONTINGENCY_LIST_EQUIPMENTS
        ).map((equipment: { id: string; label: string }) => {
            return {
                id: equipment.id,
                label: equipment.label,
            };
        });
    }, [selectionType]);

    return (
        <>
            <Grid container>
                <SelectInput
                    name={EQUIPMENT_TYPE_FIELD}
                    options={equipmentTypesOptions}
                    label={'EquipmentType'}
                    fullWidth
                    size={'medium'}
                    disableClearable={true}
                    disabled={pendingState}
                />
            </Grid>

            <Grid container>
                <UniqueNameInput
                    name={NAME}
                    label={'Name'}
                    elementType={selectionTypeToElementType(selectionType)}
                    activeDirectory={destinationFolderWatcher?.folderId}
                    autoFocus
                    formProps={{
                        variant: 'standard',
                        disabled: pendingState,
                    }}
                />
            </Grid>
            <SelectionCreationPanelDirectorySelector pendingState={pendingState} />
        </>
    );
};
