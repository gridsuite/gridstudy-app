/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import Container from "@material-ui/core/Container";


const PageNotFound = () => {
    return (
        <Container >
            <br/>
            <img src={ require('../images/404.png') }  style={{display:"block", margin:"auto"}} alt={"page not found"}/>
            <h1 style={{textAlign:"center"}}>404 Not Found</h1>
        </Container>
            );
};

export default PageNotFound;
