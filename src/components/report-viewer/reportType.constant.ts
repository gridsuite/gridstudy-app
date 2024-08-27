/**
 * A REPORT_TYPE is a tree that can contain 2 kinds of nodes:
 * - GLOBAL : an optional top-level node that contains only the NODE children
 * - NODE : contain a root node report having N SubReport children
 */
export const REPORT_TYPE = {
    GLOBAL: 'GlobalReport',
    NODE: 'NodeReport',
};
