import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AuthProvider } from './src/context/AuthContext';
import { TournamentProvider } from './src/context/TournamentContext';
import AppNavigator from './src/navigation/AppNavigator';

console.log('=== INDEX.JS: Starting app registration ===');

function App() {
    console.log('App component rendering');

    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <AuthProvider>
                    <TournamentProvider>
                        <AppNavigator />
                    </TournamentProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}

console.log('=== INDEX.JS: Registering App component ===');
registerRootComponent(App);
console.log('=== INDEX.JS: Registration complete ===');
