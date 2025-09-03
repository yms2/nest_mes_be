import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class OrderManagementReadService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

//모든 주문 목록 조회}

}
