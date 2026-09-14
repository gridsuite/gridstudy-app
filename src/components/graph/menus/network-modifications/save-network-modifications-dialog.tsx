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
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useEffect, useMemo, useState } from 'react';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { hasModificationReferences } from '../../../../services/study/network-modifications';

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
    const { snackError } = useSnackMessage();
    const [selectionHasSharedContent, setSelectionHasSharedContent] = useState<boolean>();

    const selectionContainsShared = useMemo(
        () =>
            selectedModifications.some((modification) => modification.type === ModificationType.MODIFICATION_REFERENCE),
        [selectedModifications]
    );
    const selectedCompositeUuids = useMemo(
        () =>
            selectedModifications
                .filter((modification) => modification.type === ModificationType.COMPOSITE_MODIFICATION)
                .map((modification) => modification.uuid),
        [selectedModifications]
    );

    // Sharing moves the selected composite itself into gridexplore : it needs exactly one composite, and one contained
    // by an already shared composite cannot be shared.
    const isSelectedCompositeShareable =
        selectedModifications.length === 1 &&
        selectedModifications[0].type === ModificationType.COMPOSITE_MODIFICATION &&
        !selectedModifications[0].childFromShared;

    // nested references are lazily loaded by the table, so the selection alone can't tell : ask the server
    useEffect(() => {
        setSelectionHasSharedContent(undefined);
        if (!open) {
            return;
        }
        if (selectionContainsShared || selectedCompositeUuids.length === 0) {
            setSelectionHasSharedContent(selectionContainsShared);
            return;
        }
        let active = true; // to manage race condition
        hasModificationReferences(selectedCompositeUuids)
            .then((hasReferences) => {
                if (active) {
                    setSelectionHasSharedContent(hasReferences);
                }
            })
            .catch((error) => snackWithFallback(snackError, error));
        return () => {
            active = false;
        };
    }, [open, selectionContainsShared, selectedCompositeUuids, snackError]);

    const isSharingAvailable = isDeveloperMode && isSelectedCompositeShareable && selectionHasSharedContent === false;

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
            alertMessageId={selectionHasSharedContent ? 'SharedModificationsSavedAsCopy' : undefined}
        />
    );
}
