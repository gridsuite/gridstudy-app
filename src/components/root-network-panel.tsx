/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { Paper, Box, Theme } from '@mui/material';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import RootNetworkNodeEditor from './graph/menus/root-network-node-editor';

const styles = {
    paper: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: '300px',
        minHeight: '300px',
        borderRadius: '8px',
        zIndex: 10,
        overflow: 'hidden',
    },
    contentBox: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    header: (theme: Theme) => ({
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    }),
    rootNameTitle: (theme: Theme) => ({
        flexGrow: 1,
        fontWeight: 'bold',
        marginLeft: theme.spacing(2),
    }),
};
const RootNetworkPanel: FunctionComponent = () => {
    const intl = useIntl();

    return (
        <Paper elevation={3} sx={styles.paper}>
            <Box sx={styles.header}>
                <OverflowableText text={intl.formatMessage({ id: 'root' })} sx={styles.rootNameTitle} />
            </Box>
            <RootNetworkNodeEditor />
        </Paper>
    );
};

export default RootNetworkPanel;
