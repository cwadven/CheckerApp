import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventEmitter, AUTH_EVENTS } from '../../utils/eventEmitter';

export const AuthEventHandler = () => {
  const { redirectToLogin } = useAuth();

  useEffect(() => {
    const handleRequireLogin = (message: string) => {
      redirectToLogin(message);
    };

    eventEmitter.on(AUTH_EVENTS.REQUIRE_LOGIN, handleRequireLogin);
    return () => {
      eventEmitter.off(AUTH_EVENTS.REQUIRE_LOGIN, handleRequireLogin);
    };
  }, [redirectToLogin]);

  return null;
}; 