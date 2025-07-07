import { PaginatedResponse } from '../interfaces/api-response.interface';

export function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = '성공',
): PaginatedResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
