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
