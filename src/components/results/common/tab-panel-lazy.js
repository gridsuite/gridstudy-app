/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useRef } from 'react';

const TabPanelLazy = (props) => {
    const { children, mounts, canKeepMounted, ...other } = props;

    const synthRef = useRef();
    const [next, prev] = [{}, synthRef.current];

    if (canKeepMounted && !mounts) {
        next.hasToHaveItMounted = prev?.hasToHaveItMounted;
    } else {
        next.hasToHaveItMounted = mounts;
    }
    synthRef.current = next;

    return (
        <div style={{ display: mounts ? 'inherit' : 'none' }} {...other}>
            {next.hasToHaveItMounted && children}
        </div>
    );
};

export default TabPanelLazy;
