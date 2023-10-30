/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { SelectInput } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, FORMULAS } from '../../../utils/field-constants';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import FormulaForm from './formula/formula-form';
import Grid from '@mui/material/Grid';
import { gridItem } from '../../dialogUtils';
import { getFormulaInitialValue } from './formula/formula-utils';

interface ByFormulaFormProps {}

const EQUIPMENT_TYPE_OPTIONS = [
    { id: EQUIPMENT_TYPES.GENERATOR, label: EQUIPMENT_TYPES.GENERATOR },
    { id: EQUIPMENT_TYPES.BATTERY, label: EQUIPMENT_TYPES.BATTERY },
];

const ByFormulaForm: FunctionComponent<ByFormulaFormProps> = () => {
    const equipmentTypeField = (
        <SelectInput
            name={EQUIPMENT_TYPE_FIELD}
            label={'EquipmentType'}
            options={EQUIPMENT_TYPE_OPTIONS}
            size={'small'}
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
