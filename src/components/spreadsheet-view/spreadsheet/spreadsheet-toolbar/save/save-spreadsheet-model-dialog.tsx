/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import { useCallback, useEffect, useState } from 'react';
import {
    Grid,
    Box,
    Button,
    CircularProgress,
    Typography,
    Checkbox,
    FormGroup,
    FormControl,
    FormLabel,
} from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { DirectoryInitConfig, initializeDirectory } from '@gridsuite/commons-ui';
import {
    CustomMuiDialog,
    DescriptionField,
    DirectoryItemSelector,
    ElementAttributes,
    ElementType,
    FieldConstants,
    MAX_CHAR_DESCRIPTION,
    RadioInput,
    TreeViewFinderNodeProps,
    UniqueNameInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import FormControlLabel from '@mui/material/FormControlLabel';

// Define operation types
enum OperationType {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
}

// Base interface with common fields used by all interfaces
export interface IElementCommonFields {
    [FieldConstants.NAME]: string;
    [FieldConstants.DESCRIPTION]: string;
}

interface FormData extends IElementCommonFields {
    [FieldConstants.OPERATION_TYPE]: OperationType;
}
export interface IElementCreationDialog extends IElementCommonFields {
    [FieldConstants.FOLDER_NAME]: string;
    [FieldConstants.FOLDER_ID]: UUID;
}

export interface IElementUpdateDialog extends IElementCommonFields {
    [FieldConstants.ID]: UUID;
    parentFolderId?: UUID;
    elementFullPath: string;
}

export type SaveDialogProps = {
    open: boolean;
    onClose: () => void;
    type: ElementType;
    titleId: string;
    onSave: (data: IElementCreationDialog) => void;
    onUpdate?: (data: IElementUpdateDialog) => void;
    prefixIdForGeneratedName?: string;
    initialOperation?: OperationType;
    selectorTitleId?: string;
    createLabelId?: string;
    updateLabelId?: string;
    includeFilters?: boolean;
    setIncludeFilters?: (value: boolean) => void;
    includeVisibility?: boolean;
    setIncludeVisibility?: (value: boolean) => void;
    includeSorting?: boolean;
    setIncludeSorting?: (value: boolean) => void;
    createOnlyMode?: false;
} & (
    | {
          /** starting directory can be the same as a given study */
          studyUuid: UUID;
          initDirectory?: never;
      }
    | {
          studyUuid?: never;
          /** or directly a given directory */
          initDirectory?: ElementAttributes;
      }
);

const schema = yup
    .object()
    .shape({
        [FieldConstants.NAME]: yup.string().trim().required(),
        [FieldConstants.DESCRIPTION]: yup.string().optional().max(MAX_CHAR_DESCRIPTION, 'descriptionLimitError'),
        [FieldConstants.OPERATION_TYPE]: yup.string().oneOf(Object.values(OperationType)).required(),
    })
    .required();

type SchemaType = yup.InferType<typeof schema>;

const emptyFormData: FormData = {
    [FieldConstants.NAME]: '',
    [FieldConstants.DESCRIPTION]: '',
    [FieldConstants.OPERATION_TYPE]: OperationType.CREATE,
};

export function SaveSpreadsheetModelDialog({
    open,
    onSave,
    onUpdate,
    onClose,
    type,
    titleId,
    prefixIdForGeneratedName,
    studyUuid,
    initDirectory,
    initialOperation = OperationType.CREATE,
    selectorTitleId,
    createLabelId,
    updateLabelId,
    includeFilters,
    setIncludeFilters,
    includeVisibility,
    setIncludeVisibility,
    includeSorting,
    setIncludeSorting,
}: Readonly<SaveDialogProps>) {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    // Directory/Item selector states
    const [directorySelectorOpen, setDirectorySelectorOpen] = useState(false);
    const [destinationFolder, setDestinationFolder] = useState<TreeViewFinderNodeProps>();
    const [selectedItem, setSelectedItem] = useState<
        TreeViewFinderNodeProps & { parentFolderId: UUID; fullPath: string }
    >();
    const [expanded, setExpanded] = useState<UUID[]>([]);

    // Form handling with conditional defaultValues
    const formMethods = useForm({
        defaultValues: {
            ...emptyFormData,
        },
        resolver: yupResolver(schema),
    });

    const {
        reset,
        setValue,
        watch,
        formState: { errors },
    } = formMethods;

    // Force create mode if in legacy mode
    const operationType = watch(FieldConstants.OPERATION_TYPE);
    const isCreateMode = operationType === OperationType.CREATE;

    const disableSave =
        Object.keys(errors).length > 0 || (isCreateMode && !destinationFolder) || (!isCreateMode && !selectedItem);

    const setDestinationFolderWithPath = useCallback(
        (elementUuid: UUID, elementName: string, path?: ElementAttributes[]) => {
            setDestinationFolder({
                id: elementUuid,
                name: elementName,
            });

            if (path && path.length > 0) {
                // Set expanded path to show the selected directory
                const expandPath = path.map((element) => element.elementUuid);
                setExpanded(expandPath);
            }
        },
        []
    );

    const initializeDestinationFolder = useCallback(async () => {
        const config: DirectoryInitConfig = {
            studyUuid,
            initDirectory,
            onError: (messageTxt: string, headerId: string) => {
                snackError({ messageTxt, headerId });
            },
        };

        const result = await initializeDirectory(config);

        if (result) {
            setDestinationFolderWithPath(result.element.elementUuid, result.element.elementName, result.path);
        }
    }, [studyUuid, initDirectory, snackError, setDestinationFolderWithPath]);

    // Handle cancellation
    const onCancel = useCallback(() => {
        reset({ ...emptyFormData, [FieldConstants.OPERATION_TYPE]: initialOperation });
        setExpanded([]);
        onClose();
    }, [onClose, reset, initialOperation]);

    // Set prefixed name for creation if provided
    useEffect(() => {
        if (isCreateMode && prefixIdForGeneratedName) {
            const getCurrentDateTime = () => new Date().toISOString();
            const formattedMessage = intl.formatMessage({
                id: prefixIdForGeneratedName,
            });
            const dateTime = getCurrentDateTime();
            reset(
                {
                    ...emptyFormData,
                    [FieldConstants.NAME]: `${formattedMessage}-${dateTime}`,
                },
                { keepDefaultValues: true }
            );
        }
    }, [prefixIdForGeneratedName, intl, reset, isCreateMode]);

    // Destination folder initialization for create mode
    useEffect(() => {
        if (!open || !isCreateMode) {
            return;
        }

        initializeDestinationFolder().then();
    }, [open, isCreateMode, initializeDestinationFolder]);

    // Open selector dialog
    const handleChangeFolder = useCallback(() => {
        setDirectorySelectorOpen(true);
    }, []);

    // Handle selection for CREATE mode
    const handleSelection = useCallback(
        (items: TreeViewFinderNodeProps[]) => {
            if (isCreateMode) {
                // Handle directory selection for creation
                if (items?.length > 0 && items[0].id !== destinationFolder?.id) {
                    const { id, name } = items[0];
                    setDestinationFolder({ id, name });
                    setExpanded([]);
                }
            } else if (items?.length > 0 && items[0].id !== selectedItem?.id) {
                // Handle item selection for update
                const { id, name, description, parents } = items[0];

                if (!parents) {
                    snackError({
                        messageTxt: 'errorNoParent',
                        headerId: 'error',
                    });
                    return;
                }
                const fullPath = [...parents.map((parent) => parent.name), name].join('/');
                const parentFolderId = parents[parents.length - 1].id;

                setSelectedItem({ id, name, description, parentFolderId, fullPath });
                setValue(FieldConstants.DESCRIPTION, description ?? '', { shouldDirty: true });
                setValue(FieldConstants.NAME, name, { shouldDirty: true });
            }
            setDirectorySelectorOpen(false);
        },
        [isCreateMode, destinationFolder?.id, selectedItem?.id, setValue, snackError]
    );

    // Form submission handler
    const onSubmit = useCallback<SubmitHandler<SchemaType>>(
        (values) => {
            if (isCreateMode && destinationFolder && onSave) {
                // Handle creation
                const creationData: IElementCreationDialog = {
                    [FieldConstants.NAME]: values.name,
                    [FieldConstants.DESCRIPTION]: values.description ?? '',
                    [FieldConstants.FOLDER_NAME]: destinationFolder.name ?? '',
                    [FieldConstants.FOLDER_ID]: destinationFolder.id,
                };
                onSave(creationData);
            } else if (!isCreateMode && selectedItem && onUpdate) {
                // Handle update
                const updateData: IElementUpdateDialog = {
                    [FieldConstants.ID]: selectedItem.id,
                    [FieldConstants.NAME]: values.name,
                    [FieldConstants.DESCRIPTION]: values.description ?? '',
                    elementFullPath: selectedItem.fullPath,
                    parentFolderId: selectedItem.parentFolderId,
                };
                onUpdate(updateData);
            }
        },
        [isCreateMode, onSave, onUpdate, destinationFolder, selectedItem]
    );

    // Render folder/item chooser
    const renderChooser = () => {
        if (isCreateMode) {
            return (
                <Grid container item>
                    <Grid item>
                        <Button onClick={handleChangeFolder} variant="contained" size="small">
                            <FormattedMessage id="showSelectDirectoryDialog" />
                        </Button>
                    </Grid>
                    <Typography m={1} component="span">
                        <Box fontWeight="fontWeightBold">
                            {destinationFolder ? destinationFolder.name : <CircularProgress />}
                        </Box>
                    </Typography>
                </Grid>
            );
        }
        return (
            <Grid container item>
                <Grid item>
                    <Button onClick={handleChangeFolder} variant="contained" size="small">
                        <FormattedMessage id="showSelectDirectoryItemDialog" />
                    </Button>
                </Grid>
                <Typography m={1} component="span">
                    <Box fontWeight="fontWeightBold">{selectedItem ? selectedItem.fullPath : null}</Box>
                </Typography>
            </Grid>
        );
    };

    return (
        <CustomMuiDialog
            open={open}
            onClose={onCancel}
            titleId={titleId}
            onSave={onSubmit}
            disabledSave={disableSave}
            formSchema={schema}
            formMethods={formMethods}
        >
            <Grid container spacing={2} marginTop="auto" direction="column">
                <Grid item>
                    <RadioInput
                        name={FieldConstants.OPERATION_TYPE}
                        options={[
                            { id: OperationType.CREATE, label: createLabelId ?? 'createLabelId' },
                            { id: OperationType.UPDATE, label: updateLabelId ?? 'updateLabelId' },
                        ]}
                        formProps={{
                            sx: {
                                '& .MuiFormControlLabel-root': {
                                    marginRight: 15,
                                },
                            },
                        }}
                    />
                </Grid>
                <Grid item>
                    <FormControl component="fieldset">
                        <FormLabel focused={false}>
                            {intl.formatMessage({ id: 'spreadsheet/save-dialog/include' })}
                        </FormLabel>
                        <FormGroup aria-label="save-options" row>
                            <FormControlLabel
                                sx={{ mr: 5 }}
                                control={
                                    <Checkbox
                                        checked={includeFilters}
                                        onChange={(e) => setIncludeFilters?.(e.target.checked)}
                                        disabled={!setIncludeFilters}
                                    />
                                }
                                label={intl.formatMessage({ id: 'spreadsheet/save-dialog/filters' })}
                            />
                            <FormControlLabel
                                sx={{ mr: 5 }}
                                control={
                                    <Checkbox
                                        checked={includeVisibility}
                                        onChange={(e) => setIncludeVisibility?.(e.target.checked)}
                                        disabled={!setIncludeVisibility}
                                    />
                                }
                                label={intl.formatMessage({ id: 'spreadsheet/save-dialog/columns_visibility' })}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={includeSorting}
                                        onChange={(e) => setIncludeSorting?.(e.target.checked)}
                                        disabled={!setIncludeSorting}
                                    />
                                }
                                label={intl.formatMessage({ id: 'spreadsheet/save-dialog/columns_sorting' })}
                            />
                        </FormGroup>
                    </FormControl>
                </Grid>
                <Grid item>
                    <UniqueNameInput
                        name={FieldConstants.NAME}
                        label="name"
                        elementType={type}
                        currentName={!isCreateMode ? selectedItem?.name : undefined}
                        activeDirectory={isCreateMode ? destinationFolder?.id : selectedItem?.parentFolderId}
                        autoFocus
                    />
                </Grid>
                <Grid item>
                    <DescriptionField />
                </Grid>
                {renderChooser()}
            </Grid>
            <DirectoryItemSelector
                key={isCreateMode ? destinationFolder?.id : selectedItem?.id}
                open={directorySelectorOpen}
                onClose={handleSelection}
                types={isCreateMode ? [ElementType.DIRECTORY] : [type]}
                onlyLeaves={isCreateMode ? false : undefined}
                multiSelect={false}
                expanded={isCreateMode ? expanded : []}
                validationButtonText={intl.formatMessage({
                    id: 'validate',
                })}
                title={intl.formatMessage({
                    id: isCreateMode ? 'showSelectDirectoryDialog' : selectorTitleId,
                })}
            />
        </CustomMuiDialog>
    );
}
