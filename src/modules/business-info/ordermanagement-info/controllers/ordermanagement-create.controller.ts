import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderManagementCreateService } from '../services/ordermanagement-create.service';
import { CreateOrderManagementDto } from '../dto/ordermanagement-create.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { logService } from '../../../log/Services/log.service';

@ApiTags('주문관리')
@Controller('ordermanagement')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class OrderManagementCreateController {
  constructor(
    private readonly orderManagementService: OrderManagementCreateService,
    private readonly logService: logService,
  ) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: '주문관리 등록',
    description: '새로운 주문을 등록합니다. 주문 코드는 자동으로 생성됩니다.',
  })
  @ApiBody({
    type: CreateOrderManagementDto,
    description: '주문 등록 정보',
    examples: {
      '신규 주문': {
        value: {
          orderDate: '2025-01-27',
          customerCode: 'CUS001',
          customerName: '테스트 고객',
          projectCode: 'PRJ001',
          projectName: '테스트 프로젝트',
          productCode: 'PRD001',
          productName: '테스트 제품',
          orderType: '신규',
          quantity: 100,
          unitPrice: 100000,
          supplyPrice: 10000000,
          vat: 1000000,
          total: 11000000,
          deliveryDate: '2025-02-27',
          estimateCode: 'EST001',
          remark: '테스트 주문입니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '주문 등록 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '주문이 성공적으로 등록되었습니다.' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            orderCode: { type: 'string', example: 'ORD20250127001' },
            orderDate: { type: 'string', example: '2025-01-27' },
            customerCode: { type: 'string', example: 'CUS001' },
            customerName: { type: 'string', example: '테스트 고객' },
            projectCode: { type: 'string', example: 'PRJ001' },
            projectName: { type: 'string', example: '테스트 프로젝트' },
            productCode: { type: 'string', example: 'PRD001' },
            productName: { type: 'string', example: '테스트 제품' },
            orderType: { type: 'string', example: '신규' },
            quantity: { type: 'number', example: 100 },
            unitPrice: { type: 'string', example: '100000' },
            supplyPrice: { type: 'string', example: '10000000' },
            vat: { type: 'string', example: '1000000' },
            total: { type: 'string', example: '11000000' },
            deliveryDate: { type: 'string', example: '2025-02-27' },
            estimateCode: { type: 'string', example: 'EST001' },
            remark: { type: 'string', example: '테스트 주문입니다.' },
            createdAt: { type: 'string', example: '2025-01-27T10:00:00.000Z' },
            updatedAt: { type: 'string', example: '2025-01-27T10:00:00.000Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: '입력 데이터가 올바르지 않습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 오류',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: '주문 등록 중 오류가 발생했습니다.' },
      },
    },
  })
  async createOrderManagement(
    @Body() createOrderManagementDto: CreateOrderManagementDto,
    @Query('createdBy') createdBy: string,
  ) {
    try {
      if (!createdBy) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '생성자 정보가 필요합니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.orderManagementService.createOrderManagement(
        createOrderManagementDto,
        createdBy,
      );

      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '주문관리',
        action: 'CREATE',
        username: createdBy,
        details: `주문 코드: ${result.orderCode}`,
      });

      return {
        message: '주문이 성공적으로 등록되었습니다.',
        data: result,
      };
    } catch (error) {
      // 로그 생성
      await this.logService.createSimpleLog({
        moduleName: '주문관리',
        action: 'CREATE_FAIL',
        username: createdBy || 'unknown',
        details: `오류: ${error.message}`,
      });

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '주문 등록 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check-duplicate/:orderCode')
  @ApiOperation({
    summary: '주문 코드 중복 확인',
    description: '주문 코드의 중복 여부를 확인합니다.',
  })
  @ApiParam({
    name: 'orderCode',
    description: '확인할 주문 코드',
    example: 'ORD20250127001',
  })
  @ApiResponse({
    status: 200,
    description: '중복 확인 성공',
    schema: {
      type: 'object',
      properties: {
        orderCode: { type: 'string', example: 'ORD20250127001' },
        isDuplicate: { type: 'boolean', example: false },
        message: { type: 'string', example: '사용 가능한 주문 코드입니다.' },
      },
    },
  })
  async checkOrderCodeDuplicate(@Param('orderCode') orderCode: string) {
    try {
      const isDuplicate = await this.orderManagementService.checkOrderCodeDuplicate(orderCode);
      
      return {
        orderCode,
        isDuplicate,
        message: isDuplicate ? '이미 사용중인 주문 코드입니다.' : '사용 가능한 주문 코드입니다.',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '주문 코드 중복 확인 중 오류가 발생했습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
