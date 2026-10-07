/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComposedModificationMetadata,
    containsReferenceModification,
    ElementSaveDialog,
    ElementType,
    type IElementCreationDialog,
    type IElementUpdateDialog,
    isReferenceModification,
    ModificationType,
    PARAM_DEVELOPER_MODE,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

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

    const hasReference = selectedModifications.some(
        (modification) => isReferenceModification(modification) || containsReferenceModification(modification)
    );

    // Sharing moves the selected composite itself into gridexplore : it needs exactly one composite, and one contained
    // by an already shared composite cannot be shared.
    const isSelectedCompositeShareable =
        selectedModifications.length === 1 &&
        selectedModifications[0].type === ModificationType.COMPOSITE_MODIFICATION &&
        !selectedModifications[0].childFromShared;

    const isSharingAvailable = isDeveloperMode && isSelectedCompositeShareable && !hasReference;

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
            alertMessageId={hasReference ? 'SharedModificationsSavedAsCopy' : undefined}
        />
    );
}
