/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useCallback, useState } from 'react';
import { EquipmentType, ExtendedEquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { fetchNetworkElementInfos } from '../../../services/study/network';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { EquipmentInfos } from '@gridsuite/commons-ui/dist/utils/types/equipmentType';

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
    elementType: EquipmentType | ExtendedEquipmentType | EQUIPMENT_TYPES
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
                EQUIPMENT_INFOS_TYPES.FORM.type,
                element.id,
                true
            )
                .then((response) => {
                    setFormValues(response);
                    snackInfo({
                        messageTxt: intl.formatMessage({ id: 'EquipmentCopied' }, { equipmentId: element.id }),
                    });
                })
                .catch((error) => {
                    console.error(`error while fetching equipment ${element.id} : message = ${error.message}`);
                    let msg;
                    if (error.status === 404) {
                        msg = intl.formatMessage({ id: 'EquipmentCopyFailed404' }, { equipmentId: element.id });
                    } else {
                        msg = `${intl.formatMessage({ id: 'EquipmentCopyFailed' }, { equipmentId: element.id })} ${
                            error.message
                        }`;
                    }
                    snackError({ messageTxt: msg });
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
