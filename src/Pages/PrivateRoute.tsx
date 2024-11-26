import {Navigate} from 'react-router-dom';
import { isTokenValid } from '@/Api/auth';
import { ComponentType } from 'react';

const PrivateRoute = ({ component: Component, ...rest }: { component: ComponentType }) => {
    return isTokenValid() ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default PrivateRoute;