import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { DateFormatter } from '../../../../common/utils/date-formatter.util';

@Injectable()
export class BusinessInfoReadService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  /**
   * 사업자번호로 단일 조회
   */
  async getBusinessInfoByNumber(readBusinessInfoDto: ReadBusinessInfoDto): Promise<BusinessInfo> {
    const { businessNumber } = readBusinessInfoDto;

    const businessInfo = await this.businessInfoRepository.findOne({
      where: { businessNumber },
    });

    if (!businessInfo) {
      throw new NotFoundException('사업장 정보를 찾을 수 없습니다.');
    }

    return DateFormatter.formatBusinessInfoDates(businessInfo);
  }

  /**
   * 전체 목록 조회
   */
  
  async getAllBusinessInfo(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: BusinessInfo[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const queryBuilder = this.businessInfoRepository
      .createQueryBuilder('business')
      .where('business.isDeleted = false')
      .orderBy('business.businessName', 'ASC')
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: DateFormatter.formatBusinessInfoArrayDates(data),
      total,
      page,
      limit,
    };
  }
}
