/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';

/**
 * A hook that returns a boolean indicating whether a form should be opened after a short delay.
 *
 * @param {boolean} isDataFetched - Whether data is fetched.
 * @param {number} delay - The delay before opening the form, in milliseconds.
 *
 * @returns {boolean} A boolean indicating whether the form should be opened.
 */

export const useOpenShortWaitFetching: ({
    isDataFetched,
    delay,
}: {
    isDataFetched: boolean;
    delay: number;
}) => boolean = ({ isDataFetched, delay }) => {
    // State to track whether the form should be opened or not.
    const [shouldOpen, setShouldOpen] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        // If data is already available, open the form immediately.
        if (isDataFetched) {
            setShouldOpen(true);
        } else {
            // Otherwise, wait for a short delay before opening the form.
            timeout = setTimeout(() => setShouldOpen(true), delay);
        }
        // Return a cleanup function to cancel the timeout if the data arrives before the end of the delay.
        return () => clearTimeout(timeout);
    }, [delay, isDataFetched]);

    return shouldOpen;
};
