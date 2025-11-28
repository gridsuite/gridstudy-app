/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { TableCell } from '@mui/material';
import { useIntl } from 'react-intl';

interface CellRenderProps {
    label?: string;
    value?: string | number;
    isLabel: boolean;
    colStyle: React.CSSProperties;
}

export const CellRender: React.FC<CellRenderProps> = ({ label, value, isLabel, colStyle }) => {
    const intl = useIntl();

    const cellLabel = label ? intl.formatMessage({ id: label }) : '';

    return <TableCell sx={colStyle}>{isLabel ? cellLabel : value}</TableCell>;
};
