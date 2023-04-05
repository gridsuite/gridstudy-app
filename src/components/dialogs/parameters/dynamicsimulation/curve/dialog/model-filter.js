/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { makeStyles, useTheme } from '@mui/styles';
import React, { useCallback, useMemo, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import clsx from 'clsx';
import CheckboxSelect from '../common/checkbox-select';
import { EQUIPMENT_TYPE } from './equipment-filter';
import CheckboxTreeview from '../common/checkbox-treeview';
import { lighten } from '@mui/material/styles';

// take from table models in DB dynamicmappings
const MODELS = {
    // EQUIPMENT_TYPE.LOAD
    [EQUIPMENT_TYPE.LOAD]: {
        LoadAlphaBeta: 'Load Alpha Beta',
        LoadPQ: 'Load PQ',
    },
    // EQUIPMENT_TYPE.GENERATOR
    [EQUIPMENT_TYPE.GENERATOR]: {
        GeneratorSynchronousThreeWindings:
            'Generator Synchronous Three Windings',
        GeneratorSynchronousFourWindings: 'Generator Synchronous Four Windings',
        GeneratorSynchronousThreeWindingsProportionalRegulations:
            'Generator Synchronous Three Windings Proportional Regulations',
        GeneratorSynchronousFourWindingsProportionalRegulations:
            'Generator Synchronous Four Windings Proportional Regulations',
        GeneratorPQ: 'Generator PQ',
        GeneratorPV: 'Generator PV',
    },
};

const VARIABLES = {
    // EQUIPMENT_TYPE.LOAD
    // LoadAlphaBeta
    [MODELS[EQUIPMENT_TYPE.LOAD].LoadAlphaBeta]: {
        load_alpha: 'Load Alpha',
        load_beta: 'Load Beta',
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // LoadPQ
    [MODELS[EQUIPMENT_TYPE.LOAD].LoadPQ]: {
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // EQUIPMENT_TYPE.GENERATOR
    // GeneratorSynchronousThreeWindings
    [MODELS[EQUIPMENT_TYPE.GENERATOR].GeneratorSynchronousThreeWindings]: {
        generator_UNom: 'Generator UNom',
        generator_SNom: 'Generator SNom',
        generator_PNomTurb: 'Generator PNom Turb',
        generator_PNomAlt: 'Generator PNom Alt',
    },
    // GeneratorSynchronousFourWindings
    [MODELS[EQUIPMENT_TYPE.GENERATOR].GeneratorSynchronousFourWindings]: {
        generator_UNom: 'Generator UNom',
        generator_SNom: 'Generator SNom',
        generator_PNomTurb: 'Generator PNom Turb',
        generator_PNomAlt: 'Generator PNom Alt',
    },
};

const flatteningObject = (variables, parentId) => {
    let result = [];
    Object.entries(variables).map(([key, value]) => {
        if (typeof value === 'object') {
            // make container element
            result = [...result, { id: key, name: key }];
            // make contained elements
            result = [...result, ...flatteningObject(value, key)];
        }
        if (typeof value === 'string') {
            result = [
                ...result,
                {
                    id: parentId ? `${parentId}/${key}` : key,
                    name: value,
                    parentId: parentId,
                },
            ];
        }
        return result;
    });

    return result;
};

const useStyles = makeStyles((theme) => ({
    grid: {
        width: '100%',
        height: '100%',
        border: 'solid',
        borderWidth: '.5px',
        borderColor: lighten(theme.palette.background.paper, 0.5),
    },
}));

const ModelFilter = ({ equipmentType = EQUIPMENT_TYPE.LOAD }) => {
    const classes = useStyles();
    const theme = useTheme();

    // --- models CheckboxSelect --- //
    const filteredOptions = MODELS[equipmentType] ?? {};
    const initialOptions = Object.keys(filteredOptions) ?? [];

    const [variablesRevision, setVariablesRevision] = useState(0);
    const [models, setModels] = useState(initialOptions);
    const handleModelChange = useCallback((selectedOptions) => {
        setModels(selectedOptions);
        // to force remount component since it has internal state needed to clear
        setVariablesRevision((prev) => ++prev);
    }, []);

    // --- variables CheckboxTreeview --- //
    const data = useMemo(() => flatteningObject(VARIABLES), []);
    const getRoot = useCallback(
        (item) => {
            const parent = data.find((elem) => elem.id === item.parentId);
            if (parent) {
                return getRoot(parent);
            } else {
                return item;
            }
        },
        [data]
    );
    const filteredData = useMemo(
        () =>
            data.filter((elem) =>
                models.some((model) => {
                    return elem.id.includes(filteredOptions[model]);
                })
            ),
        [data, models, filteredOptions]
    );

    return (
        <>
            {/* Equipment type */}
            <Grid item container sx={{ width: '100%' }}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage
                            id={'DynamicSimulationCurveModel'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <CheckboxSelect
                        options={initialOptions}
                        getOptionLabel={(value) => filteredOptions[value]}
                        value={[...initialOptions]}
                        onChange={handleModelChange}
                    />
                </Grid>
            </Grid>
            <Grid item sx={{ width: '100%' }}>
                <Typography
                    sx={{ marginBottom: theme.spacing(1) }}
                    variant="subtitle1"
                >
                    <FormattedMessage
                        id={'DynamicSimulationCurveVariable'}
                    ></FormattedMessage>
                </Typography>
                <div className={clsx([theme.aggrid, classes.grid])}>
                    <CheckboxTreeview
                        key={`variables-${variablesRevision}`}
                        data={filteredData}
                        checkAll
                        sx={{
                            height: '480px',
                            maxWidth: '500px',
                            flexGrow: 1,
                            overflow: 'auto',
                        }}
                    />
                </div>
            </Grid>
        </>
    );
};

export default ModelFilter;
