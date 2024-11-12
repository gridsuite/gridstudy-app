/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Divider, Grid } from '@mui/material';

export default function LineSeparator() {
    return (
        <Grid item xs={12}>
            <Divider />
        </Grid>
    );
}
