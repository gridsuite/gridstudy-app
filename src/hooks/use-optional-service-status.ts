import { useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../components/utils/optional-services';

export const useOptionalServiceStatus = (
    serviceName: OptionalServicesNames,
): OptionalServicesStatus | undefined => {
    const optionalServices = useSelector(
        (state: ReduxState) => state.optionalServices,
    );
    const optionalService = optionalServices?.find(
        (service) => service.name === serviceName,
    );
    return optionalService?.status;
};
