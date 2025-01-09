/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { EditableTitle } from './editable-title';
import { Box, Theme } from '@mui/material';
import { AppState } from '../../../redux/reducer';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useSelector } from 'react-redux';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

const styles = {
    paper: () => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
    }),
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

const RootNetworkEditor = () => {
    const intl = useIntl();

    return (
        <Box sx={styles.paper}>
            <Box sx={styles.header}>
                <OverflowableText text={intl.formatMessage({ id: 'root' })} sx={styles.rootNameTitle} />
            </Box>
            <RootNetworkNodeEditor />
        </Box>
    );
};

RootNetworkEditor.propTypes = {
    className: PropTypes.string,
};

export default RootNetworkEditor;
