/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ElementType } from '@gridsuite/commons-ui';
import { DialogContent } from '@mui/material';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    FIXED_GENERATORS,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
} from 'components/utils/field-constants';
import React from 'react';
import { ParameterType, ParamLine } from '../widget';

const EquipmentSelectionParameters = () => {
    return (
        <DialogContent>
            <ParamLine
                type={ParameterType.DirectoryItems}
                param_name_id={null}
                name={FIXED_GENERATORS}
                equipmentTypes={[EQUIPMENT_TYPES.GENERATOR]}
                elementType={ElementType.FILTER}
                label={'FixedGenerators'}
                hideErrorMessage={true}
            />
            <ParamLine
                type={ParameterType.DirectoryItems}
                param_name_id={null}
                name={VARIABLE_TRANSFORMERS}
                equipmentTypes={[EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]}
                elementType={ElementType.FILTER}
                label={'VariableTransformers'}
                hideErrorMessage={true}
            />
            <ParamLine
                type={ParameterType.DirectoryItems}
                param_name_id={null}
                name={VARIABLE_SHUNT_COMPENSATORS}
                equipmentTypes={[EQUIPMENT_TYPES.SHUNT_COMPENSATOR]}
                elementType={ElementType.FILTER}
                label={'VariableShuntCompensators'}
                hideErrorMessage={true}
            />
        </DialogContent>
    );
};

export default EquipmentSelectionParameters;
