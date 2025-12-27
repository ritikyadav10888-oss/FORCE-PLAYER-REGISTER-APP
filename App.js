import { useEffect, useState } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TournamentProvider } from './src/context/TournamentContext';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        html, body { -ms-overflow-style: none; scrollbar-width: none; height: 100%; }
        #root { height: 100%; display: flex; flex-direction: column; }
    `;
    document.head.appendChild(style);
}
// import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import SimpleLoginScreen from './src/screens/Auth/SimpleLoginScreen';
import OrganizerDashboard from './src/screens/Organizer/OrganizerDashboard';
import OrganizerProfile from './src/screens/Organizer/OrganizerProfile'; // Import OrganizerProfile
import OwnerDashboard from './src/screens/Owner/OwnerDashboard';
import PaymentScreenComponent from './src/screens/Player/PaymentScreen';
import PlayerDashboard from './src/screens/Player/PlayerDashboard';
import PlayerProfile from './src/screens/Player/PlayerProfile'; // Import PlayerProfile
import TournamentDetailsScreen from './src/screens/Player/TournamentDetailsScreen';
import SplashScreen from './src/screens/SplashScreen';

function MainApp() {
    const [isSplashVisible, setSplashVisible] = useState(false);
    const { user } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('Login'); // Login, Register, ForgotPassword, PlayerProfile, OrganizerProfile

    const [screenParams, setScreenParams] = useState({});

    useEffect(() => {
        if (user) {
            // Only reset to Dashboard if we are currently on Login/Register
            // If we are deep in a screen (like TournamentDetails), keep it? 
            // For simplicity, existing logic resets to Dashboard.
            // Let's modify to keep current if valid, else Dashboard.
            if (['Login', 'Register', 'ForgotPassword'].includes(currentScreen)) {
                setCurrentScreen('Dashboard');
            }
        } else {
            setCurrentScreen('Login');
        }
    }, [user]);

    // Handle Android Back Button
    useEffect(() => {
        const backAction = () => {
            if (user) {
                // User is authenticated
                if (currentScreen === 'Dashboard') {
                    Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                        {
                            text: 'Cancel',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        { text: 'YES', onPress: () => BackHandler.exitApp() },
                    ]);
                    return true;
                } else {
                    // Navigate back to Dashboard from sub-screens
                    setCurrentScreen('Dashboard');
                    setScreenParams({}); // Clear params
                    return true;
                }
            } else {
                // User is NOT authenticated
                if (currentScreen === 'Login') {
                    // Allow default exit
                    return false;
                } else {
                    // Navigate back to Login from Register/Forgot Password
                    setCurrentScreen('Login');
                    return true;
                }
            }
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [user, currentScreen]);

    // Navigation handler
    const navigation = {
        navigate: (screen, params = {}) => {
            setCurrentScreen(screen);
            setScreenParams(params);
        },
        goBack: () => {
            setCurrentScreen('Dashboard'); // Default back goes to Dashboard if logged in
            setScreenParams({});
        },
        setParams: (newParams) => {
            setScreenParams(prev => ({ ...prev, ...newParams }));
        }
    };

    if (isSplashVisible) {
        return <SplashScreen onFinish={() => setSplashVisible(false)} />;
    }

    // If user is logged in, show appropriate dashboard or profile
    if (user) {
        // Shared Routes
        if (currentScreen === 'PlayerProfile') {
            return <PlayerProfile navigation={navigation} route={{ params: screenParams }} />;
        }
        if (currentScreen === 'OrganizerProfile') {
            return <OrganizerProfile navigation={navigation} route={{ params: screenParams }} />;
        }
        if (currentScreen === 'TournamentDetails') {
            return <TournamentDetailsScreen navigation={navigation} route={{ params: screenParams }} />;
        }
        if (currentScreen === 'PaymentScreen') {
            if (!PaymentScreenComponent) return <Text>Error: Payment Component Missing</Text>;
            return <PaymentScreenComponent navigation={navigation} route={{ params: screenParams }} />;
        }

        if (user.role === 'PLAYER') {
            // Ensure we default to Dashboard view if screen is Login/Register etc
            return <PlayerDashboard navigation={navigation} route={{ params: screenParams }} />;
        } else if (user.role === 'ORGANIZER') {
            return <OrganizerDashboard navigation={navigation} route={{ params: screenParams }} />;
        } else if (user.role === 'OWNER') {
            return <OwnerDashboard navigation={navigation} route={{ params: screenParams }} />;
        }
    }

    // If not logged in, show auth screens
    if (currentScreen === 'Register') {
        return <RegisterScreen navigation={navigation} />;
    }

    if (currentScreen === 'ForgotPassword') {
        return <ForgotPasswordScreen navigation={navigation} route={{ params: { role: 'PLAYER' } }} />;
    }

    return <SimpleLoginScreen navigation={navigation} />;
}

export default function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <AuthProvider>
                    <TournamentProvider>
                        <MainApp />
                    </TournamentProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}
