/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, FORMULAS } from '../../../utils/field-constants';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import FormulaForm from './formula/formula-form';
import Grid from '@mui/material/Grid';
import { gridItem } from '../../dialogUtils';
import { getFormulaInitialValue } from './formula/formula-utils';
import { useFormContext } from 'react-hook-form';
import SelectWithConfirmationInput from './select-with-confirmation-input';

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
        <>
            <Grid container paddingTop={'20px'}>
                {gridItem(equipmentTypeField, 2.15)}
            </Grid>
            <Grid container>{gridItem(formulasField, 12)}</Grid>
        </>
    );
};

export default ByFormulaForm;
