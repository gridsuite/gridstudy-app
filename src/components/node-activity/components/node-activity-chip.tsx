/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Chip, CircularProgress } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { nodeActivityLabelId, type NodeActivity } from '../types/node-activity.type';

export function NodeActivityChip({ activity }: Readonly<{ activity: NodeActivity }>) {
    return (
        <Chip
            size="small"
            icon={<CircularProgress size={14} />}
            label={<FormattedMessage id={nodeActivityLabelId(activity.label)} />}
        />
    );
}
