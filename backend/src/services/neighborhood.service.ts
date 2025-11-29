import { NeighborhoodRepository } from '../repositories/neighborhood.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { Neighborhood } from '../entities/neighborhood.entity';
import { ConversationType } from '../entities/conversation.entity';
import * as bcrypt from 'bcrypt';

export class NeighborhoodService {
    private neighborhoodRepository: NeighborhoodRepository;
    private conversationRepository: ConversationRepository;

    constructor() {
        this.neighborhoodRepository = new NeighborhoodRepository();
        this.conversationRepository = new ConversationRepository();
    }

    async getAllNeighborhoods(): Promise<Neighborhood[]> {
        return this.neighborhoodRepository.findAll();
    }

    async getUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
        return this.neighborhoodRepository.findUserNeighborhoods(userId);
    }

    async searchNeighborhoods(query: string, userId: string): Promise<Neighborhood[]> {
        return this.neighborhoodRepository.search(query, userId);
    }

    async getPublicNeighborhoods(userId?: string): Promise<Neighborhood[]> {
        return this.neighborhoodRepository.findPublic(userId);
    }

    async getNeighborhoodById(id: string): Promise<Neighborhood | null> {
        return this.neighborhoodRepository.findById(id);
    }

    async createNeighborhood(data: {
        name: string;
        city: string;
        adminId: string;
        isPrivate?: boolean;
        password?: string;
    }): Promise<Neighborhood> {
        const existingNeighborhood = await this.neighborhoodRepository.findByName(data.name);
        if (existingNeighborhood) {
            throw new Error('Osiedle o tej nazwie już istnieje');
        }

        let hashedPassword: string | undefined;
        let inviteCode: string | undefined;

        if (data.isPrivate) {
            if (data.password) {
                hashedPassword = await bcrypt.hash(data.password, 10);
            }
            inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        const neighborhood = await this.neighborhoodRepository.create({
            name: data.name,
            city: data.city,
            adminId: data.adminId,
            isPrivate: data.isPrivate || false,
            password: hashedPassword,
            inviteCode: inviteCode
        });

        await this.neighborhoodRepository.addMember(neighborhood.id, data.adminId);

        await this.conversationRepository.create({
            type: ConversationType.GROUP,
            name: neighborhood.name,
            neighborhoodId: neighborhood.id,
            participantIds: [data.adminId]
        });

        return this.neighborhoodRepository.findById(neighborhood.id) as Promise<Neighborhood>;
    }

    async joinNeighborhood(neighborhoodId: string, userId: string, password?: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Sąsiedztwo nie istnieje');
        }

        if (neighborhood.isPrivate) {
            if (!password) {
                throw new Error('To osiedle jest prywatne. Wymagane jest hasło.');
            }

            const isPasswordValid = await bcrypt.compare(password, neighborhood.password);
            if (!isPasswordValid) {
                throw new Error('Nieprawidłowe hasło');
            }
        }

        await this.addMemberToNeighborhood(neighborhoodId, userId);
    }

    async joinByInviteCode(inviteCode: string, userId: string, password?: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findByInviteCode(inviteCode);
        if (!neighborhood) {
            throw new Error('Nieprawidłowy kod zaproszenia');
        }

        if (neighborhood.isPrivate && neighborhood.password) {
            if (!password) {
                throw new Error('Wymagane hasło');
            }

            const isPasswordValid = await bcrypt.compare(password, neighborhood.password);
            if (!isPasswordValid) {
                throw new Error('Nieprawidłowe hasło');
            }
        }

        await this.addMemberToNeighborhood(neighborhood.id, userId);
    }

    private async addMemberToNeighborhood(neighborhoodId: string, userId: string): Promise<void> {
        const isMember = await this.neighborhoodRepository.isMember(neighborhoodId, userId);
        if (isMember) {
            throw new Error('Już jesteś członkiem tego sąsiedztwa');
        }

        await this.neighborhoodRepository.addMember(neighborhoodId, userId);

        const conversation = await this.conversationRepository.findByNeighborhoodId(neighborhoodId);
        if (conversation) {
            await this.conversationRepository.addParticipant(conversation.id, userId);
        }
    }

    async leaveNeighborhood(neighborhoodId: string, userId: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Sąsiedztwo nie istnieje');
        }

        if (neighborhood.adminId === userId) {
            throw new Error('Administrator nie może opuścić sąsiedztwa');
        }

        const isMember = await this.neighborhoodRepository.isMember(neighborhoodId, userId);
        if (!isMember) {
            throw new Error('Nie jesteś członkiem tego sąsiedztwa');
        }

        await this.neighborhoodRepository.removeMember(neighborhoodId, userId);

        const conversation = await this.conversationRepository.findByNeighborhoodId(neighborhoodId);
        if (conversation) {
            await this.conversationRepository.removeParticipant(conversation.id, userId);
        }
    }

    async updatePassword(neighborhoodId: string, userId: string, newPassword: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Sąsiedztwo nie istnieje');
        }

        if (neighborhood.adminId !== userId) {
            throw new Error('Tylko administrator może zmienić hasło');
        }

        if (!neighborhood.isPrivate) {
            throw new Error('Można zmienić hasło tylko dla prywatnego osiedla');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.neighborhoodRepository.update(neighborhoodId, { password: hashedPassword });
    }

    async deleteNeighborhood(neighborhoodId: string, userId: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Sąsiedztwo nie istnieje');
        }

        if (neighborhood.adminId !== userId) {
            throw new Error('Tylko administrator może usunąć sąsiedztwo');
        }

        const conversation = await this.conversationRepository.findByNeighborhoodId(neighborhoodId);
        if (conversation) {
            await this.conversationRepository.delete(conversation.id);
        }

        await this.neighborhoodRepository.delete(neighborhoodId);
    }
}
