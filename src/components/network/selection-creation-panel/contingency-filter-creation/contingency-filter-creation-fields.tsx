/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ElementType, FILTER_EQUIPMENTS, FormEquipment, SelectInput } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import { EQUIPMENT_TYPES, equipmentTypeToLabel } from 'components/utils/equipment-types';
import { DESTINATION_FOLDER, EQUIPMENT_TYPE_FIELD, NAME } from 'components/utils/field-constants';
import { FC, useMemo } from 'react';
import { SELECTION_TYPES } from '../selection-types';
import { SelectionCreationPanelDirectorySelector } from './contingency-filter-creation-directory-selector';
import { SelectionCreationPanelFormSchema } from '../selection-creation-schema';
import { useWatch } from 'react-hook-form';
import { UniqueNameInput } from 'components/dialogs/commons/unique-name-input';

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
        if (selectionType === SELECTION_TYPES.FILTER) {
            return Object.values(FILTER_EQUIPMENTS).map((equipment: FormEquipment) => {
                return {
                    id: equipment.id,
                    label: equipment.label,
                };
            });
        } else {
            // might be better to use CONTINGENCY_LIST_EQUIPMENTS from commons ui once the list is finalised
            const equipmentTypesToExclude = new Set([
                EQUIPMENT_TYPES.SWITCH,
                EQUIPMENT_TYPES.BUS,
                EQUIPMENT_TYPES.HVDC_CONVERTER_STATION,
            ]);
            return Object.values(EQUIPMENT_TYPES)
                .filter((equipmentType) => !equipmentTypesToExclude.has(equipmentType))
                .map((value) => {
                    return {
                        id: value,
                        label: equipmentTypeToLabel(value),
                    };
                });
        }
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
                    activeDirectory={destinationFolderWatcher?.folderId ?? null}
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
