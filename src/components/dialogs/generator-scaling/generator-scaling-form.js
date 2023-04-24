/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RadioInput from '../../rhf-inputs/radio-input';
import { VARIATION_MODES, VARIATION_TYPES } from '../../network/constants';
import { VARIATION_TYPE, VARIATIONS } from '../../util/field-constants';
import VariationForm from './variation/variation-form';
import ExpandableInput from '../../rhf-inputs/expandable-input';
import Grid from '@mui/material/Grid';
import { gridItem, GridSection } from '../dialogUtils';
import makeStyles from '@mui/styles/makeStyles';
import { getVariationEmptyForm } from './variation/variation-utils';

export const useStyles = makeStyles((theme) => ({
    padding: {
        paddingLeft: theme.spacing(2),
    },
}));

const GeneratorScalingForm = () => {
    const classes = useStyles();

    const variationTypeField = (
        <RadioInput
            name={VARIATION_TYPE}
            options={Object.values(VARIATION_TYPES)}
        />
    );

    const variationsField = (
        <ExpandableInput
            name={VARIATIONS}
            Field={VariationForm}
            addButtonLabel={'CreateVariation'}
            initialValue={getVariationEmptyForm(
                VARIATION_MODES.PROPORTIONAL_TO_PMAX.id
            )}
        />
    );

    return (
        <>
            <Grid className={classes.padding}>
                {gridItem(variationTypeField, 8)}
            </Grid>

            <GridSection title="Variations" />
            <Grid container className={classes.padding}>
                {gridItem(variationsField, 12)}
            </Grid>
        </>
    );
};

export default GeneratorScalingForm;
