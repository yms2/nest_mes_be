import { Controller, Get, Query, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { APMService } from '../services/apm.service';
import { ApiResponseBuilder } from '../../interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { Response } from 'express';

@ApiTags('APM 모니터링')
@Controller('apm')
@DevAuth()
export class APMController {
  constructor(private readonly apmService: APMService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'APM 통계 조회', 
    description: '전체 성능 통계를 조회합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'APM 통계 조회 성공',
    schema: {
      example: {
        success: true,
        message: 'APM 통계를 성공적으로 조회했습니다.',
        data: {
          totalRequests: 1250,
          successRequests: 1200,
          errorRequests: 50,
          averageResponseTime: 245,
          slowestOperation: 'POST /api/estimate-management/with-details',
          errorRate: 4.0,
          lastUpdated: '2025-01-11T03:00:00.000Z'
        },
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getStats() {
    try {
      const stats = this.apmService.getStats();
      return ApiResponseBuilder.success(stats, 'APM 통계를 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        'APM 통계 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('performance')
  @ApiOperation({ 
    summary: '성능 메트릭 조회', 
    description: '성능 메트릭 목록을 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: '조회할 메트릭 수 (기본값: 100)',
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: '성능 메트릭 조회 성공',
    schema: {
      example: {
        success: true,
        message: '성능 메트릭을 성공적으로 조회했습니다.',
        data: [
          {
            operation: 'POST /api/estimate-management/with-details',
            duration: 1250,
            startTime: '2025-01-11T02:58:30.000Z',
            endTime: '2025-01-11T02:58:31.250Z',
            success: true,
            metadata: {
              method: 'POST',
              path: '/api/estimate-management/with-details',
              statusCode: 201
            }
          }
        ],
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getPerformanceMetrics(@Query('limit') limit?: number) {
    try {
      const metrics = this.apmService.getPerformanceMetrics(limit);
      return ApiResponseBuilder.success(metrics, '성능 메트릭을 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        '성능 메트릭 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('errors')
  @ApiOperation({ 
    summary: '에러 메트릭 조회', 
    description: '에러 메트릭 목록을 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: '조회할 에러 수 (기본값: 100)',
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: '에러 메트릭 조회 성공',
    schema: {
      example: {
        success: true,
        message: '에러 메트릭을 성공적으로 조회했습니다.',
        data: [
          {
            error: 'Validation failed (numeric string is expected)',
            stack: 'Error: Validation failed...',
            timestamp: '2025-01-11T02:58:30.000Z',
            operation: 'POST /api/estimate-management/with-details',
            metadata: {
              className: 'EstimateManagementCreateController',
              methodName: 'createEstimateWithDetails'
            }
          }
        ],
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getErrorMetrics(@Query('limit') limit?: number) {
    try {
      const errors = this.apmService.getErrorMetrics(limit);
      return ApiResponseBuilder.success(errors, '에러 메트릭을 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        '에러 메트릭 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('database')
  @ApiOperation({ 
    summary: '데이터베이스 메트릭 조회', 
    description: '데이터베이스 쿼리 메트릭을 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: '조회할 쿼리 수 (기본값: 100)',
    example: 50
  })
  @ApiResponse({ 
    status: 200, 
    description: '데이터베이스 메트릭 조회 성공',
    schema: {
      example: {
        success: true,
        message: '데이터베이스 메트릭을 성공적으로 조회했습니다.',
        data: [
          {
            query: 'SELECT * FROM estimate_management WHERE customer_code = ?',
            duration: 150,
            timestamp: '2025-01-11T02:58:30.000Z',
            success: true,
            table: 'estimate_management'
          }
        ],
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getDatabaseMetrics(@Query('limit') limit?: number) {
    try {
      const metrics = this.apmService.getDatabaseMetrics(limit);
      return ApiResponseBuilder.success(metrics, '데이터베이스 메트릭을 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        '데이터베이스 메트릭 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('slow-queries')
  @ApiOperation({ 
    summary: '느린 쿼리 조회', 
    description: '느린 데이터베이스 쿼리를 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    type: Number, 
    description: '느린 쿼리 기준 (밀리초, 기본값: 1000)',
    example: 500
  })
  @ApiResponse({ 
    status: 200, 
    description: '느린 쿼리 조회 성공',
    schema: {
      example: {
        success: true,
        message: '느린 쿼리를 성공적으로 조회했습니다.',
        data: [
          {
            query: 'SELECT * FROM estimate_management e LEFT JOIN estimate_detail d ON e.id = d.estimate_id',
            duration: 2500,
            timestamp: '2025-01-11T02:58:30.000Z',
            success: true,
            table: 'estimate_management'
          }
        ],
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getSlowQueries(@Query('threshold') threshold?: number) {
    try {
      const slowQueries = this.apmService.getSlowQueries(threshold);
      return ApiResponseBuilder.success(slowQueries, '느린 쿼리를 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        '느린 쿼리 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('slow-operations')
  @ApiOperation({ 
    summary: '느린 작업 조회', 
    description: '느린 작업을 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    type: Number, 
    description: '느린 작업 기준 (밀리초, 기본값: 2000)',
    example: 1000
  })
  @ApiResponse({ 
    status: 200, 
    description: '느린 작업 조회 성공',
    schema: {
      example: {
        success: true,
        message: '느린 작업을 성공적으로 조회했습니다.',
        data: [
          {
            operation: 'POST /api/estimate-management/excel/upload',
            duration: 5000,
            startTime: '2025-01-11T02:58:30.000Z',
            endTime: '2025-01-11T02:58:35.000Z',
            success: true,
            metadata: {
              method: 'POST',
              path: '/api/estimate-management/excel/upload',
              statusCode: 200
            }
          }
        ],
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async getSlowOperations(@Query('threshold') threshold?: number) {
    try {
      const slowOperations = this.apmService.getSlowOperations(threshold);
      return ApiResponseBuilder.success(slowOperations, '느린 작업을 성공적으로 조회했습니다.');
    } catch (error) {
      throw new HttpException(
        '느린 작업 조회에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  @Get('clear')
  @ApiOperation({ 
    summary: '메트릭 초기화', 
    description: '모든 APM 메트릭을 초기화합니다.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: '메트릭 초기화 성공',
    schema: {
      example: {
        success: true,
        message: '모든 APM 메트릭이 초기화되었습니다.',
        data: null,
        timestamp: '2025-01-11T03:00:00.000Z'
      }
    }
  })
  async clearMetrics() {
    try {
      this.apmService.clearMetrics();
      return ApiResponseBuilder.success(null, '모든 APM 메트릭이 초기화되었습니다.');
    } catch (error) {
      throw new HttpException(
        '메트릭 초기화에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


  @Get('dashboard')
  @ApiOperation({ 
    summary: 'APM 대시보드', 
    description: 'APM 모니터링 대시보드 HTML 페이지를 제공합니다.' 
  })
  async getDashboard(@Res() res: Response) {
    try {
      const stats = this.apmService.getStats();
      const performance = this.apmService.getPerformanceMetrics();
      const errors = this.apmService.getErrorMetrics();
      const slowQueries = this.apmService.getSlowQueries();

      const html = this.generateDashboardHTML(stats, performance, errors, slowQueries);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      res.status(500).send(`
        <html>
          <head><title>APM Dashboard Error</title></head>
          <body>
            <h1>APM 대시보드 오류</h1>
            <p>대시보드를 불러오는 중 오류가 발생했습니다.</p>
            <p>오류: ${error.message}</p>
          </body>
        </html>
      `);
    }
  }

  private generateDashboardHTML(stats: any, performance: any[], errors: any[], slowQueries: any[]): string {
    const now = new Date().toLocaleString('ko-KR');
    
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APM 모니터링 대시보드</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .header .subtitle {
            text-align: center;
            color: #7f8c8d;
            font-size: 1.2em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #2c3e50;
            font-size: 1.1em;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-value.success { color: #27ae60; }
        .stat-value.error { color: #e74c3c; }
        .stat-value.warning { color: #f39c12; }
        .stat-value.info { color: #3498db; }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        
        .section {
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .table th,
        .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .table tr:hover {
            background: #f8f9fa;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .badge.success { background: #d4edda; color: #155724; }
        .badge.error { background: #f8d7da; color: #721c24; }
        .badge.warning { background: #fff3cd; color: #856404; }
        .badge.info { background: #d1ecf1; color: #0c5460; }
        
        .refresh-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            margin: 20px 0;
            transition: background 0.3s ease;
        }
        
        .refresh-btn:hover {
            background: #2980b9;
        }
        
        .no-data {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 40px;
        }
        
        .footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 30px;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stat-value {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 APM 모니터링 대시보드</h1>
            <div class="subtitle">실시간 성능 모니터링 및 분석</div>
            <div style="text-align: center; margin-top: 15px;">
                <button class="refresh-btn" onclick="location.reload()">🔄 새로고침</button>
                <span style="margin-left: 20px; color: #7f8c8d;">마지막 업데이트: ${now}</span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>총 요청 수</h3>
                <div class="stat-value info">${stats.totalRequests || 0}</div>
                <div class="stat-label">Total Requests</div>
            </div>
            
            <div class="stat-card">
                <h3>성공 요청</h3>
                <div class="stat-value success">${stats.successRequests || 0}</div>
                <div class="stat-label">Success Requests</div>
            </div>
            
            <div class="stat-card">
                <h3>에러 요청</h3>
                <div class="stat-value error">${stats.errorRequests || 0}</div>
                <div class="stat-label">Error Requests</div>
            </div>
            
            <div class="stat-card">
                <h3>평균 응답 시간</h3>
                <div class="stat-value warning">${stats.averageResponseTime || 0}ms</div>
                <div class="stat-label">Average Response Time</div>
            </div>
            
            <div class="stat-card">
                <h3>에러율</h3>
                <div class="stat-value ${(stats.errorRate || 0) > 5 ? 'error' : 'success'}">${stats.errorRate || 0}%</div>
                <div class="stat-label">Error Rate</div>
            </div>
            
            <div class="stat-card">
                <h3>가장 느린 작업</h3>
                <div class="stat-value info" style="font-size: 0.9em; font-family: monospace; word-break: break-all; line-height: 1.2;">${stats.slowestOperation || 'N/A'}</div>
                <div class="stat-label">Slowest Operation</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 성능 지표 (최근 10개)</h2>
            ${performance.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>API 경로</th>
                            <th>HTTP 메서드</th>
                            <th>응답 시간</th>
                            <th>시작 시간</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performance.slice(0, 10).map(p => {
                            const method = p.operation?.includes('POST') ? 'POST' : 
                                         p.operation?.includes('GET') ? 'GET' : 
                                         p.operation?.includes('PUT') ? 'PUT' : 
                                         p.operation?.includes('DELETE') ? 'DELETE' : 
                                         p.operation?.includes('PATCH') ? 'PATCH' : 'UNKNOWN';
                            const path = p.operation?.replace(/^(GET|POST|PUT|DELETE|PATCH)\s+/, '') || p.operation;
                            
                            // 경로를 더 명확하게 표시
                            const displayPath = path || 'N/A';
                            const isApiPath = displayPath.startsWith('/api/');
                            
                            return `
                            <tr>
                                <td style="font-family: monospace; font-size: 0.9em; ${isApiPath ? 'color: #2c3e50; font-weight: bold;' : ''}">${displayPath}</td>
                                <td><span class="badge ${method === 'POST' ? 'info' : method === 'GET' ? 'success' : method === 'PUT' ? 'warning' : method === 'DELETE' ? 'error' : method === 'PATCH' ? 'info' : 'info'}">${method}</span></td>
                                <td>${p.duration}ms</td>
                                <td>${new Date(p.startTime).toLocaleString('ko-KR')}</td>
                                <td><span class="badge ${p.duration > 1000 ? 'error' : p.duration > 500 ? 'warning' : 'success'}">${p.duration > 1000 ? 'Slow' : p.duration > 500 ? 'Medium' : 'Fast'}</span></td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            ` : '<div class="no-data">성능 데이터가 없습니다.</div>'}
        </div>

        <div class="section">
            <h2>❌ 에러 현황 (최근 10개)</h2>
            ${errors.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>에러 메시지</th>
                            <th>API 경로</th>
                            <th>HTTP 메서드</th>
                            <th>발생 시간</th>
                            <th>심각도</th>
                            <th>발생 횟수</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${errors.slice(0, 10).map(e => {
                            const method = e.operation?.includes('POST') ? 'POST' : 
                                         e.operation?.includes('GET') ? 'GET' : 
                                         e.operation?.includes('PUT') ? 'PUT' : 
                                         e.operation?.includes('DELETE') ? 'DELETE' : 
                                         e.operation?.includes('PATCH') ? 'PATCH' : 'UNKNOWN';
                            const path = e.operation?.replace(/^(GET|POST|PUT|DELETE|PATCH)\s+/, '') || e.operation;
                            
                            // 경로를 더 명확하게 표시
                            const displayPath = path || 'N/A';
                            const isApiPath = displayPath.startsWith('/api/');
                            
                            return `
                            <tr>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${e.error}">${e.error}</td>
                                <td style="font-family: monospace; font-size: 0.9em; ${isApiPath ? 'color: #2c3e50; font-weight: bold;' : ''}">${displayPath}</td>
                                <td><span class="badge ${method === 'POST' ? 'info' : method === 'GET' ? 'success' : method === 'PUT' ? 'warning' : method === 'DELETE' ? 'error' : method === 'PATCH' ? 'info' : 'info'}">${method}</span></td>
                                <td>${new Date(e.timestamp).toLocaleString('ko-KR')}</td>
                                <td><span class="badge ${e.severity === 'critical' ? 'error' : e.severity === 'high' ? 'warning' : 'info'}">${e.severity}</span></td>
                                <td>${e.count || 1}</td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            ` : '<div class="no-data">에러 데이터가 없습니다.</div>'}
        </div>

        <div class="section">
            <h2>🐌 느린 쿼리 (최근 10개)</h2>
            ${slowQueries.length > 0 ? `
                <table class="table">
                    <thead>
                        <tr>
                            <th>쿼리</th>
                            <th>실행 시간</th>
                            <th>발생 시간</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${slowQueries.slice(0, 10).map(q => `
                            <tr>
                                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${q.query}</td>
                                <td>${q.duration}ms</td>
                                <td>${new Date(q.timestamp).toLocaleString('ko-KR')}</td>
                                <td><span class="badge error">Slow</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<div class="no-data">느린 쿼리 데이터가 없습니다.</div>'}
        </div>

        <div class="footer">
            <p>🏭 MES 백엔드 시스템 - APM 모니터링 대시보드</p>
            <p>자동 새로고침: 30초마다 | API 문서: <a href="/api-docs" style="color: #3498db;">/api-docs</a></p>
        </div>
    </div>

    <script>
        // 30초마다 자동 새로고침
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
    `;
  }
}
