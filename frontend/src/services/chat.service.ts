import axiosInstance from '../config/axios';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Conversation {
    id: string;
    type: 'private' | 'group';
    name?: string;
    participants: User[];
    updatedAt: string;
    unreadCount?: number;
}

export const chatService = {
    getConversations: async () => {
        const response = await axiosInstance.get<Conversation[]>('/chat/conversations');
        return response.data;
    },

    searchUsers: async (query: string) => {
        const response = await axiosInstance.get<User[]>(`/chat/users/search?q=${query}`);
        return response.data;
    },

    startConversation: async (participantIds: string[]) => {
        const response = await axiosInstance.post<Conversation>('/chat/conversations', {
            type: 'private',
            participantIds
        });
        return response.data;
    },

    deleteConversation: async (conversationId: string) => {
        await axiosInstance.delete(`/chat/conversations/${conversationId}`);
    }
};
