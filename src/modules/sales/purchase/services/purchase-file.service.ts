import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../entities/purchase-file.entities';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
  ) {}

  async exportGroupedByCustomerToExcel(): Promise<Buffer | ArrayBuffer> {
    // ✅ 예시 데이터 하드코딩 (실제 DB 연결 전용)
    const sampleData = [
      { customerName: '삼성전자', productName: 'CPU', quantity: 10, unitPrice: 200 },
      { customerName: '삼성전자', productName: 'RAM', quantity: 20, unitPrice: 50 },
      { customerName: 'LG전자', productName: '모니터', quantity: 5, unitPrice: 300 },
      { customerName: 'LG전자', productName: '키보드', quantity: 15, unitPrice: 20 },
      { customerName: '한화시스템', productName: 'SSD', quantity: 8, unitPrice: 150 },
    ];

    const grouped = new Map<string, any[]>();
    for (const item of sampleData) {
      const group = grouped.get(item.customerName) || [];
      group.push(item);
      grouped.set(item.customerName, group);
    }

    const workbook = new ExcelJS.Workbook();
    for (const [customerName, items] of grouped.entries()) {
      const sheet = workbook.addWorksheet(customerName.slice(0, 31));
      sheet.columns = [
        { header: '제품명', key: 'productName', width: 20 },
        { header: '수량', key: 'quantity', width: 10 },
        { header: '단가', key: 'unitPrice', width: 15 },
        { header: '총액', key: 'totalPrice', width: 15 },
      ];
      for (const item of items) {
        sheet.addRow({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
