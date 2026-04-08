/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { getNetworkModificationsFromComposite } from '../../../../../services/study/network-modifications';
import { Dispatch, SetStateAction } from 'react';
import type { UUID } from 'node:crypto';

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

export function findAllLoadedCompositeModifications(
    modifications: ComposedModificationMetadata[],
    composites: ComposedModificationMetadata[]
) {
    for (const modification of modifications) {
        if (isCompositeModification(modification) && modification.subModifications.length > 0) {
            composites.push(modification);
            findAllLoadedCompositeModifications(modification.subModifications, composites);
        }
    }
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

/**
 * in the tree, replaces the sub-modifications of 'parentModUuid' with 'subModifications' and returns the result
 * @param parentModUuid
 * @param subModifications new subModifications of parentModUuid
 * @param tree all the modifications of the tree
 */
export function updateSubModificationsOfACompositeInTree(
    parentModUuid: string,
    subModifications: ComposedModificationMetadata[],
    tree: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    return tree.map((m) => {
        if (m.uuid === parentModUuid) {
            return { ...m, subModifications };
        }
        if (m.subModifications.length > 0) {
            return {
                ...m,
                subModifications: updateSubModificationsOfACompositeInTree(
                    parentModUuid,
                    subModifications,
                    m.subModifications
                ),
            };
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

function getModificationInTree(
    modUuid: UUID,
    sourceParentUuid: UUID | null,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata | undefined {
    if (sourceParentUuid) {
        const sourceMod = findModificationsInTree(sourceParentUuid, mods);
        if (!sourceMod) {
            return undefined;
        }
        return sourceMod.subModifications.find((m) => m.uuid === modUuid);
    }
    // modUuid is at the root of the tree
    return mods.find((m) => m.uuid === modUuid);
}

/**
 * @param movingUuid moved submodification uuid
 * @param sourceParentUuid composite from which movingUuid comes from. null if movingUuid is at the root level
 * @param targetParentUuid composite where movingUuid is moved. null if movingUuid is moved to the root level
 * @param beforeUuid movingUuid is moved just after beforeUuid. If null, movingUuid is moved to the end.
 * @param mods all the network modifications of the tree
 * @return mods updated according to the moved submodification
 */
export function moveSubModificationInTree(
    movingUuid: UUID,
    sourceParentUuid: UUID | null,
    targetParentUuid: UUID | null,
    beforeUuid: UUID | null,
    mods: ComposedModificationMetadata[]
): ComposedModificationMetadata[] {
    const movedMod: ComposedModificationMetadata | undefined = getModificationInTree(
        movingUuid,
        sourceParentUuid,
        mods
    );
    if (!movedMod) {
        console.error("Can't find the " + movingUuid + ' modification that should be moved');
        return mods;
    }
    let modsWithoutTheMovedModification: ComposedModificationMetadata[];

    if (sourceParentUuid) {
        const sourceMod = findModificationsInTree(sourceParentUuid, mods);
        if (!sourceMod) {
            return mods;
        }
        const newSourceSubs = sourceMod.subModifications.filter((m) => m.uuid !== movingUuid);
        modsWithoutTheMovedModification = updateSubModificationsOfACompositeInTree(
            sourceParentUuid,
            newSourceSubs,
            mods
        );
    } else {
        modsWithoutTheMovedModification = mods.filter((m) => m.uuid !== movingUuid);
    }

    if (targetParentUuid) {
        const targetMod = findModificationsInTree(targetParentUuid, modsWithoutTheMovedModification);
        if (!targetMod) {
            return mods;
        }
        const newTargetSubs = [...targetMod.subModifications];
        const insertIdx = beforeUuid ? newTargetSubs.findIndex((m) => m.uuid === beforeUuid) : -1;
        newTargetSubs.splice(insertIdx === -1 ? newTargetSubs.length : insertIdx, 0, movedMod);
        return updateSubModificationsOfACompositeInTree(
            targetParentUuid,
            newTargetSubs,
            modsWithoutTheMovedModification
        );
    } else {
        const insertIdx = beforeUuid ? modsWithoutTheMovedModification.findIndex((m) => m.uuid === beforeUuid) : -1;
        const result = [...modsWithoutTheMovedModification];
        result.splice(insertIdx === -1 ? result.length : insertIdx, 0, movedMod);
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

    if (uuidsToFetch.length === 0) {
        return;
    }

    getNetworkModificationsFromComposite(uuidsToFetch).then((subModsByUuid) => {
        setMods((prev) =>
            Object.entries(subModsByUuid).reduce((tree, [uuid, subMods]) => {
                const liveModifications = formatComposedModification(subMods.filter((m) => !m.stashed));
                // Preserve already-loaded children of any nested composites within the new sub-list
                const existingMod = findModificationsInTree(uuid, tree);
                const mergedSubs = mergeSubModificationsIntoTree(
                    liveModifications,
                    existingMod?.subModifications ?? []
                );
                return updateSubModificationsOfACompositeInTree(uuid, mergedSubs, tree);
            }, prev)
        );
    });
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

    getNetworkModificationsFromComposite(uuidsToRefetch).then((subModsByUuid) => {
        setMods((prev) =>
            Object.entries(subModsByUuid).reduce((tree, [uuid, subMods]) => {
                const liveModifications = formatComposedModification(subMods.filter((m) => !m.stashed));
                // Preserve already-loaded children of any nested composites within the new sub-list
                const existingMod = findModificationsInTree(uuid, tree);
                const mergedSubs = mergeSubModificationsIntoTree(
                    liveModifications,
                    existingMod?.subModifications ?? []
                );
                return updateSubModificationsOfACompositeInTree(uuid, mergedSubs, tree);
            }, prev)
        );
    });
}
