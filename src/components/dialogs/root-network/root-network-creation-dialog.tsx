/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    isObjectEmpty,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { Grid } from '@mui/material';
import { CASE_NAME, CASE_ID, NAME } from '../../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import ModificationDialog from '../commons/modificationDialog';
import { checkRootNetworkNameExistence } from 'services/root-network';
import { RootNetworkCaseSelection } from './root-network-case-selection';
import { UniqueCheckNameInput } from 'components/graph/menus/unique-check-name-input';
 
export interface FormData {
    [NAME]: string;
    [CASE_NAME]: string;
    [CASE_ID]: string;
}

interface RootNetworkCreationDialogProps {
    open: boolean;
    onSave: (data: FormData) => void;
    onClose: () => void;
    titleId: string;
    dialogProps?: any;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().trim().required(),
        [CASE_NAME]: yup.string().required(),
        [CASE_ID]: yup.string().required(),
    })
    .required();

const emptyFormData: FormData = {
    [NAME]: '',
    [CASE_NAME]: '',
    [CASE_ID]: '',
};

const RootNetworkCreationDialog: React.FC<RootNetworkCreationDialogProps> = ({
    open,
    onSave,
    onClose,
    titleId,
    dialogProps,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        setValue,
        formState: { errors },
    } = formMethods;

    // Clear form and reset selected case
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    // Set selected case when a case is selected
    const onSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        setValue(NAME, selectedCase.name, {
            shouldDirty: true,
        }); // Set the name from the selected case
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                aria-labelledby="dialog-root-network-creation"
                {...dialogProps}
                titleId={titleId}
                disabledSave={!isFormValid}
            >
                <Grid container spacing={2} marginTop={'auto'} direction="column">
                    <Grid item>
                        <UniqueCheckNameInput
                            name={NAME}
                            label={'Name'}
                            autoFocus
                            studyUuid={studyUuid}
                            elementExists={checkRootNetworkNameExistence}
                        />
                    </Grid>
                    <RootNetworkCaseSelection onSelectCase={onSelectCase} />
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default RootNetworkCreationDialog;
