/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { italicFontTextField, LineSeparator } from '../dialogs/dialogUtils';
import { CardActions, CardHeader } from '@mui/material';
import { red } from '@mui/material/colors';

const styles = {
    card: {
        position: 'absolute',
        left: '10px',
        bottom: '150px',
        maxWidth: '200px',
    },
    title: {
        backgroundColor: red,
        fontFamily: italicFontTextField,
    },
    content: {
        fontSize: 16,
    },
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
};

const GuidancePopup: React.FC = () => {
    return (
        <Card sx={styles.card}>
            <CardHeader
                sx={styles.title}
                title={
                    <Typography variant="h6" component="span">
                        Sélection sur la carte
                    </Typography>
                }
            />

            <CardContent>
                <Typography variant="body2" sx={styles.content}>
                    Cliquez sur la carte pour commencer à dessiner un polygone.
                </Typography>
                <Typography variant="body2" sx={styles.content}>
                    Appuyez sur Entrée pour enregistrer la sélection ou Échap
                    pour annuler.
                </Typography>
            </CardContent>
            <LineSeparator />

            <CardActions sx={styles.actionsContainer}>
                <Button size="small">Fermer l'éditeur</Button>
            </CardActions>
        </Card>
    );
};
export default GuidancePopup;
