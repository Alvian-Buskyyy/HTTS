import { createContext } from 'react';

// Create the Authentication Context
const AuthContext = createContext({
  auth: {
    isAuthenticated: false,
    user: null,
    loading: true
  },
  login: () => {},
  logout: () => {}
});

export default AuthContext;
