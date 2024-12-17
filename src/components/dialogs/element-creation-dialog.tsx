/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    DescriptionField,
    DirectoryItemSelector,
    ElementType,
    fetchDirectoryElementPath,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useCallback, useEffect, useState } from 'react';
import { Grid, Box, Button, CircularProgress, Typography } from '@mui/material';
import { UniqueNameInput } from './commons/unique-name-input';
import { CASE_NAME, CASE_ID, DESCRIPTION, FOLDER_ID, FOLDER_NAME, NAME } from '../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../utils/yup-config';
import { useSelector } from 'react-redux';
import ModificationDialog from './commons/modificationDialog';
import { AppState } from '../../redux/reducer';
import ImportCaseDialog from './import-case-dialog';

interface FormData {
    [NAME]: string;
    [DESCRIPTION]: string;
}

export interface IElementCreationDialog extends FormData {
    [FOLDER_NAME]?: string;
    [FOLDER_ID]?: UUID;
}

export interface IElementCreationDialog1 extends FormData {
    [CASE_NAME]?: string;
    [CASE_ID]?: UUID;
}

interface ElementCreationDialogProps {
    open: boolean;
    onSave: (data: IElementCreationDialog | IElementCreationDialog1) => void;
    onClose: () => void;
    type: ElementType;
    titleId: string;
    prefixIdForGeneratedName?: string;
}

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().trim().required(),
        [DESCRIPTION]: yup.string().optional().max(500, 'descriptionLimitError'),
    })
    .required();

const emptyFormData: FormData = {
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
    const rootNetworkUuid = useSelector((state: AppState) => state.rootNetworkUuid);
    const { snackError } = useSnackMessage();

    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();
    const [selectedCase, setSelectedCase] = useState<TreeViewFinderNodeProps | null>(null);
    const [caseSelectorOpen, setCaseSelectorOpen] = useState(false);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    // Check if the selection is valid based on element type
    const isValidSelection = () => {
        // add type on commons
        if (type === ElementType.ROOT_NETWORK) {
            return !!selectedCase; // ROOT_NETWORK requires selected case
        }
        return !!destinationFolder; // Other types require selected folder
    };

    const {
        reset,
        setValue,
        formState: { errors },
    } = formMethods;
    const disableSave = Object.keys(errors).length > 0 || !isValidSelection();

    // Clear form and reset selected case
    const clear = useCallback(() => {
        reset(emptyFormData);
        setSelectedCase(null); // Reset the selected case on clear
    }, [reset]);

    // Fetch default directory based on study UUID
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

    // Auto-generate a name with prefix and current date
    useEffect(() => {
        if (prefixIdForGeneratedName) {
            const getCurrentDateTime = () => new Date().toISOString();
            const formattedMessage = intl.formatMessage({
                id: prefixIdForGeneratedName,
            });
            const dateTime = getCurrentDateTime();
            reset(
                {
                    ...emptyFormData,
                    [NAME]: `${formattedMessage}-${dateTime}`,
                },
                { keepDefaultValues: true }
            );
        }
    }, [prefixIdForGeneratedName, intl, reset]);

    useEffect(() => {
        if (open && studyUuid) {
            fetchDefaultDirectoryForStudy();
        }
    }, [fetchDefaultDirectoryForStudy, studyUuid, open]);

    // Open directory selector
    const handleChangeFolder = () => {
        setDirectorySelectorOpen(true);
    };

    // Open case selector
    const handleCaseSelection = () => {
        console.log("?????????",rootNetworkUuid);
        setCaseSelectorOpen(true);
    };

    // Set selected folder when a directory is selected
    const setSelectedFolder = (folder: TreeViewFinderNodeProps[]) => {
        if (folder?.length > 0 && folder[0].id !== destinationFolder?.id) {
            const { id, name } = folder[0];
            setDestinationFolder({ id, name });
        }
        setDirectorySelectorOpen(false);
    };

    const handleSave = useCallback(
        (values: FormData) => {
            if (type === ElementType.ROOT_NETWORK) {
                if (selectedCase) {
                    // Save data for ROOT_NETWORK, including CASE_NAME and CASE_ID
                    const creationData1: IElementCreationDialog1 = {
                        ...values,
                        [CASE_NAME]: selectedCase.name,
                        [CASE_ID]: selectedCase.id as UUID,
                    };
                    onSave(creationData1);
                } else {
                    snackError({
                        messageTxt: 'Please select a case before saving.',
                        headerId: 'caseNotSelectedError',
                    });
                }
            } else {
                if (destinationFolder) {
                    // Save data for other types, including FOLDER info
                    const creationData: IElementCreationDialog = {
                        ...values,
                        [FOLDER_NAME]: destinationFolder.name,
                        [FOLDER_ID]: destinationFolder.id as UUID,
                    };
                    onSave(creationData);
                }
            }
        },
        [onSave, destinationFolder, selectedCase, snackError, type,rootNetworkUuid]
    );

    // Folder chooser component
    const folderChooser = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleChangeFolder} variant="contained" size={'small'}>
                    <FormattedMessage id={'showSelectDirectoryDialog'} />
                </Button>
            </Grid>
            <Typography m={1} component="span">
                <Box fontWeight={'fontWeightBold'}>
                    {destinationFolder ? destinationFolder.name : <CircularProgress />}
                </Box>
            </Typography>
        </Grid>
    );

    // Case selection component
    const caseSelection = (
        <Grid container item>
            <Grid item>
                <Button onClick={handleCaseSelection} variant="contained" size={'small'}>
                    <FormattedMessage id={'selectCase'} />
                </Button>
            </Grid>
        </Grid>
    );

    // Handle case selection
    const onSelectCase = (selectedCase: TreeViewFinderNodeProps) => {
        setSelectedCase(selectedCase);
        setValue(NAME, selectedCase.name); // Set the name from the selected case
        setCaseSelectorOpen(false);
    };

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                open={open}
                onClose={onClose}
                titleId={titleId}
                onClear={clear}
                onSave={handleSave}
                aria-labelledby="dialog-element-creation"
                maxWidth={'md'}
                disabledSave={disableSave}
            >
                <Grid container spacing={2} marginTop={'auto'} direction="column">
                    <Grid item>
                        <UniqueNameInput
                            name={NAME}
                            label={'Name'}
                            elementType={type}
                            activeDirectory={destinationFolder?.id as UUID}
                            autoFocus
                        />
                    </Grid>
                    {type !== ElementType.ROOT_NETWORK && (
                        <Grid item>
                            <DescriptionField />
                        </Grid>
                    )}
                    {type === ElementType.ROOT_NETWORK ? caseSelection : folderChooser}
                </Grid>

                <ImportCaseDialog
                    open={caseSelectorOpen}
                    onClose={() => setCaseSelectorOpen(false)}
                    onSelectCase={onSelectCase}
                />

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
