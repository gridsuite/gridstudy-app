/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, SxProps, Theme } from '@mui/material';
import { CancelButton, CustomFormProvider, SubmitButton, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { AppState, NodeAlias } from 'redux/reducer';
import {
    customColumnNodesFormSchema,
    initialCustomColumnNodesForm,
    NODES_ALIASES,
} from './custom-columns-nodes-form-utils';
import NodeAliasTable from './node-alias-table';
import { updateCustomColumnsNodesAliases } from '../../../redux/actions';

export type CustomColumnNodesDialogProps = {
    open: UseStateBooleanReturn;
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
} as const satisfies Record<string, SxProps<Theme>>;

export default function CustomColumnNodesDialog({ open }: Readonly<CustomColumnNodesDialogProps>) {
    const dispatch = useDispatch<AppDispatch>();

    const intl = useIntl();

    const customColumnsNodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);

    const formMethods = useForm({
        defaultValues: initialCustomColumnNodesForm,
        resolver: yupResolver(customColumnNodesFormSchema),
    });
    const { reset } = formMethods;

    const onValidate = (data: any) => {
        onClose();
        const nodesAliases: NodeAlias[] = data.nodesAliases.map((nodeAlias: NodeAlias) => {
            return { name: nodeAlias.name, alias: nodeAlias.alias };
        });
        dispatch(updateCustomColumnsNodesAliases(nodesAliases));
    };

    const clear = useCallback(() => {
        reset(initialCustomColumnNodesForm);
    }, [reset]);

    const onClose = () => {
        open.setFalse();
        clear();
    };

    useEffect(() => {
        if (open.value && customColumnsNodesAliases) {
            if (customColumnsNodesAliases && customColumnsNodesAliases.length > 0) {
                reset({
                    [NODES_ALIASES]: customColumnsNodesAliases,
                });
            }
        }
    }, [open, customColumnsNodesAliases, reset]);

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
