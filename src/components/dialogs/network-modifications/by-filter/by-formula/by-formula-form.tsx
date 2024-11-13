/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, FORMULAS } from '../../../../utils/field-constants';
import { ExpandableInput } from '../../../../utils/rhf-inputs/expandable-input';
import FormulaForm from './formula/formula-form';
import { getFormulaInitialValue } from './formula/formula-utils';
import { useFormContext } from 'react-hook-form';
import SelectWithConfirmationInput from '../../../commons/select-with-confirmation-input';
import { Box, Grid } from '@mui/material';
import { mergeSx, unscrollableDialogStyles } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';

interface ByFormulaFormProps {}

const EQUIPMENT_TYPE_OPTIONS = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.BATTERY,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    EQUIPMENT_TYPES.LOAD,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
];

const ByFormulaForm: FunctionComponent<ByFormulaFormProps> = () => {
    const { setValue, getValues } = useFormContext();

    const equipmentTypeField = (
        <SelectWithConfirmationInput
            name={EQUIPMENT_TYPE_FIELD}
            label={'EquipmentType'}
            options={EQUIPMENT_TYPE_OPTIONS}
            onValidate={() => {
                setValue(
                    FORMULAS,
                    getValues(FORMULAS).map(() => ({
                        ...getFormulaInitialValue(),
                    }))
                );
            }}
        />
    );

    const formulasField = (
        <ExpandableInput
            name={FORMULAS}
            Field={FormulaForm}
            addButtonLabel={'addNewFormula'}
            initialValue={getFormulaInitialValue()}
        />
    );

    return (
        <Box sx={mergeSx(unscrollableDialogStyles.unscrollableContainer, { height: '100%' })}>
            <Grid container sx={unscrollableDialogStyles.unscrollableHeader}>
                <GridItem size={2.15}>{equipmentTypeField}</GridItem>
            </Grid>
            <Grid container sx={unscrollableDialogStyles.scrollableContent}>
                <GridItem size={12}>{formulasField}</GridItem>
            </Grid>
        </Box>
    );
};

export default ByFormulaForm;
