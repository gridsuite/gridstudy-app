/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import GridItem from '../commons/grid-item';
import { Grid } from '@mui/material';
import { FloatInput } from '@gridsuite/commons-ui';
import { TRANSFORMER_REACTANCE, TRANSIENT_REACTANCE } from '../../utils/field-constants';
import { OhmAdornment } from '../dialog-utils';
import { ShortCircuitInfos } from './short-circuit.type';

export interface ShortCircuitFormProps {
    previousValues?: ShortCircuitInfos;
}

export default function ShortCircuitForm({ previousValues }: ShortCircuitFormProps) {
    const transientReactanceField = (
        <FloatInput
            name={TRANSIENT_REACTANCE}
            label={'TransientReactanceForm'}
            adornment={OhmAdornment}
            previousValue={previousValues?.directTransX ?? undefined}
            clearable={true}
        />
    );

    const transformerReactanceField = (
        <FloatInput
            name={TRANSFORMER_REACTANCE}
            label={'TransformerReactanceForm'}
            adornment={OhmAdornment}
            previousValue={
                !isNaN(Number(previousValues?.stepUpTransformerX))
                    ? (previousValues?.stepUpTransformerX ?? undefined)
                    : undefined
            }
            clearable={true}
        />
    );

    return (
        <Grid container spacing={2}>
            <GridItem size={4}>{transientReactanceField}</GridItem>
            <GridItem size={4}>{transformerReactanceField}</GridItem>
        </Grid>
    );
}
