import { createContext, useContext, useState, FunctionComponent, ReactNode, useMemo } from 'react';

interface LoadFlowContextProps {
    showAdvancedLfParams: boolean;
    setShowAdvancedLfParams: (state: boolean) => void;
    showSpecificLfParams: boolean;
    setShowSpecificLfParams: (state: boolean) => void;
}

const LoadFlowContext = createContext<LoadFlowContextProps | undefined>(undefined);

export const LoadFlowProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);
    const [showSpecificLfParams, setShowSpecificLfParams] = useState(false);

    const contextValue = useMemo(
        () => ({
            showAdvancedLfParams,
            setShowAdvancedLfParams,
            showSpecificLfParams,
            setShowSpecificLfParams,
        }),
        [showAdvancedLfParams, showSpecificLfParams]
    );

    return <LoadFlowContext.Provider value={contextValue}>{children}</LoadFlowContext.Provider>;
};

export const useLoadFlowContext = () => {
    const context = useContext(LoadFlowContext);
    if (!context) {
        throw new Error('useLoadFlowContext must be used within a LoadFlowProvider');
    }
    return context;
};
