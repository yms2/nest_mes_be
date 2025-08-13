export interface UploadResponse {
    message: string;
    result: {
        successCount: number;
        failCount: number;
        totalCount: number;
        errors: Array<{
            row: number;
            customerNumber?: string;
            customerName?: string;
            error: string;
            details?: string;
        }>;
        summary: {
            created: number;
            updated: number;
            skipped: number;
        };
    }
}

export interface ValidationResponse {
    message: string;
    sessionId?: string;
    result: {
        totalCount: number;
        duplicateCount: number;
        newCount: number;
        errorCount: number;
        hasDuplicates: boolean;
        hasErrors: boolean;
        duplicates: Array<{
            row: number;
            customerNumber: string;
            customerName: string;
            existingCustomerName: string;
        }>;
        errors: Array<{
            row: number;
            customerNumber?: string;
            customerName?: string;
            error: string;
        }>;
        preview: {
            toCreate: Array<{
                customerNumber: string;
                customerName: string;
                customerCeo: string;
            }>;
            toUpdate: Array<{
                customerNumber: string;
                customerName: string;
                customerCeo: string;
                existingCustomerName: string;
            }>;
        }
    }
}