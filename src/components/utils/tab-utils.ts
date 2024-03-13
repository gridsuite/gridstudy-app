/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

const styles = {
    tabWithError: (theme: Theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme: Theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
};

export function getTabIndicatorStyle<T extends number | string>(
    tabIndexesWithError: T[],
    index: T,
) {
    return tabIndexesWithError.includes(index)
        ? styles.tabWithErrorIndicator
        : undefined;
}

export function getTabStyle<T extends number | string>(
    tabIndexesWithError: T[],
    index: T,
) {
    return tabIndexesWithError.includes(index)
        ? styles.tabWithError
        : undefined;
}
