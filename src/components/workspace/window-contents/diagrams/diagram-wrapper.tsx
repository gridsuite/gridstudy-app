/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';
import AlertCustomMessageNode from '../../../utils/alert-custom-message-node';
import { cardStyles } from '../../../grid-layout/cards/card-styles';

interface DiagramWrapperProps {
    loading: boolean;
    hasSvg: boolean;
    globalError?: string;
    children: ReactNode;
}

export const DiagramWrapper = ({ loading, hasSvg, globalError, children }: DiagramWrapperProps) => {
    if (loading && !hasSvg) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (globalError) {
        return <AlertCustomMessageNode message={globalError} noMargin style={cardStyles.alertMessage} />;
    }

    return <Box sx={{ height: '100%', width: '100%' }}>{children}</Box>;
};
