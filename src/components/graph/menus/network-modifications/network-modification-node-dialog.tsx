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
    MAX_CHAR_DESCRIPTION,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { UniqueCheckNameInput } from 'components/graph/menus/unique-check-name-input';
import { isNodeExists } from 'services/study';
import { NAME, DESCRIPTION } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { updateTreeNode } from 'services/study/tree-subtree';

export interface FormData {
    [NAME]: string;
    [DESCRIPTION]?: string;
}

interface NetworkModificationNodeDialogProps {
    open: boolean;
    onClose: () => void;
    titleId: string;
}

const getSchema = () =>
    yup
        .object()
        .shape({
            [NAME]: yup.string().trim().required(),
            [DESCRIPTION]: yup.string().max(MAX_CHAR_DESCRIPTION),
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
    ...dialogProps
}) => {
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
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
                [NAME]: currentTreeNode?.data.label ?? '',
                [DESCRIPTION]: currentTreeNode?.data.description ?? '',
            });
        }
    }, [open, reset, currentTreeNode?.data.label, currentTreeNode?.data.description]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const handleSave = useCallback(
        (values: FormData) => {
            updateTreeNode(studyUuid, {
                id: currentTreeNode?.id,
                type: currentTreeNode?.type,
                name: values[NAME],
                description: values[DESCRIPTION],
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'NodeUpdateError' });
            });
        },
        [currentTreeNode?.id, currentTreeNode?.type, snackError, studyUuid]
    );

    const isFormValid = isObjectEmpty(errors);

    return (
        <CustomFormProvider validationSchema={getSchema()} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'sm'}
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
                        <DescriptionField />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default NetworkModificationNodeDialog;
