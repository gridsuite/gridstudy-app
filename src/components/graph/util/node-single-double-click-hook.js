/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect } from 'react';

export function useNodeSingleAndDoubleClick(
    actionSimpleClick,
    actionDoubleClick,
    delay = 250
) {
    const [clickEvent, setClickEvent] = useState({ count: 0 });

    useEffect(() => {
        const timer = setTimeout(() => {
            // simple click
            if (clickEvent.count === 1) {
                actionSimpleClick(clickEvent.event, clickEvent.node);
            }
            if (clickEvent.count !== 0) {
                setClickEvent({ count: 0 });
            }
        }, delay);

        // the duration between this click and the previous one
        // is less than the value of delay = double-click
        if (clickEvent.count === 2) {
            actionDoubleClick(clickEvent.event, clickEvent.node);
        }

        return () => clearTimeout(timer);
    }, [clickEvent, actionSimpleClick, actionDoubleClick, delay]);

    return (event, node) => {
        setClickEvent((prev) => ({
            count: prev.count + 1,
            event: event,
            node: node,
        }));
    };
}
