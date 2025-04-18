/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    AUTOMATON,
    B0,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    MAX_Q_AT_NOMINAL_V,
    MAX_Q_AUTOMATON,
    MAX_S_AUTOMATON,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_Q_AUTOMATON,
    MIN_S_AUTOMATON,
    MIN_SUSCEPTANCE,
    Q0,
    SETPOINTS_LIMITS,
} from 'components/utils/field-constants';
import { FloatInput } from '@gridsuite/commons-ui';
import { ReactivePowerAdornment, SusceptanceAdornment } from '../../../dialog-utils';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { InputAdornment, Grid, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import GridItem from '../../../commons/grid-item';

export const SusceptanceArea = () => {
    const id = AUTOMATON;
    const { setValue } = useFormContext();
    const watchChoiceAutomaton = useWatch({ name: `${SETPOINTS_LIMITS}.${CHARACTERISTICS_CHOICE}` });
    const minS = useWatch({ name: `${SETPOINTS_LIMITS}.${MIN_SUSCEPTANCE}` });
    const maxS = useWatch({ name: `${SETPOINTS_LIMITS}.${MAX_SUSCEPTANCE}` });
    const minQ = useWatch({ name: `${SETPOINTS_LIMITS}.${MIN_Q_AT_NOMINAL_V}` });
    const maxQ = useWatch({ name: `${SETPOINTS_LIMITS}.${MAX_Q_AT_NOMINAL_V}` });
    // CHARACTERISTICS_CHOICE_AUTOMATON used only to validate the schema (work around)
    useEffect(() => {
        setValue(`${id}.${CHARACTERISTICS_CHOICE_AUTOMATON}`, watchChoiceAutomaton);
        setValue(`${id}.${MIN_Q_AUTOMATON}`, minQ);
        setValue(`${id}.${MAX_Q_AUTOMATON}`, maxQ);
        setValue(`${id}.${MIN_S_AUTOMATON}`, minS);
        setValue(`${id}.${MAX_S_AUTOMATON}`, maxS);
    }, [setValue, id, watchChoiceAutomaton, minQ, maxQ, maxS, minS]);

    const minSusceptanceField = (
        <TextField
            value={minS}
            label={<FormattedMessage id={'minSusceptance'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">S</InputAdornment>,
            }}
        />
    );

    const maxSusceptanceField = (
        <TextField
            value={maxS}
            label={<FormattedMessage id={'maximumSusceptance'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">S</InputAdornment>,
            }}
        />
    );

    const minQAtNominalVField = (
        <TextField
            value={minQ}
            label={<FormattedMessage id={'minQAtNominalV'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">MVar</InputAdornment>,
            }}
        />
    );

    const maxQAtNominalVField = (
        <TextField
            value={maxQ}
            label={<FormattedMessage id={'maxQAtVnominal'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">MVar</InputAdornment>,
            }}
        />
    );

    const susceptanceField = <FloatInput name={`${id}.${B0}`} label="b0" adornment={SusceptanceAdornment} />;

    const qAtNominalVField = (
        <FloatInput name={`${id}.${Q0}`} label="fixQAtNominalV" adornment={ReactivePowerAdornment} />
    );

    return (
        <Grid container spacing={2} padding={2}>
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                <>
                    <GridItem size={4}>{minSusceptanceField}</GridItem>
                    <GridItem size={3}>{susceptanceField}</GridItem>
                    <GridItem size={4}>{maxSusceptanceField}</GridItem>
                </>
            )}
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                <>
                    <GridItem size={4}>{minQAtNominalVField}</GridItem>
                    <GridItem size={3}>{qAtNominalVField}</GridItem>
                    <GridItem size={4}>{maxQAtNominalVField}</GridItem>
                </>
            )}
        </Grid>
    );
};
