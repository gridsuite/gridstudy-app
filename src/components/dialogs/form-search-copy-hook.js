/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useState } from 'react';
import { fetchEquipmentInfos } from '../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const useFormSearchCopy = ({
    studyUuid,
    currentNodeUuid,
    equipmentPath,
    toFormValues,
    setFormValues,
}) => {
    const intl = useIntl();

    const { snackInfo, snackError } = useSnackMessage();

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleSelectionChange = (element) => {
        let msg;
        return fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            equipmentPath,
            element.id,
            true
        )
            .then((response) => {
                const equipmentFormValues = toFormValues(response);
                setFormValues(equipmentFormValues);

                msg = intl.formatMessage(
                    { id: 'EquipmentCopied' },
                    {
                        equipmentId: element.id,
                    }
                );
                snackInfo({
                    messageTxt: msg,
                });
            })
            .catch((error) => {
                console.error(
                    'error while fetching equipment {equipmentId} : message = {message}',
                    element.id,
                    error.message
                );
                if (error.status === 404) {
                    msg =
                        intl.formatMessage(
                            { id: 'EquipmentCopyFailed404' },
                            {
                                equipmentId: element.id,
                            }
                        ) +
                        ' ' +
                        error.message;
                } else {
                    msg =
                        intl.formatMessage(
                            { id: 'EquipmentCopyFailed' },
                            {
                                equipmentId: element.id,
                            }
                        ) +
                        ' ' +
                        error.message;
                }
                snackError({
                    messageTxt: msg,
                });
                handleCloseSearchDialog();
            });
    };

    const handleCloseSearchDialog = () => {
        setDialogSearchOpen(false);
    };

    const handleOpenSearchDialog = () => {
        setDialogSearchOpen(true);
    };

    return {
        isDialogSearchOpen,
        handleOpenSearchDialog,
        handleSelectionChange,
        handleCloseSearchDialog,
    };
};
