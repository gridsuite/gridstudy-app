/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Divider, Grid, LinearProgress, Stack, ButtonGroup, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UploadIcon from '@mui/icons-material/Upload';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import {LabelledButton, SubmitButton} from '@gridsuite/commons-ui';
interface ParameterLayoutProps {
    children: ReactNode;
    title?: string;
    header?: ReactNode;
    isLoading?: boolean;
    contentSx?: any;
    preFillOnClick?: React.MouseEventHandler<HTMLButtonElement>;
    resetOnClick?:React.MouseEventHandler<HTMLButtonElement>;
    saveOnClick?: React.MouseEventHandler<HTMLButtonElement>;
    validateOnClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const styles = {
    stack: {
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    header: {
        flexShrink: 0,
    },
    content: {
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0, // Critical for flex-grow with overflow
    },
    footer: {
        flexShrink: 0,
        p: 1,
    },
} as const;

export function ParameterLayout({ children, title, header, isLoading, contentSx, preFillOnClick, resetOnClick, saveOnClick, validateOnClick }: Readonly<ParameterLayoutProps>) {
    return (
        <Stack sx={styles.stack}>
            <Box>
                <Grid
                    container justifyContent="space-between" sx={{alignItems: 'center'}}>
                <Grid item xs={3} >
                    <FormattedMessage id={title} />
                </Grid>
                <Grid item xs="auto">
                    <ButtonGroup >
                        {preFillOnClick && (<Button onClick={preFillOnClick} startIcon={<UploadIcon />}>PREFILL</Button>)}
                        {resetOnClick && (<Button onClick={resetOnClick} startIcon={<RestartAltIcon />}>RESET</Button>)}
                    </ButtonGroup>
                </Grid>
                </Grid>
            </Box>
            {header && <Box sx={styles.header}>{header}</Box>}
            <Box sx={[styles.content, contentSx]}>{isLoading ? <LinearProgress /> : children}</Box>
                <Box sx={styles.footer}>
                    {saveOnClick && (<LabelledButton
                        label="save"
                        data-testid="LfSaveButton"
                        callback={saveOnClick}
                    />)}
                    {validateOnClick && (<SubmitButton
                        variant="contained"
                        data-testid="LfValidateButton"
                        onClick={validateOnClick}
                    >
                        <FormattedMessage id="validate" />
                    </SubmitButton>)}
                </Box>
        </Stack>
    );
}
