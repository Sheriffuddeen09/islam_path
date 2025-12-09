import {useAuth} from './AuthProvider';

export default function useAuthCheck() {
  const context = useAuth();

  // prevent undefined errors
  if (!context) {
    return {
      isLoggedin: false,
      user: null,
    };
  }

  return context;
}
