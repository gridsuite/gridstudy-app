/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import EditIcon from '@mui/icons-material/Edit';

import IconButton from '@mui/material/IconButton';
import { Toolbar, Tooltip } from '@mui/material';

const styles = {
    icon: (theme) => ({
        marginRight: theme.spacing(1),
        width: '18px',
        height: '18px',
    }),
};

/**
 * Generic CommonToolbar
 * @param {Array} items Action items to add in the toolbar as buttons
 */
const CommonToolbar = (props) => {
    const { items, ...others } = props;

    function makeToolbarButton(
        key,
        tooltipTextId,
        callback,
        disabledItem,
        icon = <EditIcon fontSize="small" />
    ) {
        return (
            <Tooltip
                title={<FormattedMessage id={tooltipTextId} />}
                key={key}
                placement="right"
            >
                {/* to make tooltips works with disabled buttons, add a simple wrapper span */}
                <span>
                    <IconButton
                        sx={styles.icon}
                        onClick={() => callback()}
                        size="large"
                        disabled={disabledItem}
                    >
                        {icon}
                    </IconButton>
                </span>
            </Tooltip>
        );
    }

    return (
        <Toolbar {...others}>
            {items.map((item, index) => {
                return makeToolbarButton(
                    index,
                    item.tooltipTextId,
                    item.callback,
                    item.disabled,
                    item.icon
                );
            })}
        </Toolbar>
    );
};

CommonToolbar.propTypes = {
    items: PropTypes.array,
};

export default CommonToolbar;
