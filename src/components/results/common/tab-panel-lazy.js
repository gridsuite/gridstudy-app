/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useRef } from 'react';

const TabPanelLazy = (props) => {
    const { children, selected, invalidatingDeps, ...other } = props;

    const synthRef = useRef();
    const [next, prev] = [
        { selected, invalidatingDeps: [...invalidatingDeps] },
        synthRef.current,
    ];

    if (prev?.invalidatingDeps?.length !== invalidatingDeps?.length) {
        next.hasToHaveItMounted = selected;
    } else if (
        invalidatingDeps?.length &&
        !invalidatingDeps.reduce(
            (accum, dep, i) => accum && dep === prev.invalidatingDeps[i],
            true
        )
    ) {
        // at least one dependency has changed, we revoke unselected ones, other show and update
        next.hasToHaveItMounted = selected;
    } else if (next.selected && !prev?.selected) {
        next.hasToHaveItMounted = true;
    } else {
        next.hasToHaveItMounted = prev?.hasToHaveItMounted;
    }
    synthRef.current = next;

    return (
        <div style={{ display: selected ? 'inherit' : 'none' }} {...other}>
            {next.hasToHaveItMounted && children}
        </div>
    );
};

export default TabPanelLazy;
