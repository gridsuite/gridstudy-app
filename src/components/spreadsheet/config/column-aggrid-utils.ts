/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetColDef } from './spreadsheet.type';

export const makeSpreadsheetAgGridColumn = ({
    forceDisplayFilterIcon,
    tabIndex,
    isCustomColumn,
    Menu,
    ...props // agGrid column props
}: SpreadsheetColDef) => {
    const { headerName, fractionDigits, numeric } = props;

    let minWidth = 75;

    return {
        headerTooltip: headerName,
        minWidth,
        fractionDigits: numeric && !fractionDigits ? 2 : fractionDigits,
        ...props,
    };
};
