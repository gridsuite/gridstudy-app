/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Container from '@mui/material/Container';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const styles = {
    error: {
        fontSize: '64px',
        width: '20%',
        marginLeft: '40%',
    },
    container: {
        marginTop: '70px',
    },
};

const PageNotFound = ({ message }) => {
    return (
        <Container sx={styles.container}>
            <br />
            <ErrorOutlineIcon sx={styles.error} />
            <h1 style={{ textAlign: 'center' }}>{message}</h1>
        </Container>
    );
};

export default PageNotFound;
