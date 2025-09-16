import { Repository } from 'typeorm';
import { ProductionPlan } from '../entities/production-plan.entity';

/**
 * 생산 계획 코드 생성 유틸리티
 */
export class ProductionPlanCodeGenerator {
  /**
   * 생산 계획 코드를 자동으로 생성합니다.
   * 형식: PP + YYMMDD + 001 (일일 시퀀스)
   * 예시: PP250115001, PP250115002, ...
   * 
   * @param productionPlanRepository 생산 계획 레포지토리
   * @returns 생성된 생산 계획 코드
   */
  static async generateProductionPlanCode(
    productionPlanRepository: Repository<ProductionPlan>,
  ): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const prefix = `PP${year}${month}${day}`;

    // 같은 날짜의 마지막 생산 계획 코드 조회
    const lastPlan = await productionPlanRepository
      .createQueryBuilder('plan')
      .where('plan.productionPlanCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('plan.productionPlanCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastPlan) {
      const lastSequence = parseInt(lastPlan.productionPlanCode.slice(-3));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * 생산 계획 코드의 유효성을 검증합니다.
   * 
   * @param code 검증할 생산 계획 코드
   * @returns 유효성 검증 결과
   */
  static validateProductionPlanCode(code: string): boolean {
    const pattern = /^PP\d{6}\d{3}$/;
    return pattern.test(code);
  }

  /**
   * 생산 계획 코드에서 날짜를 추출합니다.
   * 
   * @param code 생산 계획 코드
   * @returns 날짜 문자열 (YYMMDD)
   */
  static extractDateFromCode(code: string): string | null {
    const match = code.match(/^PP(\d{6})\d{3}$/);
    return match ? match[1] : null;
  }

  /**
   * 생산 계획 코드에서 시퀀스를 추출합니다.
   * 
   * @param code 생산 계획 코드
   * @returns 시퀀스 번호
   */
  static extractSequenceFromCode(code: string): number | null {
    const match = code.match(/^PP\d{6}(\d{3})$/);
    return match ? parseInt(match[1]) : null;
  }
}
