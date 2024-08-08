/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import CheckboxSelect from '../common/checkbox-select';
import CheckboxTreeview from '../common/checkbox-treeview';
import { lighten } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import { fetchDynamicSimulationModels } from '../../../../../../services/study/dynamic-simulation';
import { Box } from '@mui/system';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';

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
                        [variablesSet.name]: variablesSet.variableDefinitions.reduce(
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

const makeGetModelLabel = (intl) => (value) =>
    intl.formatMessage({
        id: `models.${value}`,
    });

const makeGetVariableLabel = (intl) => (elem) => {
    if (!elem.parentId) {
        // root element => that is model element in the variable tree
        return intl.formatMessage({ id: `models.${elem.name}` });
    }

    // either a variable set element or variable element in the variable tree
    if (elem.variableId) {
        // that is a variable element
        return intl.formatMessage({
            id: `variables.${elem.name}`,
        });
    }

    // must be a variable set element
    return intl.formatMessage({
        id: `variableSets.${elem.name}`,
    });
};

const styles = {
    tree: (theme) => ({
        width: '100%',
        height: '100%',
        border: 'solid',
        borderWidth: '.5px',
        borderColor: lighten(theme.palette.background.paper, 0.5),
        overflow: 'auto',
    }),
    model: {
        width: '100%',
    },
    modelTitle: (theme) => ({
        marginBottom: theme.spacing(1),
    }),
    variable: {
        width: '100%',
        flexGrow: 1,
    },
    variableTree: {
        maxHeight: '440px',
        maxWidth: '50px',
    },
};

const ModelFilter = forwardRef(({ equipmentType = EQUIPMENT_TYPES.GENERATOR }, ref) => {
    const intl = useIntl();

    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const [allModels, setAllModels] = useState([]);
    const [allVariables, setAllVariables] = useState({}); // a variables tree

    const variablesRef = useRef();

    // --- models CheckboxSelect --- //
    const associatedModels = useMemo(() => {
        const associatedModels = allModels?.filter((model) => model.equipmentType === equipmentType);
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
    }, [equipmentType, allModels]);
    const initialSelectedModels = useMemo(() => Object.keys(associatedModels) ?? [], [associatedModels]);

    const [selectedModels, setSelectedModels] = useState([]);
    const handleModelChange = useCallback((selectedModels) => {
        setSelectedModels(selectedModels);
    }, []);

    useEffect(() => {
        setSelectedModels(initialSelectedModels);
    }, [initialSelectedModels]);

    // --- variables array CheckboxTreeview --- //
    const variables = useMemo(() => variablesTreeToVariablesArray(allVariables), [allVariables]);

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
        fetchDynamicSimulationModels(studyUuid, currentNode.id).then((models) => {
            setAllModels(
                models.map((model) => ({
                    name: model.modelName,
                    equipmentType: model.equipmentType,
                }))
            );

            // transform models to variables tree representation
            const variablesTree = modelsToVariablesTree(models);
            setAllVariables(variablesTree);
        });
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
                            (item, index, arr) => arr.findIndex((elem) => elem.variableId === item.variableId) === index
                        ); // remove duplicated by variableId
                },
            },
        }),
        []
    );

    const getModelLabel = useMemo(() => {
        return makeGetModelLabel(intl);
    }, [intl]);

    const getVariableLabel = useMemo(() => {
        return makeGetVariableLabel(intl);
    }, [intl]);

    return (
        <>
            {/* Models used in a mapping */}
            <Grid item container sx={styles.model}>
                <Grid item xs={6}>
                    <Typography>
                        <FormattedMessage id={'DynamicSimulationCurveModel'}></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <CheckboxSelect
                        options={initialSelectedModels}
                        getOptionLabel={getModelLabel}
                        value={initialSelectedModels}
                        onChange={handleModelChange}
                        disabled={initialSelectedModels.length === 1 /* disabled if only one model to choose */}
                    />
                </Grid>
            </Grid>
            {/* Variables which found in models used in a mapping */}
            <Grid item sx={styles.variable} container direction={'column'}>
                <Grid item>
                    <Typography sx={styles.modelTitle} variant="subtitle1">
                        <FormattedMessage id={'DynamicSimulationCurveVariable'}></FormattedMessage>
                    </Typography>
                </Grid>
                <Grid item xs>
                    <Box sx={styles.tree}>
                        <CheckboxTreeview
                            ref={variablesRef}
                            data={filteredVariables}
                            getLabel={getVariableLabel}
                            checkAll
                            sx={styles.variableTree}
                        />
                    </Box>
                </Grid>
            </Grid>
        </>
    );
});

export default ModelFilter;
