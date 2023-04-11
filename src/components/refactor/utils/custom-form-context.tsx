import React, { FC, ReactNode, useContext } from 'react';
import { FieldValues, useFormContext, UseFormReturn } from 'react-hook-form';
import { FormProvider, FormProviderProps } from 'react-hook-form';
import yup from './yup-config';

interface CustomFormContextProps {
    removeOptional: boolean;
    validationSchema: yup.AnySchema | null;
}

interface CustomFormContextProviderProps extends CustomFormContextProps {
    methods: FormProviderProps;
    children: ReactNode;
}

const CustomFormContext = React.createContext<CustomFormContextProps>({
    removeOptional: false,
    validationSchema: null,
});

const CustomFormContextProvider: FC<CustomFormContextProviderProps> = (
    props
) => {
    const { methods, validationSchema, removeOptional, children } = props;

    return (
        <FormProvider {...methods}>
            <CustomFormContext.Provider
                value={{
                    validationSchema: validationSchema,
                    removeOptional: removeOptional,
                }}
            >
                {children}
            </CustomFormContext.Provider>
        </FormProvider>
    );
};

export default CustomFormContextProvider;

interface UseCustomFormContextReturn extends UseFormReturn<FieldValues, any> {
    removeOptional: boolean;
    validationSchema: yup.AnySchema | null;
}

export const useCustomFormContext = (): UseCustomFormContextReturn => {
    const customMethods = useContext(CustomFormContext);
    const methods = useFormContext();

    return { ...methods, ...customMethods };
};
