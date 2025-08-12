import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Employee } from '../../entities/employee.entity';

export interface EmployeeExcelRow {
    사원명: string;
    부서명: string;
    직급: string;
    성별: string;
    '내/외국인': string;
    생년월일: string;
    휴대폰: string;
    이메일: string;
    입사일: string;
    우편번호: string;
    주소: string;
    상세주소: string;
}

export interface ValidationResult {
    message: string;
    result: {
        totalCount: number;
        duplicateCount: number;
        newCount: number;
        errorCount: number;
        hasDuplicates: boolean;
        hasErrors: boolean;
        duplicates: Array<{
            row: number;
            employeeName: string;
            department: string;
            existingEmployeeName: string;
        }>;
        errors: Array<{
            row: number;
            employeeName?: string;
            department?: string;
            error: string;
        }>;
        preview: {
            toCreate: Array<{
                employeeName: string;
                department: string;
                position: string;
                gender: string;
                domesticForeign: string;
                birthday: string;
                employeePhone: string;
                employeeEmail: string;
                hireDate: string;
            }>;
            toUpdate: Array<{
                employeeName: string;
                department: string;
                position: string;
                gender: string;
                domesticForeign: string;
                birthday: string;
                employeePhone: string;
                employeeEmail: string;
                hireDate: string;
            }>;
        };
    };
}

@Injectable()
export class EmployeeUploadValidationService {
    parseExcelFile(fileBuffer: Buffer): EmployeeExcelRow[] {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json<EmployeeExcelRow>(sheet);
    }

    validateRows(rows: EmployeeExcelRow[], employeeNameMap: Map<string, Employee>): ValidationResult {
        const errors: Array<{
            row: number;
            employeeName?: string;
            department?: string;
            error: string;
        }> = [];

        const duplicates: Array<{
            row: number;
            employeeName: string;
            department: string;
            existingEmployeeName: string;
        }> = [];

        const toCreate: Array<{
            employeeName: string;
            department: string;
            position: string;
            gender: string;
            domesticForeign: string;
            birthday: string;
            employeePhone: string;
            employeeEmail: string;
            hireDate: string;
        }> = [];

        const toUpdate: Array<{
            employeeName: string;
            department: string;
            position: string;
            gender: string;
            domesticForeign: string;
            birthday: string;
            employeePhone: string;
            employeeEmail: string;
            hireDate: string;
        }> = [];

        let duplicateCount = 0;
        let newCount = 0;
        let errorCount = 0;
        let hasDuplicates = false;
        let hasErrors = false;

        for (let i = 0; i < rows.length; i++) {
            try {
                const employeeName = String(rows[i]['사원명'] ?? '').trim();
                const department = String(rows[i]['부서명'] ?? '').trim();
                const position = String(rows[i]['직급'] ?? '').trim();
                const gender = String(rows[i]['성별'] ?? '').trim();
                const domesticForeign = String(rows[i]['내/외국인'] ?? '').trim();
                const birthday = String(rows[i]['생년월일'] ?? '').trim();
                const employeePhone = String(rows[i]['휴대폰'] ?? '').trim();
                const employeeEmail = String(rows[i]['이메일'] ?? '').trim();
                const hireDate = String(rows[i]['입사일'] ?? '').trim();
                const postalCode = String(rows[i]['우편번호'] ?? '').trim();
                const address = String(rows[i]['주소'] ?? '').trim();
                const detailAddress = String(rows[i]['상세주소'] ?? '').trim();

                // 필수 필드 검증
                if (!employeeName) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '사원명은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!department) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '부서명은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!position) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '직급은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!gender) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '성별은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!domesticForeign) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '내/외국인은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!birthday) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '생년월일은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!employeePhone) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '휴대폰은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!employeeEmail) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '이메일은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!hireDate) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '입사일은 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!postalCode) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '우편번호는 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!address) {
                    errors.push({
                        row: i + 1,
                        employeeName,
                        department,
                        error: '주소는 필수 필드입니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }

                // 중복 체크
                const existingEmployee = employeeNameMap.get(employeeName);
                if (existingEmployee) {
                    duplicates.push({
                        row: i + 1,
                        employeeName,
                        department,
                        existingEmployeeName: existingEmployee.employeeName,
                    });
                    duplicateCount++;
                    hasDuplicates = true;
                    
                    // 업데이트 대상으로 추가
                    toUpdate.push({
                        employeeName,
                        department,
                        position,
                        gender,
                        domesticForeign,
                        birthday,
                        employeePhone,
                        employeeEmail,
                        hireDate,
                    });
                } else {
                    // 새로 생성할 대상으로 추가
                    toCreate.push({
                        employeeName,
                        department,
                        position,
                        gender,
                        domesticForeign,
                        birthday,
                        employeePhone,
                        employeeEmail,
                        hireDate,
                    });
                    newCount++;
                }

            } catch (error) {
                errorCount++;
                hasErrors = true;
                errors.push({
                    row: i + 1,
                    employeeName: rows[i]['사원명'] ?? '',
                    department: rows[i]['부서명'] ?? '',
                    error: error instanceof Error ? error.message : '오류가 발생했습니다.',
                });
            }
        }

        // 결과 메시지 생성
        let message = '';
        if (hasErrors && hasDuplicates) {
            message = `검증 완료: 총 ${rows.length}건 중 ${errorCount}건 오류, ${duplicateCount}건 중복, ${newCount}건 신규`;
        } else if (hasErrors) {
            message = `검증 완료: 총 ${rows.length}건 중 ${errorCount}건 오류, ${newCount}건 신규`;
        } else if (hasDuplicates) {
            message = `검증 완료: 총 ${rows.length}건 중 ${duplicateCount}건 중복, ${newCount}건 신규`;
        } else {
            message = `검증 완료: 총 ${rows.length}건 모두 정상`;
        }

        // ValidationResult 반환
        return {
            message,
            result: {
                totalCount: rows.length,
                duplicateCount,
                newCount,
                errorCount,
                hasDuplicates,
                hasErrors,
                duplicates,
                errors,
                preview: {
                    toCreate,
                    toUpdate,
                },
            },
        };
    }
}   