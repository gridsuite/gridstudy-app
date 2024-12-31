/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, SxProps, Theme } from '@mui/material';
import { CancelButton, CustomFormProvider, SubmitButton, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { AppState } from 'redux/reducer';
import { ExpandableInput } from '../../utils/rhf-inputs/expandable-input';
import GridItem from '../../dialogs/commons/grid-item';
import {
    customColumnNodesFormSchema,
    initialCustomColumnNodesForm,
    NODES_ALIASES,
} from './custom-columns-nodes-form-utils';
import NodeAliasCreation from './custom-column-nodes-form';
import { setUpdateCustomColumDefinitions, updateCustomColumnsNodesAliases } from '../../../redux/actions';

export type CustomColumnNodesDialogProps = {
    open: UseStateBooleanReturn;
    customColumnsDefinitions?: ColumnWithFormula[];
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '55%',
        maxWidth: 'none',
        margin: 'auto',
    },
    columnDescription: { width: '95%', marginTop: '20px', marginBottom: '20px' },
    field: { width: '70%' },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies Record<string, SxProps<Theme>>;

export default function CustomColumnNodesDialog({ open }: Readonly<CustomColumnNodesDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialCustomColumnNodesForm,
        resolver: yupResolver(customColumnNodesFormSchema),
    });

    const dispatch = useDispatch<AppDispatch>();

    const intl = useIntl();

    const customColumnsNodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);
    const allCustomColumnsDefinitions = useSelector((state: AppState) => state.tables.allCustomColumnsDefinitions);
    const allCustomColumnsDefinitionsRef = useRef();
    allCustomColumnsDefinitionsRef.current = allCustomColumnsDefinitions;

    const variationsField = (
        <ExpandableInput
            name={NODES_ALIASES}
            Field={NodeAliasCreation}
            addButtonLabel={'spreadsheet/custom_column/add_alias'}
            initialValue={initialCustomColumnNodesForm}
            alignItems="center"
        />
    );

    const onValidate = (data) => {
        open.setFalse();
        let nodesAliases = data.nodesAliases.map((nodeAlias) => {
            return { id: nodeAlias.nodeInfo.nodeId, name: nodeAlias.nodeInfo.nodeName, alias: nodeAlias.alias };
        });
        dispatch(updateCustomColumnsNodesAliases(nodesAliases));
    };

    useEffect(() => {
        //TODO: this could be improved by dispatching only once with all the formulas updated
        //if we updated the aliases we need to recheck all custom columns
        let formulaForEval: string | null = null;
        const nodesAliases: string[] = customColumnsNodesAliases.map((nodeAlias) => nodeAlias.alias);
        const pattern: string = nodesAliases.map((nodeAlias) => `\\b${nodeAlias}\\b\\.`).join('|'); // pattern to find the aliases in the expression
        const regex = new RegExp(pattern, 'g');

        Object.entries(allCustomColumnsDefinitionsRef.current).forEach((customDefinitions) => {
            customDefinitions[1].columns.forEach((colWithFormula) => {
                formulaForEval = colWithFormula.formula.replace(regex, (match) => {
                    // Find the corresponding alias and return its replacement
                    const matchedAlias = customColumnsNodesAliases.find((nodeAlias) =>
                        match.startsWith(nodeAlias.alias)
                    );
                    return matchedAlias ? matchedAlias.name + '.' : match;
                });
                dispatch(
                    setUpdateCustomColumDefinitions(customDefinitions[0], {
                        id: colWithFormula.id,
                        name: colWithFormula.name,
                        formula: colWithFormula.formula,
                        formulaForEval: formulaForEval,
                    })
                );
            });
        });
    }, [dispatch, customColumnsNodesAliases, allCustomColumnsDefinitionsRef]);

    return (
        <CustomFormProvider validationSchema={customColumnNodesFormSchema} {...formMethods}>
            <Dialog
                id="custom-column-nodes-dialog-edit"
                open={open.value}
                onClose={open.setFalse}
                aria-labelledby="custom-column-dialog-edit-title"
                PaperProps={{ sx: styles.dialogContent }}
            >
                <DialogTitle id="custom-column-dialog-edit-title">
                    {intl.formatMessage({
                        id: 'spreadsheet/custom_column/parameter_nodes',
                    })}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container>
                        <GridItem size={12}>{variationsField}</GridItem>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={0.5}>
                        <Grid item xs>
                            <Box sx={styles.actionButtons}>
                                <CancelButton onClick={open.setFalse} />
                                <SubmitButton onClick={formMethods.handleSubmit(onValidate)} variant="outlined" />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
}
