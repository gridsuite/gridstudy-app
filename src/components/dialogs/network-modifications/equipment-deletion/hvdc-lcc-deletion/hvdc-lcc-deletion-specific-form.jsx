/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { CheckboxInput } from '@gridsuite/commons-ui';
import ReadOnlyInput from 'components/utils/rhf-inputs/read-only/read-only-input';
import {
    SHUNT_COMPENSATOR_SELECTED,
    ID,
    DELETION_SPECIFIC_DATA,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
} from 'components/utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { useFieldArray } from 'react-hook-form';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';

const HvdcLccDeletionSpecificForm = () => {
    const { fields: mcsRows1 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_1}`,
    });
    const { fields: mcsRows2 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_2}`,
    });

    const ShuntCompensatorSelectionForm = ({ title, arrayFormName, mcsRows }) => {
        return (
            <Grid item container spacing={1} direction="column">
                <Grid item>
                    <h4>
                        <FormattedMessage id={title} />
                    </h4>
                </Grid>
                {mcsRows.map((field, index) => (
                    <Grid container spacing={1} alignItems="center" key={field.id}>
                        <Grid item xs={1} align={'start'}>
                            <CheckboxInput
                                key={field.id + 'SEL'}
                                name={`${arrayFormName}[${index}].${SHUNT_COMPENSATOR_SELECTED}`}
                            />
                        </Grid>
                        <Grid item xs={11} align={'start'}>
                            <ReadOnlyInput key={field.id + 'ID'} name={`${arrayFormName}[${index}].${ID}`} />
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const mcsOnsideOne = (
        <ShuntCompensatorSelectionForm
            title="Side1"
            arrayFormName={`${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_1}`}
            mcsRows={mcsRows1}
        />
    );

    const mcsOnsideTwo = (
        <ShuntCompensatorSelectionForm
            title="Side2"
            arrayFormName={`${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_2}`}
            mcsRows={mcsRows2}
        />
    );

    return (
        <Grid container spacing={1} direction="column" paddingTop={2} paddingLeft={1}>
            <GridSection title="LCCConverterStationShuntCompensators" />
            <Grid container spacing={1}>
                <GridItem>{mcsOnsideOne}</GridItem>
                <GridItem>{mcsOnsideTwo}</GridItem>
            </Grid>
        </Grid>
    );
};

export default HvdcLccDeletionSpecificForm;
