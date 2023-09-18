/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import FileCopyIcon from '@mui/icons-material/FileCopy';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import PhotoLibrary from '@mui/icons-material/PhotoLibrary';
import ContentCopy from '@mui/icons-material/ContentCopy';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import RenameDialog from '../dialogs/rename-dialog';
import DeleteDialog from '../dialogs/delete-dialog';
import ReplaceWithScriptDialog from '../dialogs/replace-with-script-dialog';
import CopyToScriptDialog from '../dialogs/copy-to-script-dialog';
import CreateStudyDialog from '../dialogs/create-study-dialog/create-study-dialog';

import { DialogsId } from '../../utils/UIconstants';

import {
    duplicateCase,
    deleteElement,
    moveElementToDirectory,
    newScriptFromFilter,
    newScriptFromFiltersContingencyList,
    renameElement,
    replaceFiltersWithScript,
    replaceFormContingencyListWithScript,
    duplicateFilter,
    duplicateContingencyList,
    fetchElementsInfos,
    duplicateStudy,
    getNameCandidate,
} from '../../utils/rest-api';

import { ContingencyListType, ElementType } from '../../utils/elementType';

import CommonContextualMenu from './common-contextual-menu';
import {
    useDeferredFetch,
    useMultipleDeferredFetch,
} from '../../utils/custom-hooks';
import { useSnackMessage } from '@gridsuite/commons-ui';
import MoveDialog from '../dialogs/move-dialog';

