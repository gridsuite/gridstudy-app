/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { ExpandableInput } from '../../../../utils/rhf-inputs/expandable-input';
import { ADDITIONAL_PROPERTIES, PREDEFINED } from '../../../../utils/field-constants';
import PropertyForm from './property-form';
import { initializedProperty } from './property-utils';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

const PropertiesForm = () => {
    const { getValues } = useFormContext();
    const disabledDeletion = useCallback(
        (idx: number) => {
            const properties = getValues(`${ADDITIONAL_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return properties[idx][PREDEFINED];
            }
            return false;
        },
        [getValues]
    );

    const additionalProps = (
        <ExpandableInput
            name={ADDITIONAL_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={initializedProperty()}
            disabledDeletion={disabledDeletion}
        />
    );

    return <Grid container>{additionalProps}</Grid>;
};

export default PropertiesForm;
