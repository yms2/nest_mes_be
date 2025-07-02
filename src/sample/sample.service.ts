import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sample } from './sample.entity';
import { Like, Repository } from 'typeorm';
import { QuerySampleDto } from './sample.dto';

@Injectable()
export class SampleService {
  constructor(
    @InjectRepository(Sample)
    private sampleRepository: Repository<Sample>,
  ) {}

  async samples(
    QuerySampleDto: QuerySampleDto,
  ): Promise<{ samples: Sample[]; totalCount: number; page: number; limit: number }> {
    const { page, limit, search, isCounseled, category } = QuerySampleDto;

    const whereCondition = [
      {
        isCounseled: isCounseled,
        category: category,
        companyName: Like(`%${search}%`),
      },
      {
        isCounseled: isCounseled,
        category: category,
        writerName: Like(`%${search}%`),
      },
      {
        isCounseled: isCounseled,
        category: category,
        phone: Like(`%${search}%`),
      },
      {
        isCounseled: isCounseled,
        category: category,
        email: Like(`%${search}%`),
      },
      {
        isCounseled: isCounseled,
        category: category,
        title: Like(`%${search}%`),
      },
    ];

    const [samples, total] = await this.sampleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
      where: whereCondition,
    });

    return {
      samples,
      totalCount: total,
      page,
      limit,
    };
  }

  async sample(id: string): Promise<Sample> {
    const sample = await this.sampleRepository.findOneBy({ id: parseInt(id) });
    if (!sample) {
      throw new NotFoundException('Sample not found');
    }
    return sample;
  }

  async createSample(sample: Sample): Promise<Sample> {
    return this.sampleRepository.save(sample);
  }

  async deleteSample(id: string): Promise<void> {
    await this.sampleRepository.delete(parseInt(id));
  }

  async counselSample(id: string, isCounseled: boolean): Promise<Sample> {
    const sample = await this.sampleRepository.findOneBy({ id: parseInt(id) });
    if (!sample) {
      throw new NotFoundException('Sample not found');
    }
    await this.sampleRepository.update(parseInt(id), { isCounseled: isCounseled });
    return sample;
  }
}
