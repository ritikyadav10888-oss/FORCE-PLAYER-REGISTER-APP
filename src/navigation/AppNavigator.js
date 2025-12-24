import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';
import Button from '../components/Button';

import { ROLES, useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';

// Screens
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OrganizerDashboard from '../screens/Organizer/OrganizerDashboard';
import OrganizerProfile from '../screens/Organizer/OrganizerProfile';
import OwnerDashboard from '../screens/Owner/OwnerDashboard';
import LeaderboardScreen from '../screens/Player/LeaderboardScreen';
import PlayerDashboard from '../screens/Player/PlayerDashboard';
import PlayerProfile from '../screens/Player/PlayerProfile';
import TournamentDetailsScreen from '../screens/Player/TournamentDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const auth = useAuth();
    const { user, loading, logout } = auth || { loading: true };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.appBackground }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: '#fff', marginTop: 20 }}>Initializing App...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.appBackground } }}>
                {!user ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    // Role Based Stacks
                    <>
                        {user.role === ROLES.PLAYER && (
                            <>
                                <Stack.Screen name="PlayerDashboard" component={PlayerDashboard} />
                                <Stack.Screen name="PlayerProfile" component={PlayerProfile} />
                                <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                                <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} />
                            </>
                        )}
                        {user.role === ROLES.ORGANIZER && (
                            <>
                                <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboard} />
                                <Stack.Screen name="OrganizerProfile" component={OrganizerProfile} />
                            </>
                        )}
                        {user.role === ROLES.OWNER && (
                            <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} />
                        )}
                        {/* Fallback for invalid role */}
                        {user.role && !Object.values(ROLES).includes(user.role) && (
                            <Stack.Screen
                                name="RoleError"
                                children={() => (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.appBackground }}>
                                        <Text style={{ color: '#fff' }}>Invalid User Role: {user.role}</Text>
                                        <Button title="Logout" onPress={logout} style={{ marginTop: 20 }} />
                                    </View>
                                )}
                            />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
