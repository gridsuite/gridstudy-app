/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Tooltip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { darken, lighten } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer';
import NetworkModificationNodeDialog from './network-modification-node-dialog';
import { NodeType } from 'components/graph/tree-node.type';
import { useIntl } from 'react-intl';

const styles = {
    header: (theme) => ({
        padding: theme.spacing(1),
        color: theme.palette.getContrastText(
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2)
        ),
        display: 'flex',
        alignItems: 'center',
    }),
    buttonTitle: {
        textTransform: 'none',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        minWidth: 0,
        maxWidth: '100%',
    },

    nodeNameText: {
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        maxWidth: '100%',
    },

    titleContainer: {
        flexGrow: 1,
        overflow: 'hidden',
    },
    accordion: (theme) => ({
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[900],
        marginRight: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        width: '100%',
        boxSizing: 'border-box',
    }),
    accordionSummary: (theme) => ({
        minHeight: 0,
        '&.Mui-expanded .MuiTypography-root': {
            color: theme.palette.text.secondary,
        },
    }),
    topographySummary: {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'pre-wrap',
    },
    accordionDetails: {
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        paddingTop: 0,
        maxHeight: 200,
        overflowY: 'auto',
    },
} as const satisfies MuiStyles;

export const NodeEditorHeader = () => {
    const intl = useIntl();
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const currentTreeNode = useSelector((state: AppState) => state.currentTreeNode);
    const label = currentTreeNode?.data?.label ?? '';
    const description = currentTreeNode?.data?.description ?? '';
    const descriptionByLine = useMemo(() => description.split(/\r?\n/), [description]);
    const isRootNode = currentTreeNode?.type === NodeType.ROOT;
    const displayedLabel = isRootNode ? intl.formatMessage({ id: 'root' }) : label;

    return (
        <>
            <Box sx={styles.header}>
                <Box sx={styles.titleContainer}>
                    <Tooltip title={displayedLabel}>
                        <span>
                            <Button
                                size="small"
                                onClick={() => setOpenEditDialog(true)}
                                disabled={isRootNode}
                                sx={styles.buttonTitle}
                            >
                                <Typography sx={styles.nodeNameText}>{displayedLabel}</Typography>
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                <NetworkModificationNodeDialog
                    open={openEditDialog}
                    onClose={() => setOpenEditDialog(false)}
                    titleId="editNode"
                />
            </Box>

            {description && (
                <Box sx={{ marginRight: 1, marginBottom: 1 }}>
                    <Accordion disableGutters elevation={0} sx={styles.accordion}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
                            <Typography sx={styles.topographySummary}>
                                {/*
                                    whiteSpace: 'pre-wrap' +  textOverflow: 'ellipsis' + WebkitLineClamp: 1
                                    those css rules do not combine as we expect, last word is cut by ellipsis even if the line is not very long
                                    this is why we deal with this with JS instead
                                */}
                                {descriptionByLine[0]}
                                {descriptionByLine.length > 1 ? '…' : undefined}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={styles.accordionDetails}>
                            <Typography sx={{ wordBreak: 'break-word' }}>{description}</Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            )}
        </>
    );
};
