/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { ElementCreationDialog, ElementType, IElementCreationDialog } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import SaveIcon from '@mui/icons-material/Save';
import { Theme, Tooltip } from '@mui/material';
import { AppState } from 'redux/reducer';
import { FormattedMessage } from 'react-intl';

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
    icon: {
        fontSize: 'medium',
    },
};

interface DiagramControlsProps {
    onSave?: (data: IElementCreationDialog) => void;
    onLoad?: (nadConfigId: string) => void;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({ onSave, onLoad }) => {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const handleCloseDialog = () => {
        setIsSaveDialogOpen(false);
    };

    const handleClickSaveIcon = () => {
        setIsSaveDialogOpen(true);
    };

    const handleSave = (data: IElementCreationDialog) => {
        if (onSave) {
            onSave(data);
        }
    };

    const handleLoad = (nadConfigId: string) => {
        // UUID d'un NAD sauvegardé en base : 8ce6a253-3cc4-4000-bd82-215c2581bdd0
        const temporaryNadUuid = '8ce6a253-3cc4-4000-bd82-215c2581bdd0';
        console.error('CHARLY try to load NadConfig ' + temporaryNadUuid);
        if (onLoad) {
            onLoad(temporaryNadUuid);
        }
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
                        <IconButton sx={styles.actionIcon} onClick={handleLoad}>
                            <UploadIcon sx={styles.icon} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            {studyUuid && (
                <ElementCreationDialog
                    studyUuid={studyUuid}
                    onClose={handleCloseDialog}
                    onSave={handleSave}
                    open={isSaveDialogOpen}
                    type={ElementType.DIAGRAM_CONFIG}
                    titleId={'SaveToGridexplore'}
                />
            )}
        </>
    );
};

export default DiagramControls;
