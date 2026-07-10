/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useState } from 'react';
import { Box, DialogContentText, IconButton, Theme } from '@mui/material';
import { Close, Minimize, PushPin, PushPinOutlined, Fullscreen, FullscreenExit } from '@mui/icons-material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import { useWorkspacePanelActions } from '../hooks/use-workspace-panel-actions';
import { PanelType } from '../types/workspace.types';
import { getPanelConfig } from '../constants/workspace.constants';
import type { AppState } from '../../../redux/reducer.type';
import { SldAssociationButton } from './sld-association-button';
import { setDirtyComputationParameters } from 'redux/actions';
import { SelectOptionsDialog } from 'utils/dialogs';

const getHeaderStyles = (theme: Theme, isFocused: boolean, maximized: boolean) => {
    let backgroundColor: string;
    let border: string;
    if (theme.palette.mode === 'light') {
        backgroundColor = isFocused ? theme.palette.grey[200] : 'white';
        border = `1px solid ${theme.palette.grey[500]}`;
    } else {
        backgroundColor = '#292e33';
        border =
            isFocused && !maximized ? `1px solid ${theme.palette.grey[100]}` : `1px solid ${theme.palette.grey[800]}`;
    }

    return {
        paddingLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        backgroundColor,
        border,
        borderRadius: theme.spacing(2) + ' ' + theme.spacing(2) + ' 0 0',
        borderBottom: 'none',
        cursor: 'grab',
        userSelect: 'none',
        '&:active': {
            cursor: 'grabbing',
        },
    };
};

const styles = {
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexShrink: 1,
        minWidth: 0,
    },
    titleContent: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        overflow: 'hidden',
        minWidth: 0,
    },
    titleText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.75rem',
    },
    headerActions: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    iconButton: {
        visibility: 'hidden',
    },
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

interface PanelHeaderProps {
    panelId: UUID;
    title: string;
    panelType: PanelType;
    pinned: boolean;
    maximized: boolean;
    isFocused: boolean;
}

export const PanelHeader = memo(({ panelId, title, panelType, pinned, maximized, isFocused }: PanelHeaderProps) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const { deletePanel, minimizePanel, maximizePanel, pinPanel } = useWorkspacePanelActions();
    const displayTitle = intl.messages[title] ? intl.formatMessage({ id: title }) : title || '';
    const isDirtyComputationParameters = useSelector((state: AppState) => state.isDirtyComputationParameters);
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

    const handleClose = () => {
        if (panelType === PanelType.PARAMETERS && isDirtyComputationParameters) {
            setIsConfirmCloseOpen(true);
        } else if (
            panelType === PanelType.NAD ||
            panelType === PanelType.SLD_VOLTAGE_LEVEL ||
            panelType === PanelType.SLD_SUBSTATION
        ) {
            deletePanel(panelId);
        } else {
            minimizePanel(panelId);
        }
    };

    const handleConfirmClose = useCallback(() => {
        minimizePanel(panelId);
        dispatch(setDirtyComputationParameters(false));
        setIsConfirmCloseOpen(false);
    }, [panelId, minimizePanel, dispatch]);

    const handleCancelClose = useCallback(() => {
        setIsConfirmCloseOpen(false);
    }, []);

    return (
        <Box className="panel-header" sx={(theme) => getHeaderStyles(theme, isFocused, maximized)}>
            <Box sx={styles.title}>
                <Box sx={styles.titleContent}>
                    {getPanelConfig(panelType).icon}
                    <OverflowableText text={displayTitle} sx={styles.titleText} tooltipSx={styles.tooltip} />
                </Box>
            </Box>
            <Box sx={styles.headerActions}>
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => pinPanel(panelId)}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {pinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                </IconButton>
                {panelType === PanelType.SLD_VOLTAGE_LEVEL && (
                    <SldAssociationButton panelId={panelId} title={title} iconButtonStyles={styles.iconButton} />
                )}
                {(panelType === PanelType.SLD_VOLTAGE_LEVEL ||
                    panelType === PanelType.SLD_SUBSTATION ||
                    panelType === PanelType.NAD) && (
                    <IconButton
                        className="panel-header-close-button"
                        size="small"
                        sx={styles.iconButton}
                        onClick={() => minimizePanel(panelId)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Minimize fontSize="small" />
                    </IconButton>
                )}
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => maximizePanel(panelId)}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {maximized ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </IconButton>
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={handleClose}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={pinned}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Box>
            {/* Confirm panel close with unsaved params */}
            <SelectOptionsDialog
                title={''}
                open={isConfirmCloseOpen}
                onClose={handleCancelClose}
                onClick={handleConfirmClose}
                child={
                    <DialogContentText>
                        <FormattedMessage id="genericConfirmQuestion" />
                    </DialogContentText>
                }
                validateKey={'dialog.button.leave'}
            />
        </Box>
    );
});
