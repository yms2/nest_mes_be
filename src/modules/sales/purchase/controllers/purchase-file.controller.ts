import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PurchaseOrderService } from '../services/purchase-file.service';

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Get('export')
  async downloadExcel(@Res() res: Response) {
    try {
      const buffer = await this.poService.exportGroupedByCustomerToExcel();

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=grouped-orders.xlsx',
        'Content-Length': buffer.byteLength, // <-- 여기!
      });

      res.end(buffer); // res.send(buffer)도 가능하지만 end가 더 명확
    } catch (err) {
      res.status(500).send('Excel 다운로드 중 오류 발생');
    }
  }
}
