/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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

const emptyFormData = {
    [VOLTAGE_REGULATION_TYPE]: null,
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
};

const RegulatingTerminalModificationDialog = ({
    data,
    currentNode,
    studyUuid,
    onModifyRegulatingTerminalGenerator,
    ...dialogProps
}) => {
    const intl = useIntl();
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
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

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

    const getPreviousRegulationTypeValues = useCallback(() => {
        reset({
            [VOLTAGE_REGULATION_TYPE]: previousRegulationType,
        });
    }, [previousRegulationType, reset]);

    useEffect(() => {
        getPreviousRegulationTypeValues();
    }, [getPreviousRegulationTypeValues]);

    const translatedPreviousRegulationLabel = useMemo(() => {
        if (REGULATION_TYPES[previousRegulationType]) {
            return intl.formatMessage({
                id: REGULATION_TYPES[previousRegulationType].label,
            });
        }
        return null;
    }, [intl, previousRegulationType]);

    const watchVoltageRegulationType = useWatch({
        control,
        name: VOLTAGE_REGULATION_TYPE,
    });

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={VOLTAGE_REGULATION_TYPE}
            label={'RegulationTypeText'}
            size={'small'}
            previousValue={translatedPreviousRegulationLabel}
        />
    );

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
    }, [studyUuid, currentNode]);

    const isDistantRegulation = useMemo(() => {
        return (
            watchVoltageRegulationType === REGULATION_TYPES.DISTANT.id ||
            (!watchVoltageRegulationType &&
                previousRegulationType === REGULATION_TYPES.DISTANT.id)
        );
    }, [previousRegulationType, watchVoltageRegulationType]);

    const onSubmit = useCallback(
        (voltageRegulationGenerator) => {
            onModifyRegulatingTerminalGenerator(voltageRegulationGenerator);
        },
        [onModifyRegulatingTerminalGenerator]
    );

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

RegulatingTerminalModificationDialog.propTypes = {
    data: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    onModifyRegulatingTerminalGenerator: PropTypes.func,
};

export default RegulatingTerminalModificationDialog;
