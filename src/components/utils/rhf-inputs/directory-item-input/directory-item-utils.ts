/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ElementType, TreeViewFinderNodeProps } from '@gridsuite/commons-ui';
import yup from '../../yup-config';
import { DIRECTORY_ITEM_FULL_PATH, DIRECTORY_ITEM_ID } from '../../field-constants';

const SEPARATOR = '/';

export function getAbsenceLabelKeyFromType(elementType: string) {
    switch (elementType) {
        case ElementType.DIRECTORY:
            return 'NoFolder';
        case ElementType.CASE:
            return 'NoCase';
        case ElementType.STUDY:
            return 'NoStudy';
        default:
            return 'NoItem';
    }
}

/**
 * Returns the complete path from root to the input node, separated by "/"
 * @param node The TreeViewFinderNodeProps object
 * @returns A string representing the full path
 */
export function getFullPathFromTreeNode(node: TreeViewFinderNodeProps): string {
    const parentPath = node.parents?.map((parent: TreeViewFinderNodeProps) => parent.name).join(SEPARATOR);
    return parentPath ? SEPARATOR + parentPath + SEPARATOR + node.name : SEPARATOR + node.name;
}

/**
 * Shortens a full path string based on priority rules to fit within a maximum length.
 * Rules:
 * 1. Intermediate folders are replaced by "..."
 * 2. Root folder name is truncated at the end if so long
 * 3. Element name is truncated at the start if so long
 * @param fullPath The full path string (e.g., "/root/sub1/sub2/study")
 * @param maxLength Maximum allowed characters (default 48)
 * @returns Shortened breadcrumb string
 */
export function getBreadcrumbFromFullPath(fullPath: string, maxLength: number = 48): string {
    if (fullPath.length <= maxLength) {
        return fullPath;
    }

    const parts = fullPath.split(SEPARATOR).filter(Boolean);

    // Safety check: if there's only one part or empty
    if (parts.length === 0) return fullPath;
    if (parts.length === 1) {
        return fullPath.length > maxLength ? `...${fullPath.slice(-(maxLength - 3))}` : fullPath;
    }

    const rootFolder = parts[0];
    const itemName = parts[parts.length - 1];

    // Priority 1: Replace intermediate folders with "..."
    // Format: root/.../item
    let result = `${rootFolder}${SEPARATOR}...${SEPARATOR}${itemName}`;
    if (result.length <= maxLength) {
        return result;
    }

    // Priority 2: Truncate root folder name
    // Format: /truncatedRoot.../item
    // We try to keep as much of the root as possible while keeping the full itemName
    const ellipsisSeparator = `...${SEPARATOR}`;
    const availableForRoot = maxLength - itemName.length - ellipsisSeparator.length;

    if (availableForRoot > 3) {
        // 3 for "..." or minimum readable
        const truncatedRoot = `${rootFolder.slice(0, availableForRoot - 3)}`;
        result = `${truncatedRoot}${ellipsisSeparator}${itemName}`;
    } else {
        // Priority 3: Root is too small, hide it and truncate item name
        // Format: .../truncated_item...
        const availableForItem = maxLength - ellipsisSeparator.length;
        const truncatedItem = `${itemName.slice(0, availableForItem - ellipsisSeparator.length)}...`;
        result = `...${SEPARATOR}${truncatedItem}`;
    }

    return result;
}

export const directoryItemSchema = yup.object().shape({
    [DIRECTORY_ITEM_ID]: yup.string().required(),
    [DIRECTORY_ITEM_FULL_PATH]: yup.string().required(),
});

export type DirectoryItemSchema = yup.InferType<typeof directoryItemSchema>;
