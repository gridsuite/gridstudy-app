/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DescriptionField,
    isObjectEmpty,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { UniqueCheckNameInput } from 'components/graph/menus/unique-check-name-input';
import { isNodeExists } from 'services/study';
import { DESCRIPTION, NAME } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { updateTreeNode } from 'services/study/tree-subtree';
import { CurrentTreeNode } from 'components/graph/tree-node.type';

export const MAX_CHAR_NODE_DESCRIPTION = 10000;

export interface FormData {
    [NAME]: string;
    [DESCRIPTION]?: string;
}

interface NetworkModificationNodeDialogProps {
    open: boolean;
    onClose: () => void;
    titleId: string;
    currentNode?: CurrentTreeNode;
}

const getSchema = () =>
    yup
        .object()
        .shape({
            [NAME]: yup.string().trim().required(),
            [DESCRIPTION]: yup.string().max(MAX_CHAR_NODE_DESCRIPTION),
        })
        .required();

const emptyFormData: FormData = {
    [NAME]: '',
    [DESCRIPTION]: '',
};

const NetworkModificationNodeDialog: React.FC<NetworkModificationNodeDialogProps> = ({
    open,
    onClose,
    titleId,
    currentNode,
    ...dialogProps
}) => {
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const nodeForRename = currentNode ?? currentTreeNode;
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const formMethods = useForm<FormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver(getSchema()),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    useEffect(() => {
        if (open) {
            reset({
                [NAME]: nodeForRename?.data.label ?? '',
                [DESCRIPTION]: nodeForRename?.data.description ?? '',
            });
        }
    }, [open, reset, nodeForRename?.data.label, nodeForRename?.data.description]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const handleSave = useCallback(
        (values: FormData) => {
            updateTreeNode(studyUuid, {
                id: nodeForRename?.id,
                type: nodeForRename?.type,
                name: values[NAME],
                description: values[DESCRIPTION],
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'NodeUpdateError' });
            });
        },
        [nodeForRename?.id, nodeForRename?.type, snackError, studyUuid]
    );

    const isFormValid = isObjectEmpty(errors);

    return (
        <CustomFormProvider validationSchema={getSchema()} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                aria-labelledby="network-modification-node-dialog"
                titleId={titleId}
                disabledSave={!isFormValid}
                {...dialogProps}
            >
                <Grid container spacing={2} direction="column">
                    <Grid item>
                        <UniqueCheckNameInput
                            name={NAME}
                            autoFocus
                            label="nodeName"
                            studyUuid={studyUuid}
                            elementExists={isNodeExists}
                            errorMessageKey="nameAlreadyUsed"
                            catchMessageKey="NodeUpdateError"
                            formProps={{ fullWidth: true }}
                        />
                    </Grid>
                    <Grid item>
                        <DescriptionField rows={6} maxCharactersNumber={MAX_CHAR_NODE_DESCRIPTION} />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default NetworkModificationNodeDialog;