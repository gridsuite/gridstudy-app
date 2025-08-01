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
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CASE_NAME, CASE_ID, NAME, TAG, DESCRIPTION } from '../../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { ModificationDialog } from '../commons/modificationDialog';
import { checkRootNetworkNameExistence, checkRootNetworkTagExistence } from 'services/root-network';
import { RootNetworkCaseSelection } from './root-network-case-selection';
import { UniqueCheckNameInput } from 'components/graph/menus/unique-check-name-input';
import { RootNetworkMetadata } from 'components/graph/menus/network-modifications/network-modification-menu.type';

export interface FormData {
    [NAME]: string;
    [TAG]: string;
    [CASE_NAME]: string;
    [CASE_ID]: string;
    [DESCRIPTION]?: string;
}

interface RootNetworkDialogProps {
    open: boolean;
    onSave: (data: FormData) => void;
    onClose: () => void;
    titleId: string;
    editableRootNetwork?: RootNetworkMetadata;
}

const getSchema = (isModification = false) => {
    return yup
        .object()
        .shape({
            [NAME]: yup.string().trim().required(),
            [TAG]: yup.string().trim().required(),
            [CASE_NAME]: yup.string().when([], {
                is: isModification,
                then: (schema) => schema.optional(),
                otherwise: (schema) => schema.required(),
            }),
            [CASE_ID]: yup.string().when([], {
                is: isModification,
                then: (schema) => schema.optional(),
                otherwise: (schema) => schema.required(),
            }),
            [DESCRIPTION]: yup.string().max(MAX_CHAR_DESCRIPTION),
        })
        .required();
};

const emptyFormData: FormData = {
    [NAME]: '',
    [TAG]: '',
    [CASE_NAME]: '',
    [CASE_ID]: '',
    [DESCRIPTION]: '',
};

const MAX_TAG_LENGTH = 4;

const RootNetworkDialog: React.FC<RootNetworkDialogProps> = ({
    open,
    onSave,
    onClose,
    titleId,
    editableRootNetwork,
    ...dialogProps
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [modifiedByUser, setModifiedByUser] = useState(false);

    // Determine if it's in modification mode to get the appropriate schema
    const isModification = !!editableRootNetwork;

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(getSchema(isModification)),
    });

    const {
        reset,
        setValue,
        formState: { errors },
    } = formMethods;

    // Reset the form values when editableRootNetwork is available (for modification mode)
    useEffect(() => {
        if (open && editableRootNetwork) {
            reset({
                [NAME]: editableRootNetwork?.name,
                [TAG]: editableRootNetwork?.tag,
                [DESCRIPTION]: editableRootNetwork?.description || '',
            });
        }
    }, [editableRootNetwork, open, reset]);

    // Clear form and reset selected case
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        if (!modifiedByUser && !isModification) {
            setValue(NAME, selectedCase.name, {
                shouldDirty: true,
            });
        }
        setValue(CASE_NAME, selectedCase.name, {
            shouldDirty: true,
        });
        setValue(CASE_ID, selectedCase.id, {
            shouldDirty: true,
        });
    };

    const handleSave = useCallback(
        (values: FormData) => {
            // Save data, including CASE_NAME and CASE_ID
            onSave(values);
        },
        [onSave]
    );

    const isFormValid = isObjectEmpty(errors);

    return (
        <CustomFormProvider validationSchema={getSchema(isModification)} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                {...dialogProps}
                titleId={titleId}
                disabledSave={!isFormValid}
            >
                <Grid container spacing={2} marginTop={'auto'} direction="column">
                    <Grid item>
                        <UniqueCheckNameInput
                            name={NAME}
                            label={'rootName'}
                            autoFocus
                            studyUuid={studyUuid}
                            elementExists={checkRootNetworkNameExistence}
                            errorMessageKey="nameAlreadyUsed"
                            catchMessageKey="rootNetworknameValidityCheckError"
                            formProps={{ fullWidth: true }}
                            onManualChangeCallback={() => setModifiedByUser(true)}
                        />
                    </Grid>
                    <Grid item>
                        <DescriptionField />
                    </Grid>
                    <RootNetworkCaseSelection
                        isModification={isModification}
                        onSelectCase={onSelectCase}
                        originalCaseUuid={editableRootNetwork?.originalCaseUuid}
                    />
                    <Grid item>
                        <UniqueCheckNameInput
                            name={TAG}
                            label={'rootTag'}
                            studyUuid={studyUuid}
                            elementExists={checkRootNetworkTagExistence}
                            inputProps={{ maxLength: MAX_TAG_LENGTH }}
                            errorMessageKey="tagAlreadyUsed"
                            catchMessageKey="rootNetworknameValidityCheckError"
                            max_length={MAX_TAG_LENGTH}
                        />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default RootNetworkDialog;
