/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import {
    DirectoryItemSelector,
    ElementSaveDialog,
    ElementType,
    IElementCreationDialog,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { Theme, Tooltip } from '@mui/material';
import { AppState } from 'redux/reducer';
import { FormattedMessage, useIntl } from 'react-intl';
import { setEditNadMode } from 'redux/actions';

const styles = {
    actionIcon: (theme: Theme) => ({
        width: theme.spacing(3),
        height: theme.spacing(3),
    }),
    panel: (theme: Theme) => ({
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        display: 'block',
        position: 'absolute',
        top: theme.spacing(1),
        left: theme.spacing(1),
    }),
    buttonPanel: (theme: Theme) => ({
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0.5),
        display: 'block',
        position: 'absolute',
        top: '5px',
        right: '5px',
    }),
    icon: {
        fontSize: 'medium',
    },
    button: {
        minWidth: 'auto',
    },
};

interface DiagramControlsProps {
    onSave?: (data: IElementCreationDialog) => void;
    onLoad?: (nadConfigId: string, nadName: string) => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({ onSave, onLoad }) => {
    const intl = useIntl();
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isEditMode = useSelector((state: AppState) => state.isEditMode);
    const dispatch = useDispatch();

    const handleCloseSaveDialog = () => {
        setIsSaveDialogOpen(false);
    };

    const handleClickSaveIcon = () => {
        setIsSaveDialogOpen(true);
    };

    const handleCloseLoadSelector = () => {
        setIsLoadSelectorOpen(false);
    };

    const handleClickLoadIcon = () => {
        setIsLoadSelectorOpen(true);
    };

    const handleSave = (data: IElementCreationDialog) => {
        if (onSave) {
            onSave(data);
        }
    };

    const handleLoad = (nadConfigId: string, nadName: string) => {
        if (onLoad) {
            onLoad(nadConfigId, nadName);
        }
    };

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0) {
            handleLoad(selectedElements[0].id, selectedElements[0].name);
        }
        handleCloseLoadSelector();
    };

    const handleToggleEditMode = () => {
        dispatch(setEditNadMode(!isEditMode));
    };

    /**
     * RENDER
     */

    return (
        <>
            <Box sx={styles.panel}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <Tooltip title={<FormattedMessage id={'SaveToGridexplore'} />}>
                        <IconButton sx={styles.actionIcon} onClick={handleClickSaveIcon}>
                            <SaveIcon sx={styles.icon} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id={'GenerateFromGridexplore'} />}>
                        <IconButton sx={styles.actionIcon} onClick={handleClickLoadIcon}>
                            <UploadIcon sx={styles.icon} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box sx={styles.buttonPanel}>
                <Button size="small" sx={styles.button} onClick={handleToggleEditMode}>
                    <FormattedMessage id={isEditMode ? 'save' : 'EditNad'} />
                </Button>
            </Box>
            {studyUuid && (
                <>
                    <ElementSaveDialog
                        studyUuid={studyUuid}
                        onClose={handleCloseSaveDialog}
                        onSave={handleSave}
                        open={isSaveDialogOpen}
                        type={ElementType.DIAGRAM_CONFIG}
                        titleId={'SaveToGridexplore'}
                        createOnlyMode
                    />
                    <Box minWidth="12em">
                        <DirectoryItemSelector
                            open={isLoadSelectorOpen}
                            onClose={selectElement}
                            types={[ElementType.DIAGRAM_CONFIG]}
                            title={intl.formatMessage({
                                id: 'GenerateFromGridexplore',
                            })}
                            multiSelect={false}
                        />
                    </Box>
                </>
            )}
        </>
    );
};

export default DiagramControls;
