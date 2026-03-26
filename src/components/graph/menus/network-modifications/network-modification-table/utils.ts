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

export function isCompositeModification(modification: ComposedModificationMetadata | undefined) {
    return modification?.messageType === MODIFICATION_TYPES.COMPOSITE_MODIFICATION.type;
}

export function findModificationsInTree(
    uuid: string,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata | undefined {
    for (const mod of mods) {
        if (mod.uuid === uuid) {
            return mod;
        }
        const found = findModificationsInTree(uuid, mod.subModifications);
        if (found) {
            return found;
        }
    }
    return undefined;
}

export function updateModificationInTree(
    uuid: string,
    subModifications: ComposedModificationMetadata[],
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    return mods.map((m) => {
        if (m.uuid === uuid) {
            return { ...m, subModifications };
        }
        if (m.subModifications.length > 0) {
            return { ...m, subModifications: updateModificationInTree(uuid, subModifications, m.subModifications) };
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
 * Returns a new tree where the modification identified by {@code uuid} has the given
 * partial fields merged in. All other nodes are returned as-is (referentially stable).
 */
export function updateModificationFieldInTree(
    uuid: string,
    fields: Partial<ComposedModificationMetadata>,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    return mods.map((m) => {
        if (m.uuid === uuid) {
            return { ...m, ...fields };
        }
        if (m.subModifications.length > 0) {
            return { ...m, subModifications: updateModificationFieldInTree(uuid, fields, m.subModifications) };
        }
        return m;
    });
}

export function moveSubModificationInTree(
    movingUuid: string,
    sourceParentUuid: string | null,
    targetParentUuid: string | null,
    beforeUuid: string | null,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    // --- Extract the item from its source ---
    let movedItem: ComposedModificationMetadata | undefined;
    let next: ComposedModificationMetadata[];

    if (sourceParentUuid) {
        const sourceMod = findModificationsInTree(sourceParentUuid, mods);
        if (!sourceMod) {
            return mods;
        }
        movedItem = sourceMod.subModifications.find((m) => m.uuid === movingUuid);
        if (!movedItem) {
            return mods;
        }
        const newSourceSubs = sourceMod.subModifications.filter((m) => m.uuid !== movingUuid);
        next = updateModificationInTree(sourceParentUuid, newSourceSubs, mods);
    } else {
        movedItem = mods.find((m) => m.uuid === movingUuid);
        if (!movedItem) {
            return mods;
        }
        next = mods.filter((m) => m.uuid !== movingUuid);
    }

    // --- Insert into target ---
    if (targetParentUuid) {
        const targetMod = findModificationsInTree(targetParentUuid, next);
        if (!targetMod) {
            return mods;
        }
        const newTargetSubs = [...targetMod.subModifications];
        const insertIdx = beforeUuid ? newTargetSubs.findIndex((m) => m.uuid === beforeUuid) : -1;
        newTargetSubs.splice(insertIdx === -1 ? newTargetSubs.length : insertIdx, 0, movedItem);
        return updateModificationInTree(targetParentUuid, newTargetSubs, next);
    } else {
        const insertIdx = beforeUuid ? next.findIndex((m) => m.uuid === beforeUuid) : -1;
        const result = [...next];
        result.splice(insertIdx === -1 ? result.length : insertIdx, 0, movedItem);
        return result;
    }
}

export function fetchSubModificationsForExpandedRows(
    expandedIds: string[],
    mods: ComposedModificationMetadata[],
    setMods: Dispatch<SetStateAction<ComposedModificationMetadata[]>>
): void {
    const uuidsToFetch = expandedIds.filter((id) => {
        const mod = findModificationsInTree(id, mods);
        return isCompositeModification(mod) && mod?.subModifications.length === 0;
    });

    // Fire all requests concurrently — each resolves independently and patches the tree
    uuidsToFetch.forEach((uuid) =>
        getNetworkModificationsFromComposite([uuid]).then((subMods) => {
            const liveModifications = subMods.filter((m) => !m.stashed);
            setMods((prev) => updateModificationInTree(uuid, formatComposedModification(liveModifications), prev));
        })
    );
}

/**
 * Re-fetches sub-modifications for all expanded composite rows
 * Used when `modifications` changes to ensure no stale sub-modification data remains.
 */
export function refetchSubModificationsForExpandedRows(
    expandedIds: string[],
    mods: ComposedModificationMetadata[],
    setMods: Dispatch<SetStateAction<ComposedModificationMetadata[]>>
): void {
    const uuidsToRefetch = expandedIds.filter((id) => {
        const mod = findModificationsInTree(id, mods);
        return isCompositeModification(mod);
    });

    if (uuidsToRefetch.length === 0) {
        return;
    }

    //TODO CHANGE TO UNIQUE API CALL ONCE DATA STRUCTURE IS ADAPTED
    Promise.all(
        uuidsToRefetch.map((uuid) =>
            getNetworkModificationsFromComposite([uuid]).then((subMods) => ({ uuid, subMods }))
        )
    ).then((results) => {
        setMods((prev) =>
            results.reduce((tree, { uuid, subMods }) => {
                const liveModifications = subMods.filter((m) => !m.stashed);
                return updateModificationInTree(uuid, formatComposedModification(liveModifications), tree);
            }, prev)
        );
    });
}
