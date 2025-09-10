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

export async function buildPaginatedSearch(
  serviceMethod: () => Promise<{ data: any[]; page: number; limit: number; total: number }>,
  successMessage: string,
) {
  const result = await serviceMethod();

  return {
    success: true,
    message: successMessage,
    data: result.data,
    page: result.page,
    limit: result.limit,
    total: result.total,
  };
}
