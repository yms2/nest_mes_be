import { BadRequestException, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShippingUploadService } from '../services/shipping-upload.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('출하관리 엑셀')
@Controller('shipping-info')
export class ShippingUploadController {
    constructor(
        private readonly shippingUploadService: ShippingUploadService
    ) {}

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '출하관리 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '출하관리 엑셀 파일',
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' }
            }
        }
    })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request & { user: { username: string } }
    ) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.'); 
        }

        if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
            throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        }

        const result = await this.shippingUploadService.uploadShipping(file, req.user.username);

        if (!result) {
            throw new BadRequestException('업로드 처리 중 오류가 발생했습니다.');
        }

        return {
            success: true,
            message: `출하관리 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
            data: {
                success: result.success,
                failed: result.failed,
                errors: result.errors,
                totalProcessed: result.success + result.failed
            }
        };
    }
}
