import {
    DirectoryItemSelector,
    ElementType,
    FILTER_EQUIPMENTS,
    FormEquipment,
    SelectInput,
    TreeViewFinderNodeProps,
    UniqueNameInput,
    fetchDirectoryElementPath,
} from '@gridsuite/commons-ui';
import { FolderOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { EQUIPMENT_TYPES, equipmentTypeToLabel } from 'components/utils/equipment-types';
import { DESTINATION_FOLDER, EQUIPMENT_TYPE_FIELD, FOLDER_ID, NAME } from 'components/utils/field-constants';
import { UUID } from 'crypto';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { SELECTION_TYPES } from '../selection-types';
import { AppState } from 'redux/reducer';
import { SelectionCreationPanelDirectorySelector } from './contingency-filter-creation-directory-selector';
import { SelectionCreationPanelFormSchema, SelectionCreationPanelNotNadFields } from '../selection-creation-schema';
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
    const destinationFolderWatcher = useWatch<SelectionCreationPanelFormSchema, 'destinationFolder.folderId'>({
        name: `${DESTINATION_FOLDER}.${FOLDER_ID}`,
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
                    activeDirectory={destinationFolderWatcher}
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
