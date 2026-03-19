/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { resultsGlobalFilterStyles } from './global-filter-styles';
import { Box, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { Info } from '@mui/icons-material';

type TextWithToolTipProps = {
    text: string;
    tooltipMessage: string;
};

export function TextWithInfoIcon({ text, tooltipMessage }: Readonly<TextWithToolTipProps>) {
    const intl = useIntl();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <FormattedMessage id={text} />
            <Tooltip title={intl.formatMessage({ id: tooltipMessage })} arrow placement="right">
                <Info fontSize="medium" sx={resultsGlobalFilterStyles.cellTooltip} />
            </Tooltip>
        </Box>
    );
}
