import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { userService } from '@/gateway/services'

export function useAuthInitialization() {
  const { user, accessToken, setUser } = useAuthStore((state) => state.auth)
  
  // Fetch user profile if we have a token but no user data
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user-profile-initialization'],
    queryFn: userService.getProfile,
    enabled: !!accessToken && !user, // Only fetch if we have token but no user data
    retry: false,
  })

  useEffect(() => {
    // If we successfully fetched user profile and don't have user data, set it
    if (userProfile && !user && accessToken) {
      // Transform the profile data to match AuthUser interface
      const authUser = {
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        chandaNo: userProfile.memberNo,
        unit: userProfile.unit,
        permissions: [], // We'll need to get this from a separate endpoint
        roles: userProfile.roles || [],
        accessToken,
        expiresIn: 0, // We don't have this from profile
        tokenType: 'Bearer',
        scope: '',
        refreshToken: localStorage.getItem('refreshToken') || '',
      }
      
      setUser(authUser)
    }
  }, [userProfile, user, accessToken, setUser])

  return { isLoading }
}
