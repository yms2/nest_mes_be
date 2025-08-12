import { Injectable } from '@nestjs/common';
import { EmployeeExcelRow } from './employee-upload-validation.service';

interface UploadSession {
    validationId: string;
    rows: EmployeeExcelRow[];
    result: any;
    timestamp: number;
}

@Injectable()
export class EmployeeUploadSessionService {
    private sessions = new Map<string, UploadSession>();

    createSession(validationId: string, rows: EmployeeExcelRow[], result: any): void {
        this.sessions.set(validationId, {
            validationId,
            rows,
            result,
            timestamp: Date.now(),
        });
        // 1시간 후 세션 자동 삭제
        setTimeout(() => {
            this.sessions.delete(validationId);
        }, 60 * 60 * 1000); // 1시간
    }
    

    getSession(validationId: string): UploadSession | undefined {
        const session = this.sessions.get(validationId);
        if (session && Date.now() - session.timestamp < 60 * 60 * 1000) {
            return session;
        }
        return undefined;
    }

    deleteSession(validationId: string): void {
        this.sessions.delete(validationId);
    }
}