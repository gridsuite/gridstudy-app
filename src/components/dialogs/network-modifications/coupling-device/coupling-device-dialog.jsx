/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {BUS_BAR_COUNT, COUPLING_OMNIBUS, EQUIPMENT_ID, SECTION_COUNT,} from 'components/utils/field-constants';
import {CouplingDeviceDialog} from './coupling-device-dialog.jsx';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useForm, useFormContext, useWatch} from 'react-hook-form';
import {FetchStatus} from "../../../../services/utils.js";
import {EquipmentIdSelector} from "../../equipment-id/equipment-id-selector.js";
import {EQUIPMENT_TYPES} from "../../../utils/equipment-types.js";
import {ModificationDialog} from "../../commons/modificationDialog.js";
import {yupResolver} from "@hookform/resolvers/yup";

export const CouplingDeviceForm = (...dialogProps) => {
    const { setValue } = useFormContext();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);

    const { reset, getValues } = formMethods;

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        // the cleanup function is triggered every time sectionOptions changes and when unmounting
        return () => setValue(COUPLING_OMNIBUS, []);
    }, [sectionOptions, setValue]);

    return (
        <ModificationDialog
            fullWidth
            onClear={clear}
            onSave={onSubmit}
            maxWidth={'md'}
            open={open}
            titleId="CouplingDeviceCreation"
            keepMounted={true}
            showNodeNotBuiltWarning={selectedId != null}
            isDataFetching={
                isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
            }
            {...dialogProps}
        >
            {selectedId == null && (
                <EquipmentIdSelector
                    defaultValue={selectedId}
                    setSelectedId={setSelectedId}
                    equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
                    fillerHeight={4}
                />
            )}
            {selectedId != null && (
                <CouplingDeviceDialog equipmentId={selectedId} />
            )}
        </ModificationDialog>
    );
};
