import { Injectable } from '@nestjs/common';
import { ProductExcelRow } from './product-upload-validation.service';

interface UploadSession {
  validationId: string;
  rows: ProductExcelRow[];
  result: any;
  timestamp: number;
}

@Injectable()
export class ProductUploadSessionService {
  private sessions = new Map<string, UploadSession>();

  createSession(validationId: string, rows: ProductExcelRow[], result: any): void {
    this.sessions.set(validationId, {
      validationId,
      rows,
      result,
      timestamp: Date.now(),
    });

    // 1시간 후 세션 자동 삭제
    setTimeout(() => {
      this.sessions.delete(validationId);
    }, 60 * 60 * 1000);
  }

  getSession(validationId: string): UploadSession | undefined {
    const session = this.sessions.get(validationId);
    if (session && Date.now() - session.timestamp < 60 * 60 * 1000) {
      return session;
    }
    
    // 만료된 세션 삭제
    if (session) {
      this.sessions.delete(validationId);
    }
    
    return undefined;
  }

  deleteSession(validationId: string): void {
    this.sessions.delete(validationId);
  }
} 