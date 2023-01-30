/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';

const TooltipIconButton = ({ className, toolTip, onClick, children }) => {
    return (
        <Tooltip title={toolTip}>
            <IconButton
                size={'medium'}
                className={className}
                onClick={onClick}
                children={children}
            />
        </Tooltip>
    );
};

TooltipIconButton.propTypes = {
    className: PropTypes.string,
    toolTip: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.node,
};

export default TooltipIconButton;
