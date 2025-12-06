import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export default function useAuthCheck() {
  const context = useContext(AuthContext);

  // prevent undefined errors
  if (!context) {
    return {
      isLoggedin: false,
      user: null,
    };
  }

  return context;
}
