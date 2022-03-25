import { useIntl } from 'react-intl';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { fetchEquipmentInfos } from '../../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../../utils/messages';

export const useFormSearchCopy = ({
    studyUuid,
    selectedNodeUuid,
    equipmentPath,
    toFormValues,
    setFormValues,
    clearValues,
}) => {
    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleSelectionChange = (element) => {
        let msg;
        return fetchEquipmentInfos(
            studyUuid,
            selectedNodeUuid,
            equipmentPath,
            element.id,
            true
        ).then((response) => {
            if (response.status === 200) {
                response.json().then((equipment) => {
                    clearValues();
                    const equipmentFormValues = toFormValues(equipment);
                    setFormValues(equipmentFormValues);

                    msg = intl.formatMessage(
                        { id: 'EquipmentCopied' },
                        {
                            equipmentId: element.id,
                        }
                    );
                    enqueueSnackbar(msg, {
                        variant: 'info',
                        persist: false,
                        style: { whiteSpace: 'pre-line' },
                    });
                });
            } else {
                console.error(
                    'error while fetching equipment {equipmentId} : status = {status}',
                    element.id,
                    response.status
                );
                if (response.status === 404) {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed404' },
                        {
                            equipmentId: element.id,
                        }
                    );
                } else {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed' },
                        {
                            equipmentId: element.id,
                        }
                    );
                }
                displayErrorMessageWithSnackbar({
                    errorMessage: msg,
                    enqueueSnackbar,
                });
            }
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
