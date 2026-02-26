/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { TABULAR_PROPERTIES, PREDEFINED } from '../../../../utils/field-constants';
import PropertyForm from './property-form';
import { initializedProperty } from './property-utils';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { ExpandableInput } from '@gridsuite/commons-ui';

const PropertiesForm = () => {
    const { getValues } = useFormContext();

    // predefined properties cannot be removed from the list
    const disabledDeletion = useCallback(
        (idx: number) => {
            const properties = getValues(`${TABULAR_PROPERTIES}`);
            if (properties && typeof properties[idx] !== 'undefined') {
                return properties[idx][PREDEFINED];
            }
            return false;
        },
        [getValues]
    );

    const tabularProps = (
        <ExpandableInput
            name={TABULAR_PROPERTIES}
            Field={PropertyForm}
            addButtonLabel={'AddProperty'}
            initialValue={initializedProperty()}
            disabledDeletion={disabledDeletion}
        />
    );

    return <Grid container>{tabularProps}</Grid>;
};

export default PropertiesForm;