const ContentContextualMenu = (props) => {
    const {
        activeElement,
        selectedElements,
        open,
        onClose,
        openDialog,
        setOpenDialog,
        ...others
    } = props;
    const userId = useSelector((state) => state.user.profile.sub);
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const DownloadIframe = 'downloadIframe';

    const selectedDirectory = useSelector((state) => state.selectedDirectory);
    const [hideMenu, setHideMenu] = useState(false);

    const handleLastError = useCallback(
        (message) => {
            snackError({
                messageTxt: message,
            });
        },
        [snackError]
    );

    const handleOpenDialog = (dialogId) => {
        setHideMenu(true);
        setOpenDialog(dialogId);
    };

    const handleDuplicateError = (error) => {
        return handleLastError(
            intl.formatMessage(
                { id: 'duplicateElementFailure' },
                {
                    itemName: activeElement.elementName,
                    errorMessage: error,
                }
            )
        );
    };

    const duplicateItem = () => {
        if (activeElement) {
            getNameCandidate(
                selectedDirectory.elementUuid,
                activeElement.elementName,
                activeElement.type
            )
                .then((newItemName) => {
                    if (newItemName) {
                        switch (activeElement.type) {
                            case ElementType.CASE:
                                duplicateCase(
                                    newItemName,
                                    activeElement.description,
                                    activeElement.elementUuid,
                                    selectedDirectory.elementUuid
                                )
                                    .then(() => {
                                        handleCloseDialog();
                                    })
                                    .catch((error) => {
                                        handleDuplicateError(error.message);
                                    });
                                break;
                            case ElementType.CONTINGENCY_LIST:
                                fetchElementsInfos([activeElement.elementUuid])
                                    .then((res) => {
                                        duplicateContingencyList(
                                            res[0].specificMetadata.type,
                                            newItemName,
                                            activeElement.description,
                                            activeElement.elementUuid,
                                            selectedDirectory.elementUuid
                                        ).catch((error) => {
                                            handleDuplicateError(error.message);
                                        });
                                    })
                                    .catch((error) => {
                                        handleLastError(error.message);
                                    })
                                    .finally(() => {
                                        handleCloseDialog();
                                    });

                                break;
                            case ElementType.STUDY:
                                duplicateStudy(
                                    newItemName,
                                    activeElement.description,
                                    activeElement.elementUuid,
                                    selectedDirectory.elementUuid
                                )
                                    .then(() => {
                                        handleCloseDialog();
                                    })
                                    .catch((error) => {
                                        handleDuplicateError(error.message);
                                    });
                                break;
                            case ElementType.FILTER:
                                duplicateFilter(
                                    newItemName,
                                    activeElement.description,
                                    activeElement.elementUuid,
                                    selectedDirectory.elementUuid
                                )
                                    .then(() => {
                                        handleCloseDialog();
                                    })
                                    .catch((error) => {
                                        handleDuplicateError(error.message);
                                    });
                                break;
                            default:
                                handleLastError(
                                    intl.formatMessage({ id: 'unsuportedItem' })
                                );
                        }
                    } else {
                        handleLastError(
                            activeElement.elementName +
                                ' : ' +
                                intl.formatMessage({
                                    id: 'nameAlreadyUsed',
                                })
                        );
                    }
                })
                .catch((error) => {
                    handleDuplicateError(error.message);
                });
        }
    };

    const handleCloseDialog = useCallback(() => {
        onClose();
        setOpenDialog(DialogsId.NONE);
        setHideMenu(false);
    }, [onClose, setOpenDialog]);

    const [multipleDeleteError, setMultipleDeleteError] = useState('');

    const deleteElementOnError = useCallback(
        (errorMessages, params, paramsOnErrors) => {
            let msg = intl.formatMessage(
                { id: 'deleteElementsFailure' },
                {
                    pbn: errorMessages.length,
                    stn: params.length,
                    problematic: paramsOnErrors
                        .map((p) => p.elementUuid)
                        .join(' '),
                }
            );
            console.debug(msg);
            setMultipleDeleteError(msg);
        },
        [intl]
    );
    const [deleteCB] = useMultipleDeferredFetch(
        deleteElement,
        handleCloseDialog,
        undefined,
        deleteElementOnError,
        false
    );

    const moveElementErrorToString = useCallback(
        (HTTPStatusCode) => {
            if (HTTPStatusCode === 403) {
                return intl.formatMessage({
                    id: 'moveElementNotAllowedError',
                });
            } else if (HTTPStatusCode === 404) {
                return intl.formatMessage({ id: 'moveElementNotFoundError' });
            }
        },
        [intl]
    );

    const moveElementOnError = useCallback(
        (errorMessages, params, paramsOnErrors) => {
            let msg = intl.formatMessage(
                { id: 'moveElementsFailure' },
                {
                    pbn: errorMessages.length,
                    stn: paramsOnErrors.length,
                    problematic: paramsOnErrors.map((p) => p[0]).join(' '),
                }
            );
            console.debug(msg);
            handleLastError(msg);
        },
        [handleLastError, intl]
    );

    const [moveCB] = useMultipleDeferredFetch(
        moveElementToDirectory,
        undefined,
        moveElementErrorToString,
        moveElementOnError,
        false
    );

    const [renameCB, renameState] = useDeferredFetch(
        renameElement,
        handleCloseDialog,
        (HTTPStatusCode) => {
            if (HTTPStatusCode === 403) {
                return intl.formatMessage({
                    id: 'renameElementNotAllowedError',
                });
            } else if (HTTPStatusCode === 404) {
                // == NOT FOUND
                return intl.formatMessage({ id: 'renameElementNotFoundError' });
            }
        },
        undefined,
        false
    );

    const [FiltersReplaceWithScriptCB] = useDeferredFetch(
        replaceFiltersWithScript,
        handleCloseDialog,
        undefined,
        handleLastError,
        false
    );

    const [newScriptFromFiltersContingencyListCB] = useDeferredFetch(
        newScriptFromFiltersContingencyList,
        handleCloseDialog,
        undefined,
        handleLastError,
        false
    );

    const [replaceFormContingencyListWithScriptCB] = useDeferredFetch(
        replaceFormContingencyListWithScript,
        handleCloseDialog,
        undefined,
        handleLastError,
        false
    );

    const [newScriptFromFilterCB] = useDeferredFetch(
        newScriptFromFilter,
        handleCloseDialog,
        undefined,
        handleLastError,
        false
    );

    const isNotUploadingElement = useCallback(() => {
        return selectedElements.every((el) => !el.uploading);
    }, [selectedElements]);

    // Allowance
    const isUserAllowed = useCallback(() => {
        return selectedElements.every((el) => {
            return el.owner === userId;
        });
    }, [selectedElements, userId]);

    const allowsDelete = useCallback(() => {
        return isUserAllowed() && isNotUploadingElement();
    }, [isUserAllowed, isNotUploadingElement]);

    const allowsRename = useCallback(() => {
        return (
            selectedElements.length === 1 &&
            isUserAllowed() &&
            !selectedElements[0].uploading
        );
    }, [isUserAllowed, selectedElements]);

    const allowsMove = useCallback(() => {
        return (
            selectedElements.every(
                (element) =>
                    element.type !== ElementType.DIRECTORY && !element.uploading
            ) && isUserAllowed()
        );
    }, [isUserAllowed, selectedElements]);

    const allowsDuplicate = useCallback(() => {
        return (
            selectedElements.length === 1 &&
            (selectedElements[0].type === ElementType.CASE ||
                selectedElements[0].type === ElementType.STUDY ||
                selectedElements[0].type === ElementType.CONTINGENCY_LIST ||
                selectedElements[0].type === ElementType.FILTER) &&
            !selectedElements[0].uploading
        );
    }, [selectedElements]);

    const allowsCreateNewStudyFromCase = useCallback(() => {
        return (
            selectedElements.length === 1 &&
            selectedElements[0].type === ElementType.CASE &&
            !selectedElements[0].uploading
        );
    }, [selectedElements]);

    const allowsCopyContingencyToScript = useCallback(() => {
        return (
            selectedElements.length === 1 &&
            selectedElements[0].type === ElementType.CONTINGENCY_LIST &&
            selectedElements[0].subtype ===
                ContingencyListType.CRITERIA_BASED.id
        );
    }, [selectedElements]);

    const allowsReplaceContingencyWithScript = useCallback(() => {
        return (
            selectedElements.length === 1 &&
            selectedElements[0].type === ElementType.CONTINGENCY_LIST &&
            selectedElements[0].subtype ===
                ContingencyListType.CRITERIA_BASED.id &&
            isUserAllowed()
        );
    }, [isUserAllowed, selectedElements]);

    const buildMenu = () => {
        if (selectedElements.length === 0) {
            return;
        }

        // build menuItems here
        let menuItems = [];

        if (allowsRename()) {
            menuItems.push({
                messageDescriptorId: 'rename',
                callback: () => {
                    handleOpenDialog(DialogsId.RENAME);
                },
            });
        }

        if (allowsMove()) {
            menuItems.push({
                messageDescriptorId: 'move',
                callback: () => {
                    handleOpenDialog(DialogsId.MOVE);
                },
                icon: <DriveFileMoveIcon fontSize="small" />,
                withDivider: true,
            });
        }

        if (allowsCreateNewStudyFromCase()) {
            menuItems.push({
                messageDescriptorId: 'createNewStudyFromImportedCase',
                callback: () => {
                    handleOpenDialog(DialogsId.ADD_NEW_STUDY_FROM_CASE);
                },
                icon: <PhotoLibrary fontSize="small" />,
            });
        }

        if (allowsDuplicate()) {
            menuItems.push({
                messageDescriptorId: 'duplicate',
                callback: () => {
                    duplicateItem();
                },
                icon: <ContentCopy fontSize="small" />,
            });
        }

        if (allowsDelete()) {
            menuItems.push({
                messageDescriptorId: 'delete',
                callback: () => {
                    handleOpenDialog(DialogsId.DELETE);
                },
                icon: <DeleteIcon fontSize="small" />,
                withDivider: true,
            });
        }

        if (allowsCopyContingencyToScript()) {
            menuItems.push({ isDivider: true });
            menuItems.push({
                messageDescriptorId: 'copyToScript',
                callback: () => {
                    handleOpenDialog(
                        DialogsId.COPY_FILTER_TO_SCRIPT_CONTINGENCY
                    );
                },
                icon: <FileCopyIcon fontSize="small" />,
            });
        }

        if (allowsReplaceContingencyWithScript()) {
            menuItems.push({
                messageDescriptorId: 'replaceWithScript',
                callback: () => {
                    handleOpenDialog(
                        DialogsId.REPLACE_FILTER_BY_SCRIPT_CONTINGENCY
                    );
                },
                icon: <InsertDriveFileIcon fontSize="small" />,
            });
        }

        if (menuItems.length === 0) {
            menuItems.push({
                messageDescriptorId: isNotUploadingElement()
                    ? 'notElementCreator'
                    : 'uploadingElement',
                icon: <DoNotDisturbAltIcon fontSize="small" />,
                disabled: true,
            });
        }

        return menuItems;
    };

    const renderDialog = () => {
        switch (openDialog) {
            case DialogsId.RENAME:
                return (
                    <RenameDialog
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={(elementName) =>
                            renameCB(activeElement?.elementUuid, elementName)
                        }
                        title={intl.formatMessage({ id: 'renameElement' })}
                        message={'renameElementMsg'}
                        currentName={
                            activeElement ? activeElement.elementName : ''
                        }
                        type={activeElement ? activeElement.type : ''}
                        error={renameState.errorMessage}
                    />
                );
            case DialogsId.DELETE:
                return (
                    <DeleteDialog
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={() =>
                            deleteCB(
                                selectedElements.map((e) => {
                                    return [e.elementUuid];
                                })
                            )
                        }
                        items={selectedElements}
                        multipleDeleteFormatMessageId={
                            'deleteMultipleItemsDialogMessage'
                        }
                        simpleDeleteFormatMessageId={'deleteItemDialogMessage'}
                        error={multipleDeleteError}
                    />
                );
            case DialogsId.MOVE:
                return (
                    <MoveDialog
                        open={true}
                        onClose={(selectedDir) => {
                            if (selectedDir.length > 0) {
                                moveCB(
                                    selectedElements.map((element) => {
                                        return [
                                            element.elementUuid,
                                            selectedDir[0].id,
                                        ];
                                    })
                                );
                            }
                            handleCloseDialog();
                        }}
                        items={selectedElements}
                    />
                );
            case DialogsId.REPLACE_FILTER_BY_SCRIPT_CONTINGENCY:
                return (
                    <ReplaceWithScriptDialog
                        id={activeElement ? activeElement.elementUuid : ''}
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={(id) =>
                            replaceFormContingencyListWithScriptCB(
                                id,
                                selectedDirectory?.elementUuid
                            )
                        }
                        onError={handleLastError}
                        title={intl.formatMessage({ id: 'replaceList' })}
                    />
                );
            case DialogsId.COPY_FILTER_TO_SCRIPT_CONTINGENCY:
                return (
                    <CopyToScriptDialog
                        id={activeElement ? activeElement.elementUuid : ''}
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={(id, newName) =>
                            newScriptFromFiltersContingencyListCB(
                                id,
                                newName,
                                selectedDirectory?.elementUuid
                            )
                        }
                        currentName={
                            activeElement ? activeElement.elementName : ''
                        }
                        title={intl.formatMessage({
                            id: 'copyToScriptList',
                        })}
                    />
                );
            case DialogsId.REPLACE_FILTER_BY_SCRIPT:
                return (
                    <ReplaceWithScriptDialog
                        id={activeElement ? activeElement.elementUuid : ''}
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={(id) =>
                            FiltersReplaceWithScriptCB(
                                id,
                                selectedDirectory?.elementUuid
                            )
                        }
                        title={intl.formatMessage({ id: 'replaceList' })}
                    />
                );
            case DialogsId.COPY_FILTER_TO_SCRIPT:
                return (
                    <CopyToScriptDialog
                        id={activeElement ? activeElement.elementUuid : ''}
                        open={true}
                        onClose={handleCloseDialog}
                        onClick={(id, newName) =>
                            newScriptFromFilterCB(
                                id,
                                newName,
                                selectedDirectory?.elementUuid
                            )
                        }
                        currentName={
                            activeElement ? activeElement.elementName : ''
                        }
                        title={intl.formatMessage({ id: 'copyToScriptList' })}
                    />
                );
            case DialogsId.ADD_NEW_STUDY_FROM_CASE:
                return (
                    <CreateStudyDialog
                        open={true}
                        onClose={handleCloseDialog}
                        providedExistingCase={activeElement}
                    />
                );
            default:
                return null;
        }
    };
    return (
        <>
            {open && (
                <CommonContextualMenu
                    {...others}
                    menuItems={buildMenu()}
                    open={open && !hideMenu}
                    onClose={onClose}
                />
            )}
            {renderDialog()}

            <iframe
                id={DownloadIframe}
                name={DownloadIframe}
                title={DownloadIframe}
                style={{ display: 'none' }}
            />
        </>
    );
};

ContentContextualMenu.propTypes = {
    onClose: PropTypes.func,
};

export default ContentContextualMenu;
