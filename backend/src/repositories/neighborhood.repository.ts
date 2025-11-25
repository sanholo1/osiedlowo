import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Neighborhood } from '../entities/neighborhood.entity';

export class NeighborhoodRepository {
    private repository: Repository<Neighborhood>;

    constructor() {
        this.repository = AppDataSource.getRepository(Neighborhood);
    }

    async findAll(): Promise<Neighborhood[]> {
        return this.repository.find({
            relations: ['admin', 'members'],
            order: { createdAt: 'DESC' }
        });
    }

    async findById(id: string): Promise<Neighborhood | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['admin', 'members']
        });
    }

    async create(data: { name: string; city: string; adminId: string }): Promise<Neighborhood> {
        const result = await this.repository
            .createQueryBuilder()
            .insert()
            .into(Neighborhood)
            .values({
                name: data.name,
                city: data.city,
                adminId: data.adminId
            })
            .execute();

        const id = result.identifiers[0].id;
        return this.findById(id) as Promise<Neighborhood>;
    }

    async addMember(neighborhoodId: string, userId: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .relation(Neighborhood, 'members')
            .of(neighborhoodId)
            .add(userId);
    }

    async removeMember(neighborhoodId: string, userId: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .relation(Neighborhood, 'members')
            .of(neighborhoodId)
            .remove(userId);
    }

    async isMember(neighborhoodId: string, userId: string): Promise<boolean> {
        const neighborhood = await this.repository
            .createQueryBuilder('neighborhood')
            .innerJoin('neighborhood.members', 'member', 'member.id = :userId', { userId })
            .where('neighborhood.id = :neighborhoodId', { neighborhoodId })
            .getOne();

        return !!neighborhood;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
        return this.repository
            .createQueryBuilder('neighborhood')
            .innerJoin('neighborhood.members', 'member')
            .where('member.id = :userId', { userId })
            .leftJoinAndSelect('neighborhood.members', 'allMembers')
            .leftJoinAndSelect('neighborhood.admin', 'admin')
            .orderBy('neighborhood.createdAt', 'DESC')
            .getMany();
    }

    async search(query: string, excludeUserId?: string): Promise<Neighborhood[]> {
        const qb = this.repository.createQueryBuilder('neighborhood')
            .leftJoinAndSelect('neighborhood.members', 'members')
            .leftJoinAndSelect('neighborhood.admin', 'admin')
            .where('(LOWER(neighborhood.name) LIKE LOWER(:query) OR LOWER(neighborhood.city) LIKE LOWER(:query))', { query: `%${query}%` });

        if (excludeUserId) {
            // Exclude neighborhoods where the user is already a member
            qb.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('1')
                    .from('neighborhood_members', 'nm')
                    .where('nm.neighborhood_id = neighborhood.id')
                    .andWhere('nm.user_id = :excludeUserId')
                    .getQuery();
                return 'NOT EXISTS ' + subQuery;
            })
                .setParameter('excludeUserId', excludeUserId);
        }

        return qb.orderBy('neighborhood.createdAt', 'DESC').getMany();
    }
}
