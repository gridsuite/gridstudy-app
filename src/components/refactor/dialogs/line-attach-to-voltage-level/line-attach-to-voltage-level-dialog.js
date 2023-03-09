/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    CONNECTIVITY,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    VOLTAGE_LEVEL,
    ID,
    BUS_OR_BUSBAR_SECTION,
    SLIDER_PERCENTAGE,
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    LINE_TO_ATTACH_TO_ID,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { attachLine } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityData,
    getConnectivityWithoutPositionValidationSchema,
} from '../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm from './line-attach-to-voltage-level-form';
import {
    getPercentageAreaData,
    getPercentageAreaEmptyFormData,
    getPercentageAreaValidationSchema,
} from '../percentage-area/percentage-area-utils';
import { MODIFICATION_TYPES } from 'components/util/modification-type';

const emptyFormData = {
    [LINE_TO_ATTACH_TO_ID]: null,
    [ATTACHMENT_LINE_ID]: '',
    [ATTACHMENT_POINT_ID]: '',
    [ATTACHMENT_POINT_NAME]: '',
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getPercentageAreaEmptyFormData(),
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO_ID]: yup.string().nullable().required(),
        [ATTACHMENT_LINE_ID]: yup.string().required(),
        [ATTACHMENT_POINT_ID]: yup.string().required(),
        [ATTACHMENT_POINT_NAME]: yup.string(),
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getPercentageAreaValidationSchema(),
        ...getConnectivityWithoutPositionValidationSchema(),
    })
    .required();

/**
 * Dialog to attach line to voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineAttachToVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    editData,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const [attachmentLine, setAttachmentLine] = useState(null);

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromEditDataToFormValues = useCallback(
        (lineAttach) => {
            reset({
                [LINE_TO_ATTACH_TO_ID]: lineAttach.lineToAttachToId,
                [LINE1_ID]: lineAttach.newLine1Id,
                [LINE1_NAME]: lineAttach.newLine1Name,
                [LINE2_ID]: lineAttach.newLine2Id,
                [LINE2_NAME]: lineAttach.newLine2Name,
                [ATTACHMENT_LINE_ID]: lineAttach?.attachmentLine?.equipmentId,
                [ATTACHMENT_POINT_ID]: lineAttach?.attachmentPointId,
                [ATTACHMENT_POINT_NAME]: lineAttach?.attachmentPointName,
                ...getPercentageAreaData({
                    percent: lineAttach.percent,
                }),
                ...getConnectivityData({
                    busbarSectionId: lineAttach.bbsOrBusId,
                    voltageLevelId:
                        lineAttach?.existingVoltageLevelId ??
                        lineAttach?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            });
            setAttachmentLine(lineAttach?.attachmentLine);
            setNewVoltageLevel(lineAttach?.mayNewVoltageLevelInfos);
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (lineAttach) => {
            attachLine(
                studyUuid,
                currentNodeUuid,
                editData?.uuid,
                lineAttach[LINE_TO_ATTACH_TO_ID],
                parseFloat(lineAttach[SLIDER_PERCENTAGE]),
                lineAttach[ATTACHMENT_POINT_ID],
                sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                newVoltageLevel,
                lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                lineAttach[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                attachmentLine,
                lineAttach[LINE1_ID],
                sanitizeString(lineAttach[LINE1_NAME]),
                lineAttach[LINE2_ID],
                sanitizeString(lineAttach[LINE2_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineAttachmentError',
                });
            });
        },
        [
            attachmentLine,
            currentNodeUuid,
            editData,
            newVoltageLevel,
            snackError,
            studyUuid,
        ]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineDo = useCallback(
        (
            studyUuid,
            currentNodeUuid,
            lineId,
            lineName,
            seriesResistance,
            seriesReactance,
            shuntConductance1,
            shuntSusceptance1,
            shuntConductance2,
            shuntSusceptance2,
            connectivity1VlId,
            connectivity1BobbsId,
            connectivity2VlId,
            connectivity2BobbsId,
            permanentCurrentLimit1,
            permanentCurrentLimit2,
            isUpdate,
            modificationUuid
        ) => {
            return new Promise(() => {
                const preparedLine = {
                    type: MODIFICATION_TYPES.LINE_CREATION.type,
                    equipmentId: lineId,
                    equipmentName: lineName,
                    seriesResistance: seriesResistance,
                    seriesReactance: seriesReactance,
                    shuntConductance1: shuntConductance1,
                    shuntSusceptance1: shuntSusceptance1,
                    shuntConductance2: shuntConductance2,
                    shuntSusceptance2: shuntSusceptance2,
                    currentLimits1: {
                        permanentLimit: permanentCurrentLimit1,
                    },
                    currentLimits2: {
                        permanentLimit: permanentCurrentLimit2,
                    },
                };
                setAttachmentLine(preparedLine);
                methods.setValue(ATTACHMENT_LINE_ID, preparedLine.equipmentId, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            });
        },
        [methods]
    );

    const onVoltageLevelDo = useCallback(
        ({
            studyUuid,
            currentNodeUuid,
            voltageLevelId,
            voltageLevelName,
            nominalVoltage,
            substationId,
            busbarSections,
            busbarConnections,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    nominalVoltage: nominalVoltage,
                    substationId: substationId,
                    busbarSections: busbarSections,
                    busbarConnections: busbarConnections,
                };
                setNewVoltageLevel(preparedVoltageLevel);
                reset({
                    ...methods.getValues(),
                    ...getConnectivityData({
                        busbarSectionId:
                            preparedVoltageLevel.busbarSections[0].id,
                        voltageLevelId: preparedVoltageLevel.equipmentId,
                    }),
                });
            });
        },
        [methods, reset]
    );

    const vl = methods.watch();

    const onVoltageLevelChange = useCallback(() => {
        if (
            vl?.connectivity?.voltageLevel?.id !== newVoltageLevel?.equipmentId
        ) {
            setNewVoltageLevel(null);
        }
    }, [vl, newVoltageLevel]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-attach-voltage-level-to-a-line"
                titleId="LineAttachToVoltageLevel"
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onLineDo={onLineDo}
                    lineToEdit={attachmentLine}
                    onVoltageLevelDo={onVoltageLevelDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onVoltageLevelChange={onVoltageLevelChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

LineAttachToVoltageLevelDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default LineAttachToVoltageLevelDialog;
