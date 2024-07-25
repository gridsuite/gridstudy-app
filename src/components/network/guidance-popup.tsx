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
import { Box } from '@mui/system';
import { LineSeparator } from '../dialogs/dialogUtils';

const styles = {
    card: {
        position: 'absolute',
        left: '10px',
        bottom: '150px',
        maxWidth: '200px',
    },
};

const GuidancePopup: React.FC = () => {
    return (
        <Box sx={styles.card}>
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        component="div"
                        style={{ marginBottom: '10px' }}
                    >
                        Sélection sur la carte
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Cliquez sur la carte pour commencer à dessiner un
                        polygone.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Appuyez sur Entrée pour enregistrer la sélection ou
                        Échap pour annuler.
                    </Typography>
                    <LineSeparator />

                    <Button size="small">fermer l'éditeur</Button>
                </CardContent>
            </Card>
        </Box>
    );
};
export default GuidancePopup;
