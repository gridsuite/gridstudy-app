/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import DeleteIcon from '@mui/icons-material/Delete';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';

import CreateStudyForm from '../dialogs/create-study-dialog/create-study-dialog';
import CreateDirectoryDialog from '../dialogs/create-directory-dialog';
import RenameDialog from '../dialogs/rename-dialog';
import AccessRightsDialog from '../dialogs/access-rights-dialog';
import DeleteDialog from '../dialogs/delete-dialog';
import FilterCreationDialog from '../dialogs/filter/filter-creation-dialog';

import { DialogsId } from '../../utils/UIconstants';

import {
    deleteElement,
    insertDirectory,
    insertRootDirectory,
    renameElement,
    updateAccessRights,
} from '../../utils/rest-api';

import CommonContextualMenu from './common-contextual-menu';
import { useDeferredFetch } from '../../utils/custom-hooks';
import { ElementType } from '../../utils/elementType';
import ContingencyListCreationDialog from '../dialogs/contingency-list/creation/contingency-list-creation-dialog';
import CreateCaseDialog from '../dialogs/create-case-dialog/create-case-dialog';

const DirectoryTreeContextualMenu = (props) => {
    const { directory, open, onClose, openDialog, setOpenDialog, ...others } =
        props;
    const userId = useSelector((state) => state.user.profile.sub);

    const intl = useIntl();

    const [hideMenu, setHideMenu] = useState(false);

    const handleOpenDialog = (dialogId) => {
        setHideMenu(true);
        setOpenDialog(dialogId);
    };

    const handleCloseDialog = (e, nextSelectedDirectoryId = null) => {
        onClose(e, nextSelectedDirectoryId);
        setOpenDialog(DialogsId.NONE);
        setHideMenu(false);
    };

    const [deleteCB, deleteState] = useDeferredFetch(
        deleteElement,
        () => handleCloseDialog(null, directory?.parentUuid),
        (HTTPStatusCode) => {
            if (HTTPStatusCode === 403) {
                return intl.formatMessage({ id: 'deleteDirectoryError' });
            }
        },
        undefined,
        false
    );

    const [renameCB, renameState] = useDeferredFetch(
        renameElement,
        () => handleCloseDialog(null, null),
        (HTTPStatusCode) => {
            if (HTTPStatusCode === 403) {
                return intl.formatMessage({ id: 'renameDirectoryError' });
            }
        },
        undefined,
        false
    );

    const [insertDirectoryCB, insertDirectoryState] = useDeferredFetch(
        insertDirectory,
        (response) => handleCloseDialog(null, response?.elementUuid)
    );

    const [insertRootDirectoryCB, insertRootDirectoryState] = useDeferredFetch(
        insertRootDirectory,
        (response) => handleCloseDialog(null, response?.elementUuid)
    );

    const [updateAccessRightsCB, updateAccessRightsState] = useDeferredFetch(
        updateAccessRights,
        () => handleCloseDialog(null, null),
        (HTTPStatusCode) => {
            if (HTTPStatusCode === 403) {
                return intl.formatMessage({
                    id: 'modifyDirectoryAccessRightsError',
                });
            }
        },
        undefined,
        false
    );

    // Allowance
    const showMenuFromEmptyZone = useCallback(() => {
        return !directory;
    }, [directory]);

    const isAllowed = useCallback(() => {
        return directory && directory.owner === userId;
    }, [directory, userId]);

    const buildMenu = () => {
        // build menuItems here
        let menuItems = [];

        if (!showMenuFromEmptyZone()) {
            menuItems.push(
                {
                    messageDescriptorId: 'createNewStudy',
                    callback: () => {
                        handleOpenDialog(DialogsId.ADD_NEW_STUDY);
                    },
                    icon: <AddIcon fontSize="small" />,
                },
                {
                    messageDescriptorId: 'createNewContingencyList',
                    callback: () => {
                        handleOpenDialog(DialogsId.ADD_NEW_CONTINGENCY_LIST);
                    },
                    icon: <AddIcon fontSize="small" />,
                },
                {
                    messageDescriptorId: 'createNewFilter',
                    callback: () => {
                        handleOpenDialog(DialogsId.ADD_NEW_FILTER);
                    },
                    icon: <AddIcon fontSize="small" />,
                },
                {
                    messageDescriptorId: 'ImportNewCase',
                    callback: () => {
                        handleOpenDialog(DialogsId.ADD_NEW_CASE);
                    },
                    icon: <AddIcon fontSize="small" />,
                }
            );

            menuItems.push({ isDivider: true });

            if (isAllowed()) {
                menuItems.push(
                    {
                        messageDescriptorId: 'renameFolder',
                        callback: () => {
                            handleOpenDialog(DialogsId.RENAME_DIRECTORY);
                        },
                        icon: <CreateIcon fontSize="small" />,
                    },
                    {
                        messageDescriptorId: 'accessRights',
                        callback: () => {
                            handleOpenDialog(DialogsId.ACCESS_RIGHTS);
                        },
                        icon: <BuildIcon fontSize="small" />,
                    },
                    {
                        messageDescriptorId: 'deleteFolder',
                        callback: () => {
                            handleOpenDialog(DialogsId.DELETE_DIRECTORY);
                        },
                        icon: <DeleteIcon fontSize="small" />,
                    },
                    { isDivider: true }
                );
            }

            menuItems.push({
                messageDescriptorId: 'createFolder',
                callback: () => {
                    handleOpenDialog(DialogsId.ADD_DIRECTORY);
                },
                icon: <CreateNewFolderIcon fontSize="small" />,
            });
        }

        menuItems.push({
            messageDescriptorId: 'createRootFolder',
            callback: () => {
                handleOpenDialog(DialogsId.ADD_ROOT_DIRECTORY);
            },
            icon: <FolderSpecialIcon fontSize="small" />,
        });

        return menuItems;
    };

    const renderDialog = () => {
        switch (openDialog) {
            case DialogsId.ADD_NEW_STUDY:
                return (
                    <CreateStudyForm open={true} onClose={handleCloseDialog} />
                );
            case DialogsId.ADD_NEW_CONTINGENCY_LIST:
                return (
                    <ContingencyListCreationDialog
                        open={true}
                        titleId={'createNewContingencyList'}
                        onClose={handleCloseDialog}
                    />
                );
            case DialogsId.ADD_DIRECTORY:
                return (
                    <CreateDirectoryDialog
                        open={true}
                        onClick={(elementName, isPrivate) =>
                            insertDirectoryCB(
                                elementName,
                                directory?.elementUuid,
                                isPrivate,
                                userId
                            )
                        }
                        onClose={handleCloseDialog}
                        title={intl.formatMessage({
                            id: 'insertNewDirectoryDialogTitle',
                        })}
                        parentDirectory={directory?.elementUuid}
                        error={insertDirectoryState?.errorMessage}
                    />
                );
            case DialogsId.ADD_ROOT_DIRECTORY:
                return (
                    <CreateDirectoryDialog
                        open={true}
                        onClick={(elementName, isPrivate) =>
                            insertRootDirectoryCB(
                                elementName,
                                isPrivate,
                                userId
                            )
                        }
                        onClose={handleCloseDialog}
                        title={intl.formatMessage({
                            id: 'insertNewRootDirectoryDialogTitle',
                        })}
                        error={insertRootDirectoryState?.errorMessage}
                    />
                );
            case DialogsId.RENAME_DIRECTORY:
                return (
                    <RenameDialog
                        message={'renameElementMsg'}
                        currentName={directory?.elementName}
                        open={true}
                        onClick={(newName) =>
                            renameCB(directory?.elementUuid, newName)
                        }
                        onClose={handleCloseDialog}
                        title={intl.formatMessage({
                            id: 'renameDirectoryDialogTitle',
                        })}
                        error={renameState.errorMessage}
                        type={ElementType.DIRECTORY}
                        parentDirectory={directory?.parentUuid}
                    />
                );
            case DialogsId.DELETE_DIRECTORY:
                return (
                    <DeleteDialog
                        items={directory ? [directory] : []}
                        multipleDeleteFormatMessageId={
                            'deleteMultipleDirectoriesDialogMessage'
                        }
                        simpleDeleteFormatMessageId={
                            'deleteDirectoryDialogMessage'
                        }
                        open={true}
                        onClick={() => deleteCB(directory?.elementUuid)}
                        onClose={handleCloseDialog}
                        error={deleteState.errorMessage}
                    />
                );
            case DialogsId.ACCESS_RIGHTS:
                return (
                    <AccessRightsDialog
                        isPrivate={directory?.accessRights?.isPrivate}
                        open={true}
                        onClick={(isPrivate) =>
                            updateAccessRightsCB(
                                directory?.elementUuid,
                                isPrivate
                            )
                        }
                        onClose={handleCloseDialog}
                        title={intl.formatMessage({
                            id: 'accessRights',
                        })}
                        error={updateAccessRightsState.errorMessage}
                    />
                );
            case DialogsId.ADD_NEW_FILTER:
                return (
                    <FilterCreationDialog
                        open={true}
                        onClose={handleCloseDialog}
                    />
                );
            case DialogsId.ADD_NEW_CASE:
                return (
                    <CreateCaseDialog open={true} onClose={handleCloseDialog} />
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
        </>
    );
};

DirectoryTreeContextualMenu.propTypes = {
    onClose: PropTypes.func,
};

export default DirectoryTreeContextualMenu;
