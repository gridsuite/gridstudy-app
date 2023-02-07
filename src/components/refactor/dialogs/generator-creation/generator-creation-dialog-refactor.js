/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {FormProvider, useForm} from "react-hook-form";
import ModificationDialog from "../commons/modificationDialog";
import EquipmentSearchDialog from "../../../dialogs/equipment-search-dialog";
import {useCallback} from "react";
import {useFormSearchCopy} from "../../../dialogs/form-search-copy-hook";
import {useParams} from "react-router-dom";
import {useSnackMessage} from "@gridsuite/commons-ui";
import {yupResolver} from "@hookform/resolvers/yup";
import yup from "../../utils/yup-config";
import {
    ACTIVE_POWER,
    ACTIVE_POWER_SET_POINT,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME, FORCED_OUTAGE_RATE,
    LOAD_TYPE,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    PLANNED_ACTIVE_POWER_SET_POINT, PLANNED_OUTAGE_RATE,
    RATED_NOMINAL_POWER,
    REACTIVE_POWER,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE
} from "../../utils/field-constants";
import {
    getConnectivityEmptyFormData,
    getConnectivityFormValidationSchema
} from "../connectivity/connectivity-form-utils";
import GeneratorCreationForm from "./generator-creation-form";

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getConnectivityEmptyFormData(),
};

const schema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [ENERGY_SOURCE]: yup.string().nullable(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().required(),
        [RATED_NOMINAL_POWER]: yup.number(),
        [ACTIVE_POWER_SET_POINT]: yup.number().required(),
        [TRANSIENT_REACTANCE]: yup.number(),
        [TRANSFORMER_REACTANCE]: yup.number(),
        [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number(),
        [STARTUP_COST]: yup.number(),
        [MARGINAL_COST]: yup.number(),
        [PLANNED_OUTAGE_RATE]: yup.number(),
        [FORCED_OUTAGE_RATE]: yup.number(),
        ...getConnectivityFormValidationSchema(),
    })
    .required();

const GeneratorCreationDialogRefactor = ({
    editData,
    currentNodeUuid,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const equipmentPath = 'generators';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const fromSearchCopyToFormValues = (generator) => {};

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    const clear = useCallback(() => {}, []);
    const onSubmit = useCallback(() => {}, []);

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
                <GeneratorCreationForm
                    voltageLevelOptionsPromise={voltageLevelOptionsPromise}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'GENERATOR'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorCreationDialogRefactor;