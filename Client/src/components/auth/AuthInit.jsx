import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginFailure, initializeAuth } from '../../redux/slices/authSlice';
import { completeTutorial, resetOnboarding } from '../../redux/slices/onboardingSlice';
import { authAPI } from '../../services/axios.api';

const AuthInit = ({ children }) => {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get the current user from the backend using the cookie
        const response = await authAPI.getCurrentUser();
        
        if (response.success && response.user) {
          // If we get a user back, we're authenticated
          dispatch(loginSuccess({ user: response.user }));
          
          // Check and set tutorial completion state based on user data
          if (response.user.isTutorialCompleted) {
            dispatch(completeTutorial());
          } else {
            // Only reset if the user hasn't completed the tutorial
            dispatch(resetOnboarding());
          }
        } else {
          // If no user or success is false, we're not authenticated
          dispatch(loginFailure(response.message || 'Not authenticated'));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(loginFailure('Authentication failed'));
      } finally {
        // Always mark auth as initialized, even if it failed
        dispatch(initializeAuth());
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [dispatch, isInitialized]);

  // Show loading spinner while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children;
};

export default AuthInit; 