import { NeighborhoodRepository } from '../repositories/neighborhood.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { Neighborhood } from '../entities/neighborhood.entity';
import { ConversationType } from '../entities/conversation.entity';

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

    async getNeighborhoodById(id: string): Promise<Neighborhood | null> {
        return this.neighborhoodRepository.findById(id);
    }

    async createNeighborhood(data: { name: string; city: string; adminId: string }): Promise<Neighborhood> {
        // Utwórz sąsiedztwo
        const neighborhood = await this.neighborhoodRepository.create(data);

        // Dodaj admina jako członka
        await this.neighborhoodRepository.addMember(neighborhood.id, data.adminId);

        // Utwórz grupową konwersację dla sąsiedztwa
        await this.conversationRepository.create({
            type: ConversationType.GROUP,
            name: neighborhood.name,
            neighborhoodId: neighborhood.id,
            participantIds: [data.adminId]
        });

        return this.neighborhoodRepository.findById(neighborhood.id) as Promise<Neighborhood>;
    }

    async joinNeighborhood(neighborhoodId: string, userId: string): Promise<void> {
        const isMember = await this.neighborhoodRepository.isMember(neighborhoodId, userId);
        if (isMember) {
            throw new Error('Już jesteś członkiem tego sąsiedztwa');
        }

        // Dodaj użytkownika do sąsiedztwa
        await this.neighborhoodRepository.addMember(neighborhoodId, userId);

        // Znajdź konwersację grupową sąsiedztwa i dodaj użytkownika
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

        // Usuń użytkownika z sąsiedztwa
        await this.neighborhoodRepository.removeMember(neighborhoodId, userId);

        // Usuń użytkownika z konwersacji grupowej
        const conversation = await this.conversationRepository.findByNeighborhoodId(neighborhoodId);
        if (conversation) {
            await this.conversationRepository.removeParticipant(conversation.id, userId);
        }
    }

    async deleteNeighborhood(neighborhoodId: string, userId: string): Promise<void> {
        const neighborhood = await this.neighborhoodRepository.findById(neighborhoodId);
        if (!neighborhood) {
            throw new Error('Sąsiedztwo nie istnieje');
        }

        if (neighborhood.adminId !== userId) {
            throw new Error('Tylko administrator może usunąć sąsiedztwo');
        }

        // Znajdź i usuń konwersację grupową
        const conversation = await this.conversationRepository.findByNeighborhoodId(neighborhoodId);
        if (conversation) {
            await this.conversationRepository.delete(conversation.id);
        }

        // Usuń sąsiedztwo
        await this.neighborhoodRepository.delete(neighborhoodId);
    }
}
