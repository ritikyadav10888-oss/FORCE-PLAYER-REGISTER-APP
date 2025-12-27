import { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

const TournamentContext = createContext();

export const TournamentProvider = ({ children }) => {
    const [tournaments, setTournaments] = useState([]);
    const [organizers, setOrganizers] = useState([]);
    const [players, setPlayers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    const { user } = useAuth(); // Access user role

    useEffect(() => {
        if (user) {
            loadTournaments(user.role);
        } else {
            loadTournaments();
        }
        loadOrganizers();
        loadPlayers();
    }, [user?.role]); // Reload when role changes

    const loadTournaments = async (role = '') => {
        try {
            const response = await fetch(`${API_URL}/tournaments?role=${role}`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            const data = await response.json();
            // Map _id to id for frontend compatibility
            const mapped = Array.isArray(data) ? data.map(t => ({ ...t, id: t._id })) : [];
            setTournaments(mapped);
        } catch (e) {
            console.error("Failed to load tournaments", e);
        }
    };

    const loadOrganizers = async () => {
        try {
            const response = await fetch(`${API_URL}/organizers`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            const data = await response.json();
            setOrganizers(Array.isArray(data) ? data.map(o => ({ ...o, id: o._id })) : []);
        } catch (e) {
            console.error("Failed to load organizers", e);
        }
    };

    const loadPlayers = async () => {
        try {
            const response = await fetch(`${API_URL}/players`, { headers: { 'Bypass-Tunnel-Reminder': 'true' } });
            const data = await response.json();
            setPlayers(Array.isArray(data) ? data.map(p => ({ ...p, id: p._id })) : []);
        } catch (e) {
            console.error("Failed to load players", e);
        }
    };

    const createTournament = async (tournamentData) => {
        try {
            const response = await fetch(`${API_URL}/tournaments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify(tournamentData)
            });
            const newTournament = await response.json();
            setTournaments(prev => [{ ...newTournament, id: newTournament._id }, ...prev]);
        } catch (e) {
            console.error(e);
        }
    };

    const joinTournament = async (tournamentId, player, additionalData = {}) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
                body: JSON.stringify({
                    userId: player.id || player._id,
                    name: player.name,
                    email: player.email,
                    mobile: player.mobile,
                    game: player.game,
                    strength: player.strength,
                    ...additionalData
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to join tournament');
            }

            const updatedTournament = data.tournament || data;
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...updatedTournament, id: updatedTournament._id } : t));
            return data; // Return full data including balance if present
        } catch (e) {
            console.error(e);
            throw e; // Rethrow to let UI handle it
        }
    };

    const leaveTournament = async (tournamentId, userId) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to leave tournament');
            }

            const updatedTournament = data.tournament;
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...updatedTournament, id: updatedTournament._id } : t));
            return data;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const deleteTournament = async (tournamentId) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setTournaments(prev => prev.filter(t => t.id !== tournamentId));
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const updateStatus = async (tournamentId, status) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updated = await response.json();
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...updated, id: updated._id } : t));
        } catch (e) {
            console.error(e);
        }
    };

    const updateTournament = async (tournamentId, data) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updated = await response.json();
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...updated, id: updated._id } : t));
        } catch (e) {
            console.error(e);
        }
    };

    const updateMatchScore = async (tournamentId, matchIndex, matchData) => {
        try {
            const response = await fetch(`${API_URL}/tournaments/${tournamentId}/matches/${matchIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(matchData)
            });
            const updated = await response.json();
            setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...updated, id: updated._id } : t));
        } catch (e) {
            console.error(e);
        }
    };

    const verifyUser = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/verify`, { method: 'PUT' });
            const updated = await response.json();
            setOrganizers(prev => prev.map(o => o.id === userId ? { ...updated, id: updated._id } : o));
            setPlayers(prev => prev.map(p => p.id === userId ? { ...updated, id: updated._id } : p));
        } catch (e) {
            console.error(e);
        }
    };

    const blockUser = async (userId, blockedStatus) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocked: blockedStatus })
            });
            const updated = await response.json();
            setOrganizers(prev => prev.map(o => o.id === userId ? { ...updated, id: updated._id } : o));
            setPlayers(prev => prev.map(p => p.id === userId ? { ...updated, id: updated._id } : p));
        } catch (e) {
            console.error(e);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const response = await fetch(`${API_URL}/leaderboard`);
            const data = await response.json();
            setLeaderboard(data);
        } catch (e) {
            console.error(e);
        }
    };

    const rateOrganizer = async (organizerId, userId, rating, review) => {
        try {
            await fetch(`${API_URL}/users/${organizerId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, rating, review })
            });
            await loadOrganizers();
        } catch (e) {
            console.error(e);
        }
    };

    const updateAccess = async (userId, durationDays) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/update-access`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationDays }) // Send null/empty to remove limit
            });
            const updated = await response.json();
            setOrganizers(prev => prev.map(o => o.id === userId ? { ...updated, id: updated._id } : o));
        } catch (e) {
            console.error(e);
        }
    };

    const payOrganizer = async (userId, amount) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/payout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });
            const updated = await response.json();
            setOrganizers(prev => prev.map(o => o.id === userId ? { ...updated, id: updated._id } : o));
            return updated;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    return (
        <TournamentContext.Provider value={{
            tournaments, organizers, players, leaderboard,
            loadTournaments, loadOrganizers, loadPlayers, loadLeaderboard,
            createTournament, joinTournament, leaveTournament,
            updateStatus, updateTournament, updateMatchScore, deleteTournament,
            verifyUser, blockUser, rateOrganizer, updateAccess, payOrganizer
        }}>
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournaments = () => useContext(TournamentContext);
