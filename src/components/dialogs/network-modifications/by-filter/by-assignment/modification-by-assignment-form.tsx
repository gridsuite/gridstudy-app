/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FC } from 'react';
import { ASSIGNMENTS, EQUIPMENT_TYPE_FIELD } from '../../../../utils/field-constants';
import { ExpandableInput } from '../../../../utils/rhf-inputs/expandable-input';
import AssignmentForm from './assignment/assignment-form';
import { Box, Grid } from '@mui/material';
import { getAssignmentInitialValue } from './assignment/assignment-utils';
import { useFormContext, useWatch } from 'react-hook-form';
import SelectWithConfirmationInput from '../../../commons/select-with-confirmation-input';
import { mergeSx, unscrollableDialogStyles } from '@gridsuite/commons-ui';
import { EQUIPMENTS_FIELDS } from './assignment/assignment-constants';
import useGetLabelEquipmentTypes from '../../../../../hooks/use-get-label-equipment-types';
import GridItem from '../../../commons/grid-item';

interface ModificationByAssignmentFormProps {}

type EquipmentTypeOptionType = keyof typeof EQUIPMENTS_FIELDS;

const EQUIPMENT_TYPE_OPTIONS: EquipmentTypeOptionType[] = Object.keys(EQUIPMENTS_FIELDS) as EquipmentTypeOptionType[];

const ModificationByAssignmentForm: FC<ModificationByAssignmentFormProps> = () => {
    const { setValue, getValues } = useFormContext();

    const getOptionLabel = useGetLabelEquipmentTypes();

    const equipmentTypeField = (
        <SelectWithConfirmationInput
            name={EQUIPMENT_TYPE_FIELD}
            label={'EquipmentType'}
            options={EQUIPMENT_TYPE_OPTIONS}
            onValidate={() => {
                setValue(
                    ASSIGNMENTS,
                    getValues(ASSIGNMENTS).map(() => ({
                        ...getAssignmentInitialValue(),
                    }))
                );
            }}
            getOptionLabel={getOptionLabel}
        />
    );

    const assignmentsField = (
        <ExpandableInput
            name={ASSIGNMENTS}
            Field={AssignmentForm}
            addButtonLabel={'addNewAssignment'}
            initialValue={getAssignmentInitialValue()}
        />
    );

    return (
        <Box sx={mergeSx(unscrollableDialogStyles.unscrollableContainer, { height: '100%' })}>
            <Grid container sx={unscrollableDialogStyles.unscrollableHeader}>
                <GridItem size={3.15}>{equipmentTypeField}</GridItem>
            </Grid>
            <Grid container sx={unscrollableDialogStyles.scrollableContent}>
                <GridItem size={12}>{assignmentsField}</GridItem>
            </Grid>
        </Box>
    );
};

export default ModificationByAssignmentForm;
