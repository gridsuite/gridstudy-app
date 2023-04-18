/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { makeStyles, useTheme } from '@mui/styles';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Grid, Typography } from '@mui/material';
import clsx from 'clsx';
import CheckboxSelect from '../common/checkbox-select';
import { EQUIPMENT_TYPES } from './equipment-filter';
import CheckboxTreeview from '../common/checkbox-treeview';
import { lighten } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { fetchDynamicSimulationModels } from '../../../../../../utils/rest-api';

const transformModelsToVariables = (models) => {
    return models.reduce(
        (obj, model) => ({
            ...obj,
            [model.modelName]: model.variableDefinitions.reduce(
                (obj, variable) => ({
                    ...obj,
                    [variable.name]: variable.name,
                }),
                {}
            ),
        }),
        {}
    );
};

const flatteningObject = (variables, parentId) => {
    let result = [];
    Object.entries(variables).map(([key, value]) => {
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
            result = [...result, ...flatteningObject(value, id)];
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

const useStyles = makeStyles((theme) => ({
    grid: {
        width: '100%',
        height: '100%',
        border: 'solid',
        borderWidth: '.5px',
        borderColor: lighten(theme.palette.background.paper, 0.5),
    },
}));

const ModelFilter = forwardRef(
    ({ equipmentType = EQUIPMENT_TYPES.LOAD }, ref) => {
        const studyUuid = useSelector((state) => state.studyUuid);
        const currentNode = useSelector((state) => state.currentTreeNode);

        const classes = useStyles();
        const theme = useTheme();

        const [allModels, setAllModels] = useState([]);
        const [allVariables, setAllVariables] = useState({});

        const variablesRef = useRef();

        // --- models CheckboxSelect --- //
        const associatedModels = useMemo(() => {
            const associatedModels = allModels?.filter(
                (model) => model.equipmentType === equipmentType.type
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
        }, [equipmentType.type, allModels]);
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
            fetchDynamicSimulationModels(studyUuid, currentNode.id).then(
                (models) => {
                    console.log('Models from dynamic mapping', models);
                    setAllModels(
                        models.map((model) => ({
                            name: model.modelName,
                            equipmentType: model.equipmentType,
                        }))
                    );

                    // transform models to variables representation
                    const variables = transformModelsToVariables(models);
                    console.log('transformed variables', variables);
                    setAllVariables(variables);
                    // to force remount component since it has internal state needed to clear
                    // setVariablesRevision((prev) => ++prev);
                }
            );
        }, [studyUuid, currentNode.id]);

        // expose some interfaces for the component by using ref
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
                            ref={variablesRef}
                            data={filteredVariables}
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
    }
);

export default ModelFilter;
