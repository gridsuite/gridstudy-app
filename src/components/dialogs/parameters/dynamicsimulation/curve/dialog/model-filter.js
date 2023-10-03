/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import CheckboxSelect from '../common/checkbox-select';
import { CURVE_EQUIPMENTS } from './equipment-filter';
import CheckboxTreeview from '../common/checkbox-treeview';
import { lighten } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import { fetchDynamicSimulationModels } from '../../../../../../services/study/dynamic-simulation';
import { Box } from '@mui/system';

const modelsToVariablesTree = (models) => {
    return models.reduce(
        (obj, model) => ({
            ...obj,
            [model.modelName]: {
                ...model.variableDefinitions.reduce(
                    (obj, variable) => ({
                        ...obj,
                        [variable.name]: variable.name,
                    }),
                    {}
                ),
                ...model.variablesSets.reduce(
                    (obj, variablesSet) => ({
                        ...obj,
                        [variablesSet.name]:
                            variablesSet.variableDefinitions.reduce(
                                (obj, variable) => ({
                                    ...obj,
                                    [variable.name]: variable.name,
                                }),
                                {}
                            ),
                    }),
                    {}
                ),
            },
        }),
        {}
    );
};

const variablesTreeToVariablesArray = (variablesTree, parentId) => {
    let result = [];
    Object.entries(variablesTree).map(([key, value]) => {
        const id = parentId ? `${parentId}/${key}` : key;
        if (typeof value === 'object') {
            // make container element
            result = [
                ...result,
                {
                    id: id,
                    name: key,
                    parentId: parentId,
                },
            ];
            // make contained elements
            result = [...result, ...variablesTreeToVariablesArray(value, id)];
        }
        if (typeof value === 'string') {
            result = [
                ...result,
                {
                    id: id,
                    name: value,
                    parentId: parentId,
                    variableId: key,
                },
            ];
        }
        return result;
    });

    return result;
};

const styles = {
    grid: (theme) => ({
        width: '100%',
        height: '100%',
        border: 'solid',
        borderWidth: '.5px',
        borderColor: lighten(theme.palette.background.paper, 0.5),
        overflow: 'auto',
    }),
};

const ModelFilter = forwardRef(({ equipment = CURVE_EQUIPMENTS.LOAD }, ref) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const theme = useTheme();

    const [allModels, setAllModels] = useState([]);
    const [allVariables, setAllVariables] = useState({}); // a variables tree

    const variablesRef = useRef();

    // --- models CheckboxSelect --- //
    const associatedModels = useMemo(() => {
        const associatedModels = allModels?.filter(
            (model) => model.equipmentType === equipment.type
        );
        // convert array to object
        return associatedModels
            ? associatedModels.reduce(
                  (obj, model) => ({
                      ...obj,
                      [model.name]: model.name,
                  }),
                  {}
              )
            : {};
    }, [equipment.type, allModels]);
    const initialSelectedModels = useMemo(
        () => Object.keys(associatedModels) ?? [],
        [associatedModels]
    );

    const [selectedModels, setSelectedModels] = useState([]);
    const handleModelChange = useCallback((selectedModels) => {
        setSelectedModels(selectedModels);
    }, []);

    useEffect(() => {
        setSelectedModels(initialSelectedModels);
    }, [initialSelectedModels]);

    // --- variables array CheckboxTreeview --- //
    const variables = useMemo(
        () => variablesTreeToVariablesArray(allVariables),
        [allVariables]
    );

    const filteredVariables = useMemo(
        () =>
            variables.filter((elem) =>
                selectedModels.some((model) => {
                    return elem.id.includes(associatedModels[model]);
                })
            ),
        [variables, selectedModels, associatedModels]
    );

    // fetch all associated models and variables for current node and study
    useEffect(() => {
        fetchDynamicSimulationModels(studyUuid, currentNode.id).then(
            (models) => {
                setAllModels(
                    models.map((model) => ({
                        name: model.modelName,
                        equipmentType: model.equipmentType,
                    }))
                );

                // transform models to variables tree representation
                const variablesTree = modelsToVariablesTree(models);
                setAllVariables(variablesTree);
            }
        );
    }, [studyUuid, currentNode.id]);

    // expose some api for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            api: {
                getSelectedVariables: () => {
                    return variablesRef.current.api
                        .getSelectedItems()
                        .filter((item) => item.variableId) // filter to keep only variable item
                        .filter(
                            (item, index, arr) =>
                                arr.findIndex(
                                    (elem) =>
                                        elem.variableId === item.variableId
                                ) === index
                        ); // remove duplicated by variableId
                },
            },
        }),
        []
    );

    return (
        <>
            {/* Models used in a mapping */}
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
            {/* Variables which found in models used in a mapping */}
            <Grid item xs sx={{ width: '100%' }} container direction={'column'}>
                <Grid>
                    <Typography
                        sx={{ marginBottom: theme.spacing(1) }}
                        variant="subtitle1"
                    >
                        <FormattedMessage
                            id={'DynamicSimulationCurveVariable'}
                        ></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid xs>
                    <Box sx={styles.grid}>
                        <CheckboxTreeview
                            ref={variablesRef}
                            data={filteredVariables}
                            checkAll
                            sx={{
                                maxHeight: '440px',
                                maxWidth: '50px',
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
});

export default ModelFilter;
