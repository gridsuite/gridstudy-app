/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import { CardActions, CardHeader } from '@mui/material';
import LineSeparator from '../dialogs/commons/line-separator';

type GuidancePopupStyle = {
    card: React.CSSProperties;
    header: React.CSSProperties;
    actionsContainer: React.CSSProperties;
};

type GuidancePopupProps = {
    title: ReactNode;
    actions: ReactNode;
    content: ReactNode;
    styles: GuidancePopupStyle;
};

const GuidancePopup: React.FC<GuidancePopupProps> = ({ title, content, actions, styles }) => {
    return (
        <Card sx={styles.card}>
            <CardHeader sx={styles.header} title={title} />
            <CardContent>{content}</CardContent>
            <LineSeparator />
            <CardActions sx={styles.actionsContainer}>{actions} </CardActions>
        </Card>
    );
};
export default GuidancePopup;
