/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useEffect } from 'react';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EQUIPMENT_TYPE_FIELD, SIMPLE_MODIFICATIONS } from '../../../utils/field-constants';
import ExpandableInput from '../../../utils/rhf-inputs/expandable-input';
import ModificationLineForm from './modification-line/modification-line-form';
import Grid from '@mui/material/Grid';
import { gridItem } from '../../dialogUtils';
import { EQUIPMENTS_FIELDS, getModificationLineInitialValue } from './modification-line/modification-line-utils';
import { useFormContext, useWatch } from 'react-hook-form';
import SelectWithConfirmationInput from '../../commons/select-with-confirmation-input';
import { usePredefinedProperties } from '@gridsuite/commons-ui';

interface ByFormulaFormProps {}

const EQUIPMENT_TYPE_OPTIONS = [
    EQUIPMENT_TYPES.GENERATOR,
    EQUIPMENT_TYPES.BATTERY,
    EQUIPMENT_TYPES.SHUNT_COMPENSATOR,
    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
    EQUIPMENT_TYPES.LOAD,
    EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER,
];

const ByFilterModificationForm: FunctionComponent<ByFormulaFormProps> = () => {
    const { setValue, getValues } = useFormContext();
    const equipmentType = useWatch({
        name: EQUIPMENT_TYPE_FIELD,
    });
    const equipmentFields = EQUIPMENTS_FIELDS?.[equipmentType] ?? [];

    // get predefined properties
    const [predefinedProperties, setEquipmentType] = usePredefinedProperties(equipmentType);
    useEffect(() => {
        setEquipmentType(equipmentType);
    }, [equipmentType, setEquipmentType]);

    const equipmentTypeField = (
        <SelectWithConfirmationInput
            name={EQUIPMENT_TYPE_FIELD}
            label={'EquipmentType'}
            options={EQUIPMENT_TYPE_OPTIONS}
            onValidate={() => {
                setValue(
                    SIMPLE_MODIFICATIONS,
                    getValues(SIMPLE_MODIFICATIONS).map(() => ({
                        ...getModificationLineInitialValue(),
                    }))
                );
            }}
        />
    );

    const modificationLinesField = (
        <ExpandableInput
            name={SIMPLE_MODIFICATIONS}
            Field={ModificationLineForm}
            fieldProps={{
                predefinedProperties,
                equipmentFields,
                equipmentType,
            }}
            addButtonLabel={'addNewModificationLine'}
            initialValue={getModificationLineInitialValue()}
        />
    );

    return (
        <>
            <Grid container paddingTop={'20px'}>
                {gridItem(equipmentTypeField, 2.15)}
            </Grid>
            <Grid container>{gridItem(modificationLinesField, 12)}</Grid>
        </>
    );
};

export default ByFilterModificationForm;
