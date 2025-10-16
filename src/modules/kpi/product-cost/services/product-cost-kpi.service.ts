import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductCostKpiQueryDto, ProductCostKpiResponseDto, ProductCostKpiDetailResponseDto, ProductCostDetailDto, ProductCostSavingSummaryDto, ProductCostInputDto } from '../dto/product-cost-kpi.dto';

// 제품원가 정보를 저장할 임시 엔티티 (실제로는 별도 테이블이 필요할 수 있음)
// 현재는 메모리에서 관리하는 예시로 구현
export interface ProductCostData {
    id: number;
    productCode: string;
    productName: string;
    specification: string;
    monthlyWorkQuantity: number;
    rawMaterialCost: number;
    outsourcingCost: number;
    inhouseCost: number;
    effectiveStartDate: Date;
    effectiveEndDate?: Date;
    isActive: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class ProductCostKpiService {
    // 실제로는 데이터베이스 테이블을 사용해야 함
    private productCostData: ProductCostData[] = [
        {
            id: 1,
            productCode: 'PRD001',
            productName: '밴딩기 제어모듈',
            specification: '1kHz',
            monthlyWorkQuantity: 100,
            rawMaterialCost: 23000,
            outsourcingCost: 10000,
            inhouseCost: 5000,
            effectiveStartDate: new Date('2025-01-01'),
            effectiveEndDate: new Date('2025-12-31'),
            isActive: 'Y',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    constructor() {}

    /**
     * 제품원가 KPI 조회
     */
    async getProductCostKpi(queryDto: ProductCostKpiQueryDto): Promise<ProductCostKpiResponseDto[]> {
        const { yearMonth, startDate, endDate, productCode, productName, workType } = queryDto;

        // 필터링된 데이터 조회
        let filteredData = this.productCostData.filter(data => data.isActive === 'Y');

        // 날짜 필터링
        if (yearMonth) {
            const [year, month] = yearMonth.split('-').map(Number);
            const targetDate = new Date(year, month - 1, 1);
            filteredData = filteredData.filter(data => 
                data.effectiveStartDate <= targetDate && 
                (!data.effectiveEndDate || data.effectiveEndDate >= targetDate)
            );
        } else if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filteredData = filteredData.filter(data => 
                data.effectiveStartDate <= end && 
                (!data.effectiveEndDate || data.effectiveEndDate >= start)
            );
        }

        // 추가 필터링
        if (productCode) {
            filteredData = filteredData.filter(data => data.productCode.includes(productCode));
        }
        if (productName) {
            filteredData = filteredData.filter(data => data.productName.includes(productName));
        }

        // KPI 데이터 변환
        const kpiResults: ProductCostKpiResponseDto[] = filteredData.map(data => {
            const beforeTotalCost = (data.rawMaterialCost + data.outsourcingCost) * data.monthlyWorkQuantity;
            const afterTotalCost = (data.rawMaterialCost + data.inhouseCost) * data.monthlyWorkQuantity;
            const monthlySavingAmount = beforeTotalCost - afterTotalCost;
            const savingRate = beforeTotalCost > 0 ? (monthlySavingAmount / beforeTotalCost) * 100 : 0;
            const annualSavingAmount = monthlySavingAmount * 12;

            return {
                yearMonth: yearMonth || new Date().toISOString().slice(0, 7),
                productCode: data.productCode,
                productName: data.productName,
                monthlyWorkQuantity: data.monthlyWorkQuantity,
                rawMaterialCost: data.rawMaterialCost,
                outsourcingCost: data.outsourcingCost,
                inhouseCost: data.inhouseCost,
                beforeImplementationTotalCost: beforeTotalCost,
                afterImplementationTotalCost: afterTotalCost,
                monthlySavingAmount: monthlySavingAmount,
                savingRate: Math.round(savingRate * 100) / 100,
                annualSavingAmount: annualSavingAmount,
                currentWorkType: workType || 'outsourcing',
                dataDate: data.effectiveStartDate
            };
        });

        return kpiResults;
    }

    /**
     * 제품원가 KPI 상세 조회
     */
    async getProductCostKpiDetail(queryDto: ProductCostKpiQueryDto): Promise<ProductCostKpiDetailResponseDto[]> {
        const kpiResults = await this.getProductCostKpi(queryDto);
        const detailResults: ProductCostKpiDetailResponseDto[] = [];

        for (const kpi of kpiResults) {
            // 해당 품목의 상세 정보 조회
            const productDetails = this.productCostData.filter(data => 
                data.productCode === kpi.productCode && data.isActive === 'Y'
            );

            const productDetailDtos: ProductCostDetailDto[] = productDetails.map(data => ({
                productCode: data.productCode,
                productName: data.productName,
                specification: data.specification,
                monthlyWorkQuantity: data.monthlyWorkQuantity,
                rawMaterialCost: data.rawMaterialCost,
                outsourcingCost: data.outsourcingCost,
                inhouseCost: data.inhouseCost,
                effectiveStartDate: data.effectiveStartDate,
                effectiveEndDate: data.effectiveEndDate,
                isActive: data.isActive
            }));

            detailResults.push({
                ...kpi,
                productCostDetails: productDetailDtos
            });
        }

        return detailResults;
    }

    /**
     * 제품원가 절감 효과 요약 조회
     */
    async getProductCostSavingSummary(queryDto: ProductCostKpiQueryDto): Promise<ProductCostSavingSummaryDto> {
        const kpiResults = await this.getProductCostKpi(queryDto);

        const totalMonthlySaving = kpiResults.reduce((sum, kpi) => sum + kpi.monthlySavingAmount, 0);
        const totalAnnualSaving = kpiResults.reduce((sum, kpi) => sum + kpi.annualSavingAmount, 0);
        const averageSavingRate = kpiResults.length > 0 
            ? kpiResults.reduce((sum, kpi) => sum + kpi.savingRate, 0) / kpiResults.length 
            : 0;
        const targetProductCount = kpiResults.length;
        const totalMonthlyWorkQuantity = kpiResults.reduce((sum, kpi) => sum + kpi.monthlyWorkQuantity, 0);

        // 절감 효과 TOP 5
        const topSavingProducts = kpiResults
            .sort((a, b) => b.monthlySavingAmount - a.monthlySavingAmount)
            .slice(0, 5);

        return {
            totalMonthlySaving,
            totalAnnualSaving,
            averageSavingRate: Math.round(averageSavingRate * 100) / 100,
            targetProductCount,
            totalMonthlyWorkQuantity,
            topSavingProducts
        };
    }

    /**
     * 제품원가 정보 입력
     */
    async createProductCost(inputDto: ProductCostInputDto): Promise<ProductCostData> {
        const newData: ProductCostData = {
            id: this.productCostData.length + 1,
            productCode: inputDto.productCode,
            productName: inputDto.productName,
            specification: inputDto.specification,
            monthlyWorkQuantity: inputDto.monthlyWorkQuantity,
            rawMaterialCost: inputDto.rawMaterialCost,
            outsourcingCost: inputDto.outsourcingCost,
            inhouseCost: inputDto.inhouseCost,
            effectiveStartDate: new Date(inputDto.effectiveStartDate),
            effectiveEndDate: inputDto.effectiveEndDate ? new Date(inputDto.effectiveEndDate) : undefined,
            isActive: inputDto.isActive,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.productCostData.push(newData);
        return newData;
    }

    /**
     * 제품원가 정보 수정
     */
    async updateProductCost(id: number, inputDto: ProductCostInputDto): Promise<ProductCostData> {
        const index = this.productCostData.findIndex(data => data.id === id);
        if (index === -1) {
            throw new Error('제품원가 정보를 찾을 수 없습니다.');
        }

        const updatedData: ProductCostData = {
            ...this.productCostData[index],
            productCode: inputDto.productCode,
            productName: inputDto.productName,
            specification: inputDto.specification,
            monthlyWorkQuantity: inputDto.monthlyWorkQuantity,
            rawMaterialCost: inputDto.rawMaterialCost,
            outsourcingCost: inputDto.outsourcingCost,
            inhouseCost: inputDto.inhouseCost,
            effectiveStartDate: new Date(inputDto.effectiveStartDate),
            effectiveEndDate: inputDto.effectiveEndDate ? new Date(inputDto.effectiveEndDate) : undefined,
            isActive: inputDto.isActive,
            updatedAt: new Date()
        };

        this.productCostData[index] = updatedData;
        return updatedData;
    }

    /**
     * 제품원가 정보 삭제
     */
    async deleteProductCost(id: number): Promise<boolean> {
        const index = this.productCostData.findIndex(data => data.id === id);
        if (index === -1) {
            return false;
        }

        this.productCostData.splice(index, 1);
        return true;
    }

    /**
     * 제품원가 정보 조회
     */
    async getProductCostList(queryDto: ProductCostKpiQueryDto): Promise<ProductCostDetailDto[]> {
        const { productCode, productName } = queryDto;

        let filteredData = this.productCostData.filter(data => data.isActive === 'Y');

        if (productCode) {
            filteredData = filteredData.filter(data => data.productCode.includes(productCode));
        }
        if (productName) {
            filteredData = filteredData.filter(data => data.productName.includes(productName));
        }

        return filteredData.map(data => ({
            productCode: data.productCode,
            productName: data.productName,
            specification: data.specification,
            monthlyWorkQuantity: data.monthlyWorkQuantity,
            rawMaterialCost: data.rawMaterialCost,
            outsourcingCost: data.outsourcingCost,
            inhouseCost: data.inhouseCost,
            effectiveStartDate: data.effectiveStartDate,
            effectiveEndDate: data.effectiveEndDate,
            isActive: data.isActive
        }));
    }
}
