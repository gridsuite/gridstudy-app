/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { getNetworkModificationsFromComposite } from '../../../../../services/study/network-modifications';
import { Dispatch, SetStateAction } from 'react';

export const formatComposedModification = (
    modifications: NetworkModificationMetadata[]
): ComposedModificationMetadata[] => {
    return modifications.map((modification) => ({ ...modification, subModifications: [] }));
};

export interface ComposedModificationMetadata extends NetworkModificationMetadata {
    subModifications: ComposedModificationMetadata[];
}

export function findModInTree(
    uuid: string,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata | undefined {
    for (const mod of mods) {
        if (mod.uuid === uuid) {
            return mod;
        }
        const found = findModInTree(uuid, mod.subModifications);
        if (found) {
            return found;
        }
    }
    return undefined;
}

export function updateModInTree(
    uuid: string,
    subModifications: ComposedModificationMetadata[],
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    return mods.map((m) => {
        if (m.uuid === uuid) {
            return { ...m, subModifications };
        }
        if (m.subModifications.length > 0) {
            return { ...m, subModifications: updateModInTree(uuid, subModifications, m.subModifications) };
        }
        return m;
    });
}

/**
 * Recursively merges already-loaded subModifications from the previous tree into a freshly
 * formatted tree (where all subModifications start as []). This ensures that when `modifications`
 * changes, previously fetched children are preserved and do not need to be re-fetched.
 */
export function mergeSubModificationsIntoTree(
    nextMods: ComposedModificationMetadata[],
    prevMods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    return nextMods.map((nextMod) => {
        const prevMod = prevMods.find((m) => m.uuid === nextMod.uuid);
        if (!prevMod || prevMod.subModifications.length === 0) {
            return nextMod;
        }
        return {
            ...nextMod,
            subModifications: mergeSubModificationsIntoTree(
                nextMod.subModifications.length > 0 ? nextMod.subModifications : prevMod.subModifications,
                prevMod.subModifications
            ),
        };
    });
}

/**
 * Collects all composite UUIDs from expandedIds that have not yet been loaded,
 * fires one concurrent request per UUID (the endpoint returns a flat list of children
 * with no parent attribution, so batching multiple parents into one call is not possible),
 * then applies each result into the tree as responses arrive.
 * Used for lazy loading on the expand interaction only — does not overwrite already-loaded rows.
 */
export function fetchSubModificationsForExpandedRows(
    expandedIds: string[],
    mods: ComposedModificationMetadata[],
    setMods: Dispatch<SetStateAction<ComposedModificationMetadata[]>>
): void {
    const uuidsToFetch = expandedIds.filter((id) => {
        const mod = findModInTree(id, mods);
        return mod?.messageType === MODIFICATION_TYPES.COMPOSITE_MODIFICATION.type && mod.subModifications.length === 0;
    });

    // Fire all requests concurrently — each resolves independently and patches the tree
    uuidsToFetch.map((uuid) =>
        getNetworkModificationsFromComposite([uuid]).then((subMods) => {
            setMods((prev) => updateModInTree(uuid, formatComposedModification(subMods), prev));
        })
    );
}

/**
 * Re-fetches sub-modifications for all expanded composite rows unconditionally,
 * firing all requests concurrently, then applies all results in a single setMods call
 * once every fetch has resolved.
 * Used when `modifications` changes to ensure no stale sub-modification data remains.
 */
export function refetchSubModificationsForExpandedRows(
    expandedIds: string[],
    mods: ComposedModificationMetadata[],
    setMods: Dispatch<SetStateAction<ComposedModificationMetadata[]>>
): void {
    const uuidsToRefetch = expandedIds.filter((id) => {
        const mod = findModInTree(id, mods);
        return mod?.messageType === MODIFICATION_TYPES.COMPOSITE_MODIFICATION.type;
    });

    if (uuidsToRefetch.length === 0) {
        return;
    }

    Promise.all(
        uuidsToRefetch.map((uuid) =>
            getNetworkModificationsFromComposite([uuid]).then((subMods) => ({ uuid, subMods }))
        )
    ).then((results) => {
        setMods((prev) =>
            results.reduce(
                (tree, { uuid, subMods }) => updateModInTree(uuid, formatComposedModification(subMods), tree),
                prev
            )
        );
    });
}
