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
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { UniqueNameInput } from './commons/unique-name-input';
import { DESCRIPTION, FOLDER_ID, FOLDER_NAME, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { AppState } from '../../redux/reducer';

interface FormData {
    [NAME]: string;
    [DESCRIPTION]: string;
}
export interface IElementCreationDialog extends FormData {
    [FOLDER_NAME]: string;
    [FOLDER_ID]: UUID;
}

interface ElementCreationDialogProps {
    open: boolean;
    onSave: (data: IElementCreationDialog) => void;
    onClose: () => void;
    type: ElementType;
    titleId: string;
    prefixIdForGeneratedName?: string;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().trim().required(),
        [DESCRIPTION]: yup.string().max(500, 'descriptionLimitError'),
    })
    .required();
const emptyFormData = {
    [NAME]: '',
    [DESCRIPTION]: '',
};

const ElementCreationDialog: React.FC<ElementCreationDialogProps> = ({
    open,
    onSave,
    onClose,
    type,
    titleId,
    prefixIdForGeneratedName,
}) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const {
        reset,
        formState: { errors },
    } = formMethods;
    const disableSave = Object.keys(errors).length > 0;

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

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
        });
    }, [studyUuid, snackError]);

    useEffect(() => {
        if (prefixIdForGeneratedName) {
            const getCurrentDateTime = () => new Date().toISOString();
            const formattedMessage = intl.formatMessage({
                id: prefixIdForGeneratedName,
            });
            const dateTime = getCurrentDateTime();
            const compositeName = `${formattedMessage}-${dateTime}`;
            reset(
                {
                    ...emptyFormData,
                    [NAME]: compositeName,
                },
                { keepDefaultValues: true }
            );
        }
    }, [prefixIdForGeneratedName, intl, reset]);

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
        }
        setDirectorySelectorOpen(false);
    };

    const handleSave = useCallback(
        (values: FormData) => {
            console.log('DBG DBR save', values, destinationFolder);
            if (destinationFolder) {
                const creationData: IElementCreationDialog = {
                    ...values,
                    [FOLDER_NAME]: destinationFolder.name,
                    [FOLDER_ID]: destinationFolder.id as UUID,
                };
                onSave(creationData);
            }
        },
        [onSave, destinationFolder]
    );

    const folderChooser = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleChangeFolder} variant="contained" size={'small'}>
                    <FormattedMessage id={'showSelectDirectoryDialog'} />
                </Button>
            </Grid>
            <Typography m={1} component="span">
                <Box fontWeight={'fontWeightBold'}>
                    {destinationFolder == null ? <CircularProgress /> : destinationFolder.name}
                </Box>
            </Typography>
        </Grid>
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                open={open}
                onClose={onClose}
                onClear={clear}
                onSave={handleSave}
                titleId={titleId}
                disabledSave={disableSave}
                maxWidth={'md'}
            >
                <UniqueNameInput
                    name={NAME}
                    label={'Name'}
                    elementType={type}
                    activeDirectory={destinationFolder?.id as UUID}
                    autoFocus
                />
                <ExpandingTextField
                    name={DESCRIPTION}
                    label={'descriptionProperty'}
                    minRows={3}
                    rows={3}
                    sx={{ flexGrow: 1 }}
                />
                {folderChooser}

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
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ElementCreationDialog;
