/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Chip, Tooltip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

export interface ChipCellRendererProps {
    isActivated: boolean;
    label: string;
    onClick: () => void;
    isDisabled?: boolean;
}

export const ChipCellRenderer = (props: ChipCellRendererProps) => {
    const { isActivated, label, onClick, isDisabled } = props;

    return (
        <Tooltip title={label} arrow>
            <span>
                <Chip
                    label={label}
                    deleteIcon={isActivated ? <CheckCircleOutlineIcon /> : <CancelIcon />}
                    color="primary"
                    size="small"
                    variant={isActivated ? 'filled' : 'outlined'}
                    onDelete={onClick}
                    onClick={onClick}
                    disabled={isDisabled}
                />
            </span>
        </Tooltip>
    );
};
