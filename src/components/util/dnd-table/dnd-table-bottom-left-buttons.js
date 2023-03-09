/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

const DndTableButtons = ({
    handleUploadButton,
    uploadButtonMessageId,
    disabled,
}) => {
    const intl = useIntl();

    return (
        <Grid container item spacing={1} xs={6}>
            <Grid item>
                <Tooltip
                    title={intl.formatMessage({
                        id: uploadButtonMessageId,
                    })}
                    placement="top"
                >
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => handleUploadButton()}
                            disabled={disabled}
                        >
                            <UploadIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
    );
};

DndTableButtons.prototype = {
    handleUploadButton: PropTypes.func.isRequired,
    uploadButtonMessageId: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

export default DndTableButtons;
