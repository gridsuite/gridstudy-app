/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RadioInput } from '@gridsuite/commons-ui';
import { ACTIVE_VARIATION_MODES, VARIATION_TYPES } from 'components/network/constants';
import { VARIATION_TYPE, VARIATIONS } from 'components/utils/field-constants';
import VariationForm from './variation/variation-form';
import { ExpandableInput } from 'components/utils/rhf-inputs/expandable-input';
import { Grid } from '@mui/material';
import { getVariationEmptyForm } from './variation/variation-utils';
import GridItem from '../../commons/grid-item';
import GridSection from '../../commons/grid-section';

const styles = {
    padding: (theme) => ({
        paddingLeft: theme.spacing(2),
    }),
};

const LoadScalingForm = () => {
    const variationTypeField = <RadioInput name={VARIATION_TYPE} options={Object.values(VARIATION_TYPES)} />;

    const variationsField = (
        <ExpandableInput
            name={VARIATIONS}
            Field={VariationForm}
            addButtonLabel={'CreateVariation'}
            initialValue={getVariationEmptyForm(ACTIVE_VARIATION_MODES.PROPORTIONAL.id)}
        />
    );

    return (
        <>
            <Grid sx={styles.padding}>
                <GridItem size={8}>{variationTypeField}</GridItem>{' '}
            </Grid>

            <GridSection title="Variations" />
            <Grid container sx={styles.padding}>
                <GridItem size={12}>{variationsField}</GridItem>
            </Grid>
        </>
    );
};

export default LoadScalingForm;
