/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { RefObject, useEffect, useRef } from 'react';
import { ReportItem } from './treeview-item';
import { FixedSizeList } from 'react-window';

export const useTreeViewScroll = (
    highlightedReportId: string | undefined,
    nodes: ReportItem[],
    listRef: RefObject<FixedSizeList>
) => {
    const scrollLocked = useRef(false);

    useEffect(() => {
        scrollLocked.current = false;
    }, [highlightedReportId]);

    useEffect(() => {
        if (listRef.current && highlightedReportId && !scrollLocked.current) {
            listRef.current.scrollToItem(nodes.map((node) => node.id).indexOf(highlightedReportId), 'center');
            scrollLocked.current = true;
        }
    }, [highlightedReportId, listRef, nodes]);
};
