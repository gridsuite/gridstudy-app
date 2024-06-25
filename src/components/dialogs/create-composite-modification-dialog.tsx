/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    ExpandingTextField,
    fetchDirectoryElementPath,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { UniqueNameInput } from './commons/unique-name-input';
import { DESCRIPTION, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

interface ICompositeCreateModificationDialog {
    [NAME]: string;
    [DESCRIPTION]: string;
}
interface CreateCompositeModificationDialogProps {
    open: boolean;
    onSave: (
        data: ICompositeCreateModificationDialog,
        distDir: TreeViewFinderNodeProps
    ) => void;
    onClose: () => void;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [DESCRIPTION]: yup.string().max(500, 'descriptionLimitError'),
    })
    .required();
const emptyFormData = {
    [NAME]: '',
    [DESCRIPTION]: '',
};

const CreateCompositeModificationDialog: React.FC<
    CreateCompositeModificationDialogProps
> = ({ open, onSave, onClose }) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: any) => state.studyUuid);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] =
        useState<TreeViewFinderNodeProps>();
    const fetchDefaultDirectoryForStudy = useCallback(() => {
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (res) {
                const parentFolderIndex = res.length - 2;
                setDestinationFolder({
                    id: res[parentFolderIndex].elementUuid,
                    name: res[parentFolderIndex].elementName,
                });
            }
        });
    }, [studyUuid]);

    useEffect(() => {
        const getCurrentDateTime = () => new Date().toISOString();
        const formattedMessage = intl.formatMessage({
            id: 'GeneratedModification',
        });
        const dateTime = getCurrentDateTime();
        const compositeName = `${formattedMessage}-${dateTime}`;

        formMethods.setValue(NAME, compositeName);
    }, [intl, formMethods]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setDirectorySelectorOpen(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder && folder.length > 0) {
            if (folder[0].id !== destinationFolder?.id) {
                setDestinationFolder({
                    id: folder[0].id,
                    name: folder[0].name,
                });
            }
        }
        setDirectorySelectorOpen(false);
    };
    const handleSave = useCallback(() => {
        formMethods.trigger().then((isValid) => {
            if (isValid && destinationFolder) {
                onSave(
                    formMethods.getValues() as ICompositeCreateModificationDialog,
                    destinationFolder
                );
            }
        });

        onClose();
    }, [formMethods, destinationFolder, onSave, onClose]);

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            aria-labelledby="dialog-save-modifications"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateCompositeModification' })}
            </DialogTitle>
            <DialogContent>
                <CustomFormProvider
                    removeOptional={true}
                    validationSchema={formSchema}
                    {...formMethods}
                >
                    <Grid container>
                        <Grid container paddingTop={2}>
                            <UniqueNameInput
                                name={NAME}
                                label={'Name'}
                                elementType={ElementType.DIRECTORY}
                                activeDirectory={destinationFolder?.id as UUID}
                                autoFocus
                            />
                        </Grid>
                        <Grid container paddingTop={2}>
                            <ExpandingTextField
                                name={DESCRIPTION}
                                label={'descriptionProperty'}
                                minRows={3}
                                rows={5}
                            />
                        </Grid>
                        <Grid container paddingTop={2}>
                            <Button
                                onClick={handleChangeFolder}
                                variant="contained"
                            >
                                <FormattedMessage
                                    id={'showSelectDirectoryDialog'}
                                />
                            </Button>

                            <Typography m={1} component="span">
                                <Box fontWeight={'fontWeightBold'}>
                                    {destinationFolder?.name}
                                </Box>
                            </Typography>
                        </Grid>
                        <Grid container paddingTop={2}>
                            <DirectoryItemSelector
                                open={directorySelectorOpen}
                                onClose={setSelectedFolder}
                                types={[ElementType.DIRECTORY]}
                                onlyLeaves={false}
                                multiSelect={false}
                                validationButtonText={intl.formatMessage({
                                    id: 'validate',
                                })}
                                title={intl.formatMessage({
                                    id: 'showSelectDirectoryDialog',
                                })}
                            />
                        </Grid>
                    </Grid>
                    <Grid container paddingTop={2} justifyContent="flex-end">
                        <Button onClick={onClose} size={'large'}>
                            {intl.formatMessage({
                                id: 'cancel',
                            })}
                        </Button>
                        <Box m={1} />
                        <Button
                            variant="contained"
                            type={'submit'}
                            onClick={handleSave}
                            size={'large'}
                        >
                            {intl.formatMessage({
                                id: 'validate',
                            })}
                        </Button>
                    </Grid>
                </CustomFormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCompositeModificationDialog;
