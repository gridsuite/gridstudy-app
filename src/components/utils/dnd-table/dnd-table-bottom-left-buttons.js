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
import ReplayIcon from '@mui/icons-material/Replay';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

const DndTableBottomLeftButtons = ({
    handleUploadButton,
    uploadButtonMessageId,
    handleResetButton,
    resetButtonMessageId,
    withResetButton,
    disableUploadButton,
    disabled,
}) => {
    const intl = useIntl();

    return (
        <Grid container item xs spacing={1}>
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
                            disabled={disabled || disableUploadButton}
                        >
                            <UploadIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Grid>
            {withResetButton && (
                <Grid item>
                    <Tooltip
                        title={intl.formatMessage({
                            id: resetButtonMessageId,
                        })}
                        placement="top"
                    >
                        <span>
                            <IconButton
                                color="primary"
                                onClick={() => handleResetButton()}
                                disabled={disabled}
                            >
                                <ReplayIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
            )}
        </Grid>
    );
};

DndTableBottomLeftButtons.prototype = {
    handleUploadButton: PropTypes.func.isRequired,
    uploadButtonMessageId: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

export default DndTableBottomLeftButtons;
