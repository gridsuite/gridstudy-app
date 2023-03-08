/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';

const TabPanelLazy = (props) => {
    const { children, selected, ...other } = props;
    const [initialized, setInitialized] = useState(false);

    // force mount child once
    useEffect(() => {
        if (!initialized && selected) {
            setInitialized(true);
        }
    }, [selected, initialized]);

    return (
        <div
            style={{ height: '100%', display: selected ? 'flex' : 'none' }}
            {...other}
        >
            {initialized && children}
        </div>
    );
};

export default TabPanelLazy;
