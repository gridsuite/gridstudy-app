/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';

/**
 * A hook that returns a boolean indicating whether a loader should be displayed after a short delay.
 *
 * @param {boolean} isLoading - Whether the loading is active.
 * @param {number} delay - The delay before displaying the loader, in milliseconds.
 *
 * @returns {boolean} A boolean indicating whether the loader should be displayed.
 */

export const useOpenLoaderShortWait: ({ isLoading, delay }: { isLoading: boolean; delay: number }) => boolean = ({
    isLoading,
    delay,
}) => {
    // State to track whether the loader should be opened or not.
    const [shouldOpen, setShouldOpen] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        // Hide the loader if it's not running.
        if (!isLoading) {
            setShouldOpen(false);
        } else {
            // Otherwise, wait for the specified delay before displaying the loader.
            timeout = setTimeout(() => {
                setShouldOpen(true);
            }, delay);
        }
        // Return a cleanup function to cancel the timeout if loading finishes before the end of the delay.
        return () => clearTimeout(timeout);
    }, [delay, isLoading]);

    return shouldOpen;
};
