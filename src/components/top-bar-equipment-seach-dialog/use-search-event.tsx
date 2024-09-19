/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

export const useSearchEvent = (enableSearchCallback: () => void) => {
    const user = useSelector((state: AppState) => state.user);

    useEffect(() => {
        if (user) {
            const openSearch = (e: KeyboardEvent) => {
                if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
                    e.preventDefault();
                    enableSearchCallback();
                }
            };
            document.addEventListener('keydown', openSearch);
            return () => document.removeEventListener('keydown', openSearch);
        }
    }, [user, enableSearchCallback]);
};
