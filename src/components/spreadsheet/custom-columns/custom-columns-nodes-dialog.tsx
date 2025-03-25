/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import { CancelButton, CustomFormProvider, SubmitButton, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState, CurrentTreeNode } from 'redux/reducer';
import {
    CustomColumnNodesForm,
    customColumnNodesFormSchema,
    initialCustomColumnNodesForm,
    NODES_ALIASES,
} from './custom-columns-nodes-form-utils';
import NodeAliasTable from './node-alias-table';
import { UUID } from 'crypto';
import { NodeAlias } from './node-alias.type';

export type CustomColumnNodesDialogProps = {
    open: UseStateBooleanReturn;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (newNodeAliases: NodeAlias[]) => void;
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '55%',
        maxWidth: 'none',
        margin: 'auto',
    },
    field: { width: '70%' },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
};

const toCustomColumnNodesDialogFormValues = (nodeAliases: NodeAlias[]) => {
    return { [NODES_ALIASES]: nodeAliases };
};

export default function CustomColumnNodesDialog({
    open,
    nodeAliases,
    updateNodeAliases,
}: Readonly<CustomColumnNodesDialogProps>) {
    const intl = useIntl();

    const formMethods = useForm<CustomColumnNodesForm>({
        defaultValues: initialCustomColumnNodesForm,
        resolver: yupResolver(customColumnNodesFormSchema),
    });

    const treeModel = useSelector((state: AppState) => state.networkModificationTreeModel);
    const nodes = useMemo(
        () =>
            treeModel?.treeNodes.map((currentTreeNode: CurrentTreeNode) => {
                return { name: currentTreeNode.data.label, id: currentTreeNode.id };
            }) ?? [],
        [treeModel]
    );

    const { reset, handleSubmit } = formMethods;

    const onValidate = (data: CustomColumnNodesForm) => {
        onClose();
        const completeData: NodeAlias[] = data.nodesAliases.map((nodeAlias) => {
            const id = nodes.find((node) => node.name === nodeAlias.name)?.id as UUID;
            return { id: id, name: nodeAlias.name, alias: nodeAlias.alias };
        });
        updateNodeAliases(completeData);
    };

    const onClose = () => {
        open.setFalse();
        reset(initialCustomColumnNodesForm);
    };

    useEffect(() => {
        if (open.value && nodeAliases && nodeAliases.length > 0) {
            let selected = { selected: false };
            reset(
                toCustomColumnNodesDialogFormValues(
                    nodeAliases.map((value) => {
                        return { ...value, ...selected };
                    })
                )
            );
        }
    }, [open, nodeAliases, reset]);

    return (
        <CustomFormProvider validationSchema={customColumnNodesFormSchema} {...formMethods}>
            <Dialog
                id="custom-column-nodes-dialog-edit"
                open={open.value}
                onClose={onClose}
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
                        <NodeAliasTable />
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={0.5}>
                        <Grid item xs>
                            <Box sx={styles.actionButtons}>
                                <CancelButton onClick={onClose} />
                                <SubmitButton onClick={handleSubmit(onValidate)} variant="outlined" />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
}
