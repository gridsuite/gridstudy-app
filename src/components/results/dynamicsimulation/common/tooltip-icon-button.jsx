/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';

const TooltipIconButton = ({ toolTip, onClick, children, disabled, ...props }) => {
    return (
        <Tooltip title={toolTip}>
            <span>
                <IconButton size={'medium'} onClick={onClick} children={children} disabled={disabled} {...props} />
            </span>
        </Tooltip>
    );
};

TooltipIconButton.propTypes = {
    toolTip: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node,
    disabled: PropTypes.bool,
};

export default TooltipIconButton;
