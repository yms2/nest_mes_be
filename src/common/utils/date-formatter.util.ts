export class DateFormatter {
  /**
   * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
   */
  static formatDate(date: Date | null | undefined): string | null {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * BusinessInfo 객체의 날짜 필드들을 포맷
   */
  static formatBusinessInfoDates<
    T extends { createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null },
  >(data: T): T & { createdAt?: string; updatedAt?: string; deletedAt?: string | null } {
    return {
      ...data,
      createdAt: this.formatDate(data.createdAt),
      updatedAt: this.formatDate(data.updatedAt),
      deletedAt: this.formatDate(data.deletedAt),
    };
  }

  /**
   * BusinessInfo 배열의 날짜 필드들을 포맷
   */
  static formatBusinessInfoArrayDates<
    T extends { createdAt?: Date; updatedAt?: Date; deletedAt?: Date | null },
  >(dataArray: T[]): (T & { createdAt?: string; updatedAt?: string; deletedAt?: string | null })[] {
    return dataArray.map(data => this.formatBusinessInfoDates(data));
  }
}
