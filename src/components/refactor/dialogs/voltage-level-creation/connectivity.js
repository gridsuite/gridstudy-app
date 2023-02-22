import { gridItem } from 'components/dialogs/dialogUtils';

import {
    BUS_BAR_SECTIONS,
    FROM_BBS,
    ID,
    NAME,
    SWITCH_KIND,
    TO_BBS,
} from 'components/refactor/utils/field-constants';
import AutocompleteInput from 'components/refactor/rhf-inputs/autocomplete-input';
import { SWITCH_TYPE } from 'components/network/constants';
import SelectInput from 'components/refactor/rhf-inputs/select-input';
import { useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';

export const Connectivity = ({ id, index }) => {
    /* const { fields: rows } = useFieldArray({
        name: `${BUS_BAR_SECTIONS}`,
    }); */
    const [busBarSections, setbusBarSections] = useState([]);

    const watchBusBarSections = useWatch({
        name: `${BUS_BAR_SECTIONS}`,
    });

    useEffect(() => {
        if (watchBusBarSections) {
            setbusBarSections(
                watchBusBarSections?.map((busBarSection) => busBarSection[ID])
            );
        }
    }, [watchBusBarSections, setbusBarSections]);

    /*   const fromBBSField = (
        <SelectInput
            name={`${id}.${index}.${FROM_BBS}`}
            label="SUBSTATION"
            options={['id', 'tot', 'rrr']}
            fullWidth
            size={'small'}
            //formProps={filledTextField}
        />
    ); */

    const fromBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={`${id}.${index}.${FROM_BBS}`}
            label="BusBarSections"
            /* options={rows.map((value) => {
                return { id: value?.ID, label: value?.ID };
            })} */
            options={busBarSections}
            //getOptionLabel={getObjectId}
            //isOptionEqualToValue={areIdsEqual}
            //inputTransform={(value) => (value === null ? '' : value)}
            /*  outputTransform={(value) =>
                typeof value === 'string'
                    ? getConnectivityBusBarSectionData({
                          busbarSectionId: value,
                      })
                    : value
            } */
            size={'small'}
        />
    );

    const toBBSField = (
        <AutocompleteInput
            allowNewValue
            forcePopupIcon
            //hack to work with freesolo autocomplete
            //setting null programatically when freesolo is enable wont empty the field
            name={`${id}.${index}.${TO_BBS}`}
            label="BusBarSections"
            options={busBarSections}
            //getOptionLabel={getObjectId}
            //isOptionEqualToValue={areIdsEqual}
            inputTransform={(value) => (value === null ? '' : value)}
            /*  outputTransform={(value) =>
            typeof value === 'string'
                ? getConnectivityBusBarSectionData({
                      busbarSectionId: value,
                  })
                : value
        } */
            size={'small'}
        />
    );

    const switchKindField = (
        <SelectInput
            name={`${id}.${index}.${SWITCH_KIND}`}
            label={'Type'}
            options={Object.values(SWITCH_TYPE)}
            fullWidth
            disableClearable={true}
            //disabled={!isVoltageRegulationOn()}
            size={'small'}
        />

        /*   <SelectInput
        name={ENERGY_SOURCE}
        label={'EnergySourceText'}
        options={ENERGY_SOURCES}
        fullWidth
        size={'small'}
        disableClearable={true}
        formProps={{ ...italicFontTextField, ...filledTextField }}
    /> */
    );

    return (
        <>
            {gridItem(fromBBSField, 3)}
            {gridItem(toBBSField, 3)}
            {gridItem(switchKindField, 3)}

            {/*} {gridItem(verticalPositionField, 2.5)} */}
        </>
    );
};
