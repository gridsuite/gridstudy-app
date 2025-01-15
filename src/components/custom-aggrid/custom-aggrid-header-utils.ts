/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomAggridFilterParams, CustomColDef } from './custom-aggrid-header.type';
import CustomHeaderComponent from './custom-aggrid-header';

export const makeAgGridCustomHeaderColumn = <F extends CustomAggridFilterParams = CustomAggridFilterParams>({
    sortParams,
    forceDisplayFilterIcon,
    filterComponent,
    filterComponentParams,
    tabIndex,
    isCustomColumn,
    Menu,
    ...props // agGrid column props
}: CustomColDef<any, any, F>) => {
    const { headerName, field = '', fractionDigits, numeric } = props;
    const isSortable = !!sortParams;

    let minWidth = 75;
    if (isSortable) {
        minWidth += 30;
    }
    if (!!filterComponent) {
        minWidth += 30;
    }

    return {
        headerTooltip: headerName,
        minWidth,
        fractionDigits: numeric && !fractionDigits ? 2 : fractionDigits,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName: headerName,
            sortParams,
            customMenuParams: {
                tabIndex: tabIndex,
                isCustomColumn: isCustomColumn,
                Menu: Menu,
            },
            forceDisplayFilterIcon: forceDisplayFilterIcon,
            filterComponent: filterComponent,
            filterComponentParams,
        },
        filterParams: props?.agGridFilterParams || undefined,
        ...props,
    };
};
