/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComposedModificationMetadata,
    ElementSaveDialog,
    ElementType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    ModificationType,
    PARAM_DEVELOPER_MODE,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useEffect, useState } from 'react';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { containsSharedModification } from '../../../../services/study/network-modifications';

export interface SaveNetworkModificationsDialogProps {
    open: boolean;
    onClose: () => void;
    studyUuid: UUID;
    selectedModifications: ComposedModificationMetadata[];
    defaultName: string | null;
    onSave: (data: IElementCreationDialog) => void;
    onSaveShared: (data: IElementCreationDialog) => void;
    onUpdate: (data: IElementUpdateDialog) => void;
}

export default function SaveNetworkModificationsDialog({
    open,
    onClose,
    studyUuid,
    selectedModifications,
    defaultName,
    onSave,
    onSaveShared,
    onUpdate,
}: Readonly<SaveNetworkModificationsDialogProps>) {
    const [isDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [selectedCompositeContainsShared, setSelectedCompositeContainsShared] = useState<boolean>();

    // Sharing moves the selected composite itself into gridexplore : it needs exactly one composite, and an already
    // shared one (a reference) cannot be shared again.
    const selectedComposite =
        selectedModifications.length === 1 && selectedModifications[0].type === ModificationType.COMPOSITE_MODIFICATION
            ? selectedModifications[0]
            : undefined;

    // A composite nested in another composite of the node can be shared, but not one contained by an already shared
    // composite.
    const isSelectedCompositeShareable = selectedComposite !== undefined && !selectedComposite.childFromShared;

    // only the server can tell whether the composite contains a shared modification : the table only loads its
    // content as it is unfolded.
    useEffect(() => {
        setSelectedCompositeContainsShared(undefined);
        if (!open || !isDeveloperMode || !isSelectedCompositeShareable) {
            return;
        }
        let active = true; // to manage race condition
        containsSharedModification(selectedComposite.uuid)
            .then((containsShared) => {
                if (active) {
                    setSelectedCompositeContainsShared(containsShared);
                }
            })
            .catch((error) => {
                console.error(
                    `Failed to know whether composite ${selectedComposite.uuid} contains a shared modification`,
                    error
                );
            });
        return () => {
            active = false;
        };
    }, [open, isDeveloperMode, isSelectedCompositeShareable, selectedComposite]);

    const isSharingAvailable =
        isDeveloperMode && isSelectedCompositeShareable && selectedCompositeContainsShared === false;

    return (
        <ElementSaveDialog
            open={open}
            onSave={onSave}
            onSaveShared={onSaveShared}
            createSharedDisabled={!isSharingAvailable}
            OnUpdate={onUpdate}
            onClose={onClose}
            type={ElementType.MODIFICATION}
            titleId="CreateCompositeModification"
            prefixIdForGeneratedName="GeneratedModification"
            defaultName={defaultName}
            studyUuid={studyUuid}
            selectorTitleId="SelectCompositeModificationTitle"
            createLabelId="CreateCompositeModificationLabel"
            createSharedLabelId="ShareCompositeModificationLabel"
            updateLabelId="UpdateCompositeModificationLabel"
        />
    );
}
