import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../commons/modificationDialog';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../../../util/equipment-types';
import React, { useCallback } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';

const emptyFormData = {};
const schema = yup.object().shape({});

const SubstationCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = 'substations';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (substation) => {};

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback((substation) => {}, []);
    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-substation"
                maxWidth={'md'}
                titleId="CreateSubstation"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.SUBSTATION.type}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default SubstationCreationDialog;
