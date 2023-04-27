import { useEffect, useState } from 'react';

/**
 * A hook that returns a boolean indicating whether a form should be opened after a short delay.
 *
 * @param {boolean} isDataFetched - Whether data is fetched.
 * @param {number} delay - The delay before opening the form, in milliseconds.
 *
 * @returns {boolean} A boolean indicating whether the form should be opened.
 */
export const useOpenShortWaitFetching = ({ isDataFetched, delay }) => {
    // State to track whether the form should be opened or not.
    const [shouldOpen, setShouldOpen] = useState(false);

    useEffect(() => {
        let timeout;
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
