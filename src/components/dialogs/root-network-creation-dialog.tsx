/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import {
    CustomFormProvider,
    isObjectEmpty,
    TreeViewFinderNodeProps,
    UniqueNameCheckInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { Grid, Button, Typography, Box } from '@mui/material';
import { CASE_NAME, CASE_ID, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import ImportCaseDialog from './import-case-dialog';
import ModificationDialog from './commons/modificationDialog';
import { rootNetworkNameExists } from 'services/root-network';

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
    dialogProps: any;
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
    dialogProps = undefined,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const [selectedCase, setSelectedCase] = useState<TreeViewFinderNodeProps | null>(null);
    const [caseSelectorOpen, setCaseSelectorOpen] = useState(false);

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
        setSelectedCase(null); // Reset the selected case on clear
    }, [reset]);

    // Open case selector
    const handleCaseSelection = () => {
        setCaseSelectorOpen(true);
    };

    // Set selected case when a case is selected
    const onSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        setSelectedCase(selectedCase);

        setValue(NAME, selectedCase.name, {
            shouldDirty: true,
        }); // Set the name from the selected case
        setValue(CASE_NAME, selectedCase.name, {
            shouldDirty: true,
        });
        setValue(CASE_ID, selectedCase.id, {
            shouldDirty: true,
        });
        setCaseSelectorOpen(false);
    };

    const handleSave = useCallback(
        (values: FormData) => {
            if (selectedCase) {
                // Save data, including CASE_NAME and CASE_ID

                onSave(values);
            } else {
                snackError({
                    messageTxt: 'Please select a case before saving.',
                    headerId: 'caseNotSelectedError',
                });
            }
        },
        [onSave, selectedCase, snackError]
    );

    // Case selection component
    const caseSelection = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleCaseSelection} variant="contained" size={'small'}>
                    <FormattedMessage id={'selectCase'} />
                </Button>
            </Grid>
            <Typography m={1} component="span">
                <Box fontWeight={'fontWeightBold'}>{selectedCase ? selectedCase.name : ''}</Box>
            </Typography>
        </Grid>
    );
    const isFormValid = isObjectEmpty(errors) && selectedCase;

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
                        <UniqueNameCheckInput
                            name={NAME}
                            label={'Name'}
                            autoFocus
                            studyUuid={studyUuid}
                            elementExists={rootNetworkNameExists}
                        />
                    </Grid>
                    {caseSelection}
                </Grid>

                <ImportCaseDialog
                    open={caseSelectorOpen}
                    onClose={() => setCaseSelectorOpen(false)}
                    onSelectCase={onSelectCase}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default RootNetworkCreationDialog;
