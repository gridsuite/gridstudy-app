/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Alert, Grid } from '@mui/material';

// component to display alert when a specific rhf field is in error
// this component needs to be isolated to avoid too many rerenders
const FieldErrorAlert = ({ message }) => {
    return (
        <Grid item xs={12}>
            <Alert severity="error">{message}</Alert>
        </Grid>
    );
};

export default FieldErrorAlert;
