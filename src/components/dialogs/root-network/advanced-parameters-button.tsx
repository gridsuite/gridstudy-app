/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid } from '@mui/material';
import { Check as CheckIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';

export interface AdvancedParameterButtonProps {
    showOpenIcon: boolean;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

export default function AdvancedParameterButton({
    showOpenIcon,
    label,
    onClick,
    disabled = false,
}: Readonly<AdvancedParameterButtonProps>) {
    return (
        <Grid item xs={12} sx={{ marginTop: '30px', marginBottom: '10px' }}>
            <Button
                startIcon={<SettingsIcon />}
                endIcon={showOpenIcon && <CheckIcon sx={{ color: 'green' }} />}
                onClick={onClick}
                disabled={disabled}
            >
                <FormattedMessage id={label} />
            </Button>
        </Grid>
    );
}
