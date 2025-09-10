import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equipment } from "../entities/equipment.entity";
import { Repository, Like } from "typeorm";

@Injectable()
export class EquipmentReadService {
    constructor(
        @InjectRepository(Equipment)
        private readonly equipmentRepository: Repository<Equipment>,
    ) {}

    async getEquipmentByCode(equipmentCode: string): Promise<Equipment> {
        const equipment = await this.equipmentRepository.findOne({
            where: { equipmentCode },
        });

        if (!equipment) {
            throw new NotFoundException('장비를 찾을 수 없습니다.');
        }

        return equipment;
    }

    async getAllEquipment(page: number = 1, limit: number = 10): Promise<{ data: Equipment[]; total: number; page: number; limit: number }> {
        const offset = (page - 1) * limit;

        const [data, total] = await this.equipmentRepository.findAndCount({
            order: { equipmentCode: 'ASC' },
            skip: offset,
            take: limit,
        });

        return { data, total, page, limit };
    }

    async searchEquipment(keyword: string, page: number = 1, limit: number = 10): Promise<{ data: Equipment[]; total: number; page: number; limit: number }> {
        const offset = (page - 1) * limit;

        // 키워드가 비어있으면 전체 조회
        if (!keyword || keyword.trim() === '') {
            return this.getAllEquipment(page, limit);
        }

        const [data, total] = await this.equipmentRepository.findAndCount({
            where: [
                { equipmentCode: Like(`%${keyword}%`) },
                { equipmentName: Like(`%${keyword}%`) },
                { equipmentModel: Like(`%${keyword}%`) },
                { equipmentPurchasePlace: Like(`%${keyword}%`) },
                { equipmentHistory: Like(`%${keyword}%`) },
                { equipmentWorker: Like(`%${keyword}%`) },
            ],
            order: { equipmentCode: 'ASC' },
            skip: offset,
            take: limit,
        });

        return { data, total, page, limit };
    }
}