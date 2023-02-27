/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Container, Grid, Typography } from '@mui/material';
import { useStyles } from '../parameters-styles';

const SolverParameters = ({}) => {
    const classes = useStyles();
    return (
        <Grid container className={classes.grid}>
            <Container maxWidth="md">
                <Typography>Solver</Typography>
            </Container>
        </Grid>
    );
};

export default SolverParameters;
