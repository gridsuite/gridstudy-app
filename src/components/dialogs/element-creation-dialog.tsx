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
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { UniqueNameInput } from './commons/unique-name-input';
import { DESCRIPTION, FOLDER_ID, FOLDER_NAME, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { AppState } from '../../redux/reducer';

export interface IElementCreationDialog {
    [NAME]: string;
    [DESCRIPTION]: string;
    [FOLDER_NAME]: string;
    [FOLDER_ID]: UUID;
}
interface ElementCreationDialogProps {
    open: boolean;
    onSave: (data: IElementCreationDialog) => void;
    onClose: () => void;
    titleId: string;
    prefixIdForGeneratedName?: string;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [DESCRIPTION]: yup.string().max(500, 'descriptionLimitError'),
        [FOLDER_NAME]: yup.string().required(),
        [FOLDER_ID]: yup.string().required(),
    })
    .required();
const emptyFormData = {
    [NAME]: '',
    [DESCRIPTION]: '',
    [FOLDER_NAME]: '',
    [FOLDER_ID]: '',
};

const ElementCreationDialog: React.FC<ElementCreationDialogProps> = ({
    open,
    onSave,
    onClose,
    titleId,
    prefixIdForGeneratedName,
}) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();
    const fetchDefaultDirectoryForStudy = useCallback(() => {
        // @ts-expect-error TODO: manage null case
        fetchDirectoryElementPath(studyUuid).then((res) => {
            if (!res || res.length < 2) {
                snackError({
                    messageTxt: 'unknown study directory',
                    headerId: 'studyDirectoryFetchingError',
                });
                return;
            }

            const parentFolderIndex = res.length - 2;
            const { elementUuid, elementName } = res[parentFolderIndex];

            setDestinationFolder({
                id: elementUuid,
                name: elementName,
            });

            formMethods.setValue(FOLDER_NAME, elementName);
            formMethods.setValue(FOLDER_ID, elementUuid);
        });
    }, [studyUuid, formMethods, snackError]);

    useEffect(() => {
        if (prefixIdForGeneratedName) {
            const getCurrentDateTime = () => new Date().toISOString();
            const formattedMessage = intl.formatMessage({
                id: prefixIdForGeneratedName,
            });
            const dateTime = getCurrentDateTime();
            const compositeName = `${formattedMessage}-${dateTime}`;

            formMethods.setValue(NAME, compositeName);
        }
    }, [prefixIdForGeneratedName, intl, formMethods]);

    useEffect(() => {
        if (studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid]);

    const handleChangeFolder = () => {
        setDirectorySelectorOpen(true);
    };
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder?.length > 0 && folder[0].id !== destinationFolder?.id) {
            const { id, name } = folder[0];
            setDestinationFolder({ id, name });
            formMethods.setValue(FOLDER_NAME, name);
            formMethods.setValue(FOLDER_ID, id);
        }
        setDirectorySelectorOpen(false);
    };
    const handleSave = useCallback(() => {
        formMethods.trigger().then((isValid) => {
            if (isValid && destinationFolder) {
                onSave(formMethods.getValues() as IElementCreationDialog);
            }
        });

        onClose();
    }, [formMethods, destinationFolder, onSave, onClose]);

    return (
        <Dialog fullWidth maxWidth="md" open={open} aria-labelledby="dialog-element-creation">
            <DialogTitle>{intl.formatMessage({ id: titleId })}</DialogTitle>
            <DialogContent>
                <CustomFormProvider removeOptional={true} validationSchema={formSchema} {...formMethods}>
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
                            <ExpandingTextField name={DESCRIPTION} label={'descriptionProperty'} minRows={3} rows={5} />
                        </Grid>
                        <Grid container paddingTop={2}>
                            <Button onClick={handleChangeFolder} variant="contained">
                                <FormattedMessage id={'showSelectDirectoryDialog'} />
                            </Button>

                            <Typography m={1} component="span">
                                <Box fontWeight={'fontWeightBold'}>{destinationFolder?.name}</Box>
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
                        <Button variant="contained" type={'submit'} onClick={handleSave} size={'large'}>
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

export default ElementCreationDialog;
