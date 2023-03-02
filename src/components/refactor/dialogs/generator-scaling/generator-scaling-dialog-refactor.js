import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import GeneratorScalingForm from './generator-scaling-form';
import { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { VARIATION_TYPE, VARIATIONS } from '../../utils/field-constants';
import { getVariationsSchema } from './variation/variation-utils';
import { generatorScaling } from '../../../../utils/rest-api';

const emptyFormData = {
    [VARIATION_TYPE]: 'DELTA_P',
    [VARIATIONS]: [],
};

const schema = yup
    .object()
    .shape({
        [VARIATION_TYPE]: yup.string().nullable().required(),
        ...getVariationsSchema(VARIATIONS),
    })
    .required();

const GeneratorScalingDialogRefactor = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    useEffect(() => {
        if (editData) {
            reset({
                [VARIATION_TYPE]: editData.variationType,
                [VARIATIONS]: editData.variations,
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (generatorScalingInfos) => {
            console.log('generator scaling : ', generatorScalingInfos);
            generatorScaling(
                studyUuid,
                currentNodeUuid,
                editData?.uuid ?? undefined,
                generatorScalingInfos[VARIATION_TYPE],
                generatorScalingInfos[VARIATIONS]
            ).catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'GeneratorScalingError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-generator"
                maxWidth={'md'}
                titleId="CreateGenerator"
                {...dialogProps}
            >
                <GeneratorScalingForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorScalingDialogRefactor;
