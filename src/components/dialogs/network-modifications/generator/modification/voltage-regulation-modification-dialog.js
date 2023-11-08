import { SelectInput } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { gridItem } from 'components/dialogs/dialogUtils';
import {
    EQUIPMENT,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_TYPE,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import { REGULATION_TYPES } from 'components/network/constants';
import { Grid } from '@mui/material';
import RegulatingTerminalForm from 'components/dialogs/regulating-terminal/regulating-terminal-form';
import { getTapChangerEquipmentSectionTypeValue } from 'components/utils/utils';
import { fetchVoltageLevelsListInfos } from 'services/study/network';

const VoltageRegulationModificationDialog = ({
    data,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    onModifyVoltageRegulationGenerator,
    ...dialogProps
}) => {
    const emptyFormData = useMemo(
        () => ({
            [VOLTAGE_REGULATION_TYPE]: null,
            [VOLTAGE_LEVEL]: null,
            [EQUIPMENT]: null,
        }),
        []
    );

    const formSchema = yup
        .object()
        .shape({
            [VOLTAGE_REGULATION_TYPE]: yup.string().nullable().required(),
            [VOLTAGE_LEVEL]: yup.object().nullable(),
            [EQUIPMENT]: yup.object().nullable(),
        })
        .required();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { control, reset } = formMethods;

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const previousRegulationType = useMemo(() => {
        if (
            data?.regulatingTerminalVlId ||
            data?.regulatingTerminalConnectableId
        ) {
            return REGULATION_TYPES.DISTANT.id;
        } else {
            return REGULATION_TYPES.LOCAL.id;
        }
    }, [data]);

    const voltageRegulationType = useWatch({
        control,
        name: VOLTAGE_REGULATION_TYPE,
        defaultValue: previousRegulationType,
    });

    useEffect(() => {
        if (studyUuid && currentNode.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode.id).then(
                (values) => {
                    setVoltageLevelOptions(
                        values.sort((a, b) => a.id.localeCompare(b.id))
                    );
                }
            );
        }
    }, [studyUuid, currentNode, formMethods]);

    const isDistantRegulation = useMemo(() => {
        return (
            voltageRegulationType === REGULATION_TYPES.DISTANT.id ||
            (!voltageRegulationType &&
                previousRegulationType === REGULATION_TYPES.DISTANT.id)
        );
    }, [previousRegulationType, voltageRegulationType]);

    const onSubmit = useCallback(
        (voltageRegulationGenerator) => {
            onModifyVoltageRegulationGenerator(voltageRegulationGenerator);
        },
        [onModifyVoltageRegulationGenerator]
    );
    const intl = useIntl();

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={''}
            voltageLevelOptions={voltageLevelOptions}
            equipmentSectionTypeDefaultValue={''}
            currentNodeUuid={currentNode.id}
            studyUuid={studyUuid}
            previousRegulatingTerminalValue={data?.regulatingTerminalVlId}
            previousEquipmentSectionTypeValue={getTapChangerEquipmentSectionTypeValue(
                data
            )}
        />
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    const getVoltageRegulationTypeLabel = () => {
        return isDistantRegulation
            ? intl.formatMessage({ id: REGULATION_TYPES.DISTANT.label })
            : intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label });
    };
    const voltageRegulationTypeField = (
        <SelectInput
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            fullWidth
            size={'small'}
            previousValue={getVoltageRegulationTypeLabel()}
        />
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-voltage-level"
                maxWidth={'md'}
                titleId="EditVoltageRegulation"
                {...dialogProps}
            >
                <Grid container sx={{ paddingTop: 1 }} spacing={2}>
                    {gridItem(voltageRegulationTypeField, 6)}
                    {isDistantRegulation && (
                        <>
                            <Grid item xs={12}>
                                <FormattedMessage id="RegulatingTerminalGenerator" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 12)}
                        </>
                    )}
                </Grid>
            </ModificationDialog>
        </FormProvider>
    );
};

VoltageRegulationModificationDialog.propTypes = {
    data: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    onModifyVoltageRegulationGenerator: PropTypes.func,
    editDataFetchStatus: PropTypes.string,
};

export default VoltageRegulationModificationDialog;
