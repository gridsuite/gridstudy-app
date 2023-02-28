import { useSnackMessage } from '@gridsuite/commons-ui';
import {FormProvider, useForm} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import yup from '../../utils/yup-config';
import ModificationDialog from "../commons/modificationDialog";
import EquipmentSearchDialog from "../../../dialogs/equipment-search-dialog";
import GeneratorScalingForm from "./generator-scaling-form";
import {useCallback} from "react";
import {useFormSearchCopy} from "../../../dialogs/form-search-copy-hook";

const emptyFormData = {};

const schema = yup.object().shape({}).required();

const GeneratorScalingDialogRefactor = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = 'generators';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromSearchCopyToFormValues = (generatorScaling) => {};

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

    const onSubmit = useCallback((generatorScaling) => {
        console.log('generator scaling : ', generatorScaling);
    }, []);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-generator"
                maxWidth={'md'}
                titleId="CreateGenerator"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <GeneratorScalingForm />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'GENERATOR'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    )
};

export default GeneratorScalingDialogRefactor;
