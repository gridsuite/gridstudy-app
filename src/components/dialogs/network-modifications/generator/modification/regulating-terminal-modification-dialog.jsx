/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { yupResolver } from '@hookform/resolvers/yup';
import {
    EQUIPMENT,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@mui/material';
import RegulatingTerminalForm from 'components/dialogs/regulating-terminal/regulating-terminal-form';
import { getTapChangerEquipmentSectionTypeValue } from 'components/utils/utils';
import { fetchVoltageLevelsListInfos } from 'services/study/network';
import { getRegulatingTerminalFormData } from 'components/dialogs/regulating-terminal/regulating-terminal-form-utils';
import { CustomFormProvider } from '@gridsuite/commons-ui';
import GridItem from '../../../commons/grid-item';

const emptyFormData = {
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
};

const RegulatingTerminalModificationDialog = ({
    data,
    previousData,
    currentNode,
    studyUuid,
    onModifyRegulatingTerminalGenerator,
    ...dialogProps
}) => {
    const formSchema = yup
        .object()
        .shape({
            [VOLTAGE_LEVEL]: yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string(),
                    [NAME]: yup.string(),
                    [SUBSTATION_ID]: yup.string(),
                    [NOMINAL_VOLTAGE]: yup.string(),
                    [TOPOLOGY_KIND]: yup.string().nullable(),
                })
                .required(),
            [EQUIPMENT]: yup
                .object()
                .nullable()
                .shape({
                    [ID]: yup.string(),
                    [NAME]: yup.string().nullable(),
                    [TYPE]: yup.string(),
                })
                .required(),
        })
        .required();
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNode.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode.id)
                .then((values) => {
                    setVoltageLevelOptions(values.sort((a, b) => a.id.localeCompare(b.id)));
                })
                .catch((error) => {
                    console.error('Error fetching voltage levels: ', error);
                });
        }
    }, [studyUuid, currentNode]);

    const onSubmit = useCallback(
        (voltageRegulationGenerator) => {
            onModifyRegulatingTerminalGenerator(voltageRegulationGenerator);
        },
        [onModifyRegulatingTerminalGenerator]
    );

    const fromEditDataToFormValues = useCallback(
        (data) => {
            reset({
                ...getRegulatingTerminalFormData({
                    equipmentId: data.regulatingTerminalConnectableId,
                    equipmentType: data.regulatingTerminalConnectableType,
                    voltageLevelId: data.regulatingTerminalVlId,
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (data) {
            if (data.regulatingTerminalConnectableId.trim() !== '') {
                fromEditDataToFormValues(data);
            }
        }
    }, [fromEditDataToFormValues, data]);

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={''}
            voltageLevelOptions={voltageLevelOptions}
            equipmentSectionTypeDefaultValue={''}
            currentNodeUuid={currentNode.id}
            studyUuid={studyUuid}
            previousRegulatingTerminalValue={previousData?.regulatingTerminalVlId}
            previousEquipmentSectionTypeValue={getTapChangerEquipmentSectionTypeValue(previousData)}
        />
    );

    return (
        <CustomFormProvider removeOptional={true} validationSchema={formSchema} {...formMethods}>
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
                    {
                        <>
                            <Grid item xs={12}>
                                <FormattedMessage id="RegulatingTerminalGenerator" />
                            </Grid>
                            <GridItem size={12}>{regulatingTerminalField}</GridItem>
                        </>
                    }
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
};

RegulatingTerminalModificationDialog.propTypes = {
    data: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    onModifyRegulatingTerminalGenerator: PropTypes.func,
};

export default RegulatingTerminalModificationDialog;
