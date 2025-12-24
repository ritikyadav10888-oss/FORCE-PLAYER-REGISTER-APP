import { LucideWifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { theme } from '../styles/theme';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [animValue] = useState(new Animated.Value(-100));

    useEffect(() => {
        const updateOnlineStatus = (online) => {
            setIsOnline(online);
            Animated.spring(animValue, {
                toValue: online ? -100 : 60,
                useNativeDriver: true,
                bounciness: 4,
            }).start();
        };

        if (Platform.OS === 'web') {
            const handleOnline = () => updateOnlineStatus(true);
            const handleOffline = () => updateOnlineStatus(false);

            updateOnlineStatus(navigator.onLine);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        } else {
            import('@react-native-community/netinfo').then((NetInfo) => {
                const unsubscribe = NetInfo.default.addEventListener(state => {
                    const online = state.isConnected && state.isInternetReachable !== false;
                    updateOnlineStatus(online);
                });
                return () => unsubscribe();
            }).catch(() => updateOnlineStatus(true));
        }
    }, []);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: animValue }] }]}>
            <View style={styles.toast}>
                <LucideWifiOff size={20} color={theme.colors.error} />
                <Text style={styles.text}>Connection unstable. Waiting for signal...</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        alignItems: 'center',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 100,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.error + '40',
        ...theme.shadows.soft,
    },
    text: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
    },
});
