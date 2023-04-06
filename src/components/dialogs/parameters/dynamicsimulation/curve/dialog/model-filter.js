/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { makeStyles, useTheme } from '@mui/styles';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import clsx from 'clsx';
import CheckboxSelect from '../common/checkbox-select';
import { EQUIPMENT_TYPES } from './equipment-filter';
import CheckboxTreeview from '../common/checkbox-treeview';
import { lighten } from '@mui/material/styles';
import { useSelector } from 'react-redux';

// take from table models in DB dynamicmappings
const MODELS = {
    // EQUIPMENT_TYPES.LOAD
    [EQUIPMENT_TYPES.LOAD.type]: {
        LoadAlphaBeta: 'Load Alpha Beta',
        LoadPQ: 'Load PQ',
    },
    // EQUIPMENT_TYPES.GENERATOR
    [EQUIPMENT_TYPES.GENERATOR.type]: {
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
    // EQUIPMENT_TYPES.LOAD
    // LoadAlphaBeta
    [MODELS[EQUIPMENT_TYPES.LOAD.type].LoadAlphaBeta]: {
        load_alpha: 'Load Alpha',
        load_beta: 'Load Beta',
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // LoadPQ
    [MODELS[EQUIPMENT_TYPES.LOAD.type].LoadPQ]: {
        load_P0Pu: 'Load P0Pu',
        load_Q0Pu: 'Load Q0Pu',
        load_U0Pu: 'Load U0Pu',
        load_UPhase0: 'Load UPhase0',
    },
    // EQUIPMENT_TYPES.GENERATOR
    // GeneratorSynchronousThreeWindings
    [MODELS[EQUIPMENT_TYPES.GENERATOR.type].GeneratorSynchronousThreeWindings]:
        {
            generator_UNom: 'Generator UNom',
            generator_SNom: 'Generator SNom',
            generator_PNomTurb: 'Generator PNom Turb',
            generator_PNomAlt: 'Generator PNom Alt',
        },
    // GeneratorSynchronousFourWindings
    [MODELS[EQUIPMENT_TYPES.GENERATOR.type].GeneratorSynchronousFourWindings]: {
        generator_UNom: 'Generator UNom',
        generator_SNom: 'Generator SNom',
        generator_PNomTurb: 'Generator PNom Turb',
        generator_PNomAlt: 'Generator PNom Alt',
    },
};

// fake API fetchDynamicSimulationModelsParameters
const fetchDynamicSimulationModelsVariables = (studyUuid, nodeUuid) => {
    console.info(
        `Fetching dynamic simulation models and variables sets on '${studyUuid}' and node '${nodeUuid}' ...`
    );

    return Promise.resolve({ models: MODELS, variables: VARIABLES });
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

const ModelFilter = ({ equipmentType = EQUIPMENT_TYPES.LOAD }) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const classes = useStyles();
    const theme = useTheme();

    const [allModels, setAllModels] = useState({});
    const [allVariables, setAllVariables] = useState({});

    // --- models CheckboxSelect --- //
    const associatedModels = useMemo(
        () => allModels[equipmentType.type] ?? {},
        [equipmentType.type, allModels]
    );
    const initialSelectedModels = useMemo(
        () => Object.keys(associatedModels) ?? [],
        [associatedModels]
    );

    // const [variablesRevision, setVariablesRevision] = useState(0);
    const [selectedModels, setSelectedModels] = useState([]);
    const handleModelChange = useCallback((selectedModels) => {
        setSelectedModels(selectedModels);
    }, []);

    useEffect(() => {
        setSelectedModels(initialSelectedModels);
    }, [initialSelectedModels]);

    // --- variables CheckboxTreeview --- //
    const variables = useMemo(
        () => flatteningObject(allVariables),
        [allVariables]
    );

    // TODO remove
    console.log('variables', variables);

    console.log('models', selectedModels);
    const filteredVariables = useMemo(
        () =>
            variables.filter((elem) =>
                selectedModels.some((model) => {
                    return elem.id.includes(associatedModels[model]);
                })
            ),
        [variables, selectedModels, associatedModels]
    );
    console.log('filteredVariables', filteredVariables);

    // fetch all associated models and variables for current node and study
    useEffect(() => {
        setTimeout(() => {
            fetchDynamicSimulationModelsVariables(
                studyUuid,
                currentNode.id
            ).then(({ models, variables }) => {
                setAllModels(models);
                setAllVariables(variables);

                // to force remount component since it has internal state needed to clear
                // setVariablesRevision((prev) => ++prev);
            });
        }, 500);
    }, [studyUuid, currentNode.id]);

    const handleVariableSelectionChanged = useCallback((selectedItems) => {
        const selectedVariables = [...selectedItems];
        console.log('Items selected', selectedVariables);
    }, []);

    return (
        <>
            {/* Associated models */}
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
                        options={initialSelectedModels}
                        getOptionLabel={(value) => associatedModels[value]}
                        value={initialSelectedModels}
                        onChange={handleModelChange}
                    />
                </Grid>
            </Grid>
            {/* Variables (also called parameters in dynamic mapping) */}
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
                        data={filteredVariables}
                        checkAll
                        sx={{
                            height: '480px',
                            maxWidth: '500px',
                            flexGrow: 1,
                            overflow: 'auto',
                        }}
                        onSelectionChanged={handleVariableSelectionChanged}
                    />
                </div>
            </Grid>
        </>
    );
};

export default ModelFilter;
