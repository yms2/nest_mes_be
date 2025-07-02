import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SampleService } from './sample.service';
import { Sample } from './sample.entity';
import { QuerySampleDto } from './sample.dto';

@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  samples(
    @Query() QuerySampleDto: QuerySampleDto,
  ): Promise<{ samples: Sample[]; totalCount: number }> {
    return this.sampleService.samples(QuerySampleDto);
  }

  @Get(':id')
  getSample(@Param('id') id: string): Promise<Sample> {
    return this.sampleService.sample(id);
  }

  @Post()
  createSample(@Body() sample: Sample): Promise<Sample> {
    return this.sampleService.createSample(sample);
  }

  @Delete(':id')
  deleteSample(@Param('id') id: string): Promise<void> {
    return this.sampleService.deleteSample(id);
  }

  @Patch(':id/counsel')
  counselSample(
    @Param('id') id: string,
    @Body('isCounseled') isCounseled: boolean,
  ): Promise<Sample> {
    return this.sampleService.counselSample(id, isCounseled);
  }
}
