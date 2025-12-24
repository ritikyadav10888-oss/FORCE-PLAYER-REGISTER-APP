import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { API_URL } from '../config';

const AuthContext = createContext();

export const ROLES = {
    PLAYER: 'PLAYER',
    ORGANIZER: 'ORGANIZER',
    OWNER: 'OWNER',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [lastRole, setLastRole] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);



    const checkUser = async () => {
        try {
            const lr = await AsyncStorage.getItem('lastRole');
            if (lr) setLastRole(lr);

            const activeRole = await AsyncStorage.getItem('activeRole');
            if (activeRole) {
                const storedUser = await AsyncStorage.getItem(`user_${activeRole}`);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } else {
                // Compatibility for older sessions
                const legacyUser = await AsyncStorage.getItem('user');
                if (legacyUser) {
                    const parsed = JSON.parse(legacyUser);
                    setUser(parsed);
                    await AsyncStorage.setItem(`user_${parsed.role}`, legacyUser);
                    await AsyncStorage.setItem('activeRole', parsed.role);
                    await AsyncStorage.removeItem('user');
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (role, userData) => {
        try {
            console.log('Attempting login with:', userData.email);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData) // Don't send role, backend determines it
            });

            const data = await response.json();
            console.log('Login response:', response.status, response.ok);

            if (!response.ok) {
                console.error('Login failed:', data.error);
                throw new Error(data.error);
            }

            const userToStore = { ...data, id: data._id };
            const userRole = data.role; // Get role from response

            await AsyncStorage.setItem(`user_${userRole}`, JSON.stringify(userToStore));
            await AsyncStorage.setItem('activeRole', userRole);
            await AsyncStorage.setItem('lastRole', userRole);
            setLastRole(userRole);
            setUser(userToStore);
            console.log('Login successful for role:', userRole);
        } catch (e) {
            console.error('Login error:', e.message);
            throw e;
        }
    };

    const registerUser = async (data, role = ROLES.PLAYER, file = null, skipLogin = false) => {
        try {
            let aadharCardBase64 = null;

            if (file) {
                if (Platform.OS === 'web') {
                    if (file.file) {
                        try {
                            const result = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.onerror = reject;
                                reader.readAsDataURL(file.file);
                            });
                            aadharCardBase64 = result;
                        } catch (err) {
                            console.error("Error reading file", err);
                        }
                    }
                } else {
                    const FileSystem = require('expo-file-system');
                    aadharCardBase64 = await FileSystem.readAsStringAsync(file.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                }
            }

            const body = {
                ...data,
                role,
                ...(aadharCardBase64 ? { aadharCardBase64 } : {})
            };

            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.error);

            if (skipLogin) return responseData;

            const userToStore = { ...responseData, id: responseData._id };
            await AsyncStorage.setItem(`user_${role}`, JSON.stringify(userToStore));
            await AsyncStorage.setItem('activeRole', role);
            await AsyncStorage.setItem('lastRole', role);
            setLastRole(role);
            setUser(userToStore);
            return userToStore;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const updateUser = async (updatedData, file = null) => {
        try {
            let profileImageBase64 = null;

            if (file) {
                if (Platform.OS === 'web') {
                    if (file.file) {
                        profileImageBase64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file.file);
                        });
                    }
                } else {
                    try {
                        const FileSystem = require('expo-file-system');
                        profileImageBase64 = await FileSystem.readAsStringAsync(file.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                    } catch (e) {
                        console.error("FileSystem error:", e);
                    }
                }
            }

            const body = {
                ...updatedData,
                ...(profileImageBase64 ? { profileImageBase64 } : {})
            };

            const response = await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            const userToStore = { ...data, id: data._id };
            await AsyncStorage.setItem(`user_${user.role}`, JSON.stringify(userToStore));
            setUser(userToStore);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };



    const logout = async () => {
        try {
            if (user) {
                await AsyncStorage.removeItem(`user_${user.role}`);
                await AsyncStorage.removeItem('activeRole');
            }
            setUser(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, lastRole, loading, login, registerUser, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
