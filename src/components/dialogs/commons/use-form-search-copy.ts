/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useCallback, useState } from 'react';
import {
    type EquipmentInfos,
    EquipmentInfosTypes,
    type EquipmentType,
    type ExtendedEquipmentType,
    fetchNetworkElementInfos,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { UUID } from 'node:crypto';

// TODO fetchNetworkElementInfos has no type
type FetchResponse = Awaited<ReturnType<typeof fetchNetworkElementInfos>>;

export interface UseFormSearchCopy {
    isDialogSearchOpen: boolean;
    handleOpenSearchDialog: () => void;
    handleSelectionChange: (element: EquipmentInfos) => Promise<void>;
    handleCloseSearchDialog: () => void;
}

export function useFormSearchCopy(
    setFormValues: (response: FetchResponse) => void,
    elementType: EquipmentType | ExtendedEquipmentType
): UseFormSearchCopy {
    const intl = useIntl();
    const { snackInfo, snackError } = useSnackMessage();
    const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);

    const handleCloseSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(false);
    }, []);

    const handleOpenSearchDialog = useCallback(() => {
        setIsDialogSearchOpen(true);
    }, []);

    const handleSelectionChange = useCallback(
        (element: EquipmentInfos) =>
            fetchNetworkElementInfos(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                elementType,
                EquipmentInfosTypes.FORM.type,
                element.id as UUID,
                true
            )
                .then((response) => {
                    setFormValues(response);
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'EquipmentCopied' }, { equipmentId: element.id }),
                    });
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, {
                        headerId: 'EquipmentCopyFailed',
                        headerValues: { equipmentId: element.id },
                    });
                })
                .finally(() => handleCloseSearchDialog()),
        [
            currentNodeUuid,
            currentRootNetworkUuid,
            elementType,
            handleCloseSearchDialog,
            intl,
            setFormValues,
            snackError,
            snackInfo,
            studyUuid,
        ]
    );

    return {
        isDialogSearchOpen,
        handleOpenSearchDialog,
        handleSelectionChange,
        handleCloseSearchDialog,
    };
}
