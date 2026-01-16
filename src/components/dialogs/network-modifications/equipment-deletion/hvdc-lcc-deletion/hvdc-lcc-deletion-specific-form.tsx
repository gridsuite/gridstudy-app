/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    DELETION_SPECIFIC_DATA,
    SHUNT_COMPENSATOR_SIDE_1,
    SHUNT_COMPENSATOR_SIDE_2,
} from 'components/utils/field-constants';
import { useFieldArray } from 'react-hook-form';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';
import ShuntCompensatorSelectionForm from './shunt-compensator-selection-form';

export default function HvdcLccDeletionSpecificForm() {
    const { fields: mcsRows1 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_1}`,
    });
    const { fields: mcsRows2 } = useFieldArray({
        name: `${DELETION_SPECIFIC_DATA}.${SHUNT_COMPENSATOR_SIDE_2}`,
    });

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
}
