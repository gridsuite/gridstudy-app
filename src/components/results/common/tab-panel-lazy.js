/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useRef } from 'react';

const TabPanelLazy = (props) => {
    const { children, visible, forceUnmount, ...other } = props;

    // implementation of a state machine with two states MOUNTED and UNMOUNTED
    const prevMountRef = useRef(false);
    const mount = useMemo(() => {
        if (prevMountRef.current) {
            if (forceUnmount) {
                // MOUNTED => UNMOUNTED
                prevMountRef.current = false;
            }
        } else {
            if (visible && !forceUnmount) {
                // UNMOUNTED => MOUNTED
                prevMountRef.current = true;
            }
        }

        return prevMountRef.current;
    }, [forceUnmount, visible]);

    return (
        <div style={{ display: visible ? 'inherit' : 'none' }} {...other}>
            {mount && children}
        </div>
    );
};

export default TabPanelLazy;
