/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import {
    ElementCreationDialog,
    ElementType,
    IElementCreationDialog,
    mergeSx,
    OverflowableText,
} from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import MinimizeIcon from '@mui/icons-material/Minimize';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { stopDiagramBlink } from '../../redux/actions';
import { Theme, Tooltip } from '@mui/material';
import { AppState } from 'redux/reducer';
import { FormattedMessage } from 'react-intl';
import { DiagramType } from './diagram-common';
import { createDiagramConfig } from '../../services/explore';
import { getNadIdentifier } from './diagram-utils';

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
        right: theme.spacing(1),
    }),
    icon: {
        fontSize: 'medium',
    },
};

interface DiagramControlsProps {
    showSaveControl?: boolean;
    handleSave?: () => void;
    showVisibilityControl?: boolean;
    onVisibilityToggle?: () => void;
    defaultVisiblity?: boolean;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
    showSaveControl = false,
    handleSave,
    showVisibilityControl = false,
    onVisibilityToggle,
    defaultVisiblity = true,
}) => {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [visibility, setVisiblity] = useState(defaultVisiblity);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const handleCloseDialog = () => {
        setIsSaveDialogOpen(false);
    };

    const handleClickSaveIcon = () => {
        setIsSaveDialogOpen(true);
    };

    const handleVisibility = () => {
        const newVisiblity = !visibility;
        setVisiblity(newVisiblity);
        if (onVisibilityToggle) {
            onVisibilityToggle(newVisiblity);
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
                        flexDirection: 'column',
                    }}
                >
                    {showSaveControl && (
                        <Tooltip title={<FormattedMessage id={'SaveToGridexplore'} />}>
                            <IconButton sx={styles.actionIcon} onClick={handleClickSaveIcon}>
                                <SaveIcon sx={styles.icon} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {showVisibilityControl && (
                        <Tooltip title={<FormattedMessage id={visibility ? 'hideLabels' : 'showLabels'} />}>
                            <IconButton sx={styles.actionIcon} onClick={handleVisibility}>
                                {visibility && <VisibilityOffIcon sx={styles.icon} />}
                                {!visibility && <VisibilityIcon sx={styles.icon} />}
                            </IconButton>
                        </Tooltip>
                    )}
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
