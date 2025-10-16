import { Controller, Get, Query, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ProjectStatusExcelService } from '../services/project-status-excel.service';
import { ProjectStatusQueryDto } from '../dto/project-status.dto';
import { RequirePermission } from '@/common/decorators/permission.decorator';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('프로젝트 현황 Excel')
@Controller('project-status-excel')
@DevAuth()
export class ProjectStatusExcelController {
    constructor(
        private readonly projectStatusExcelService: ProjectStatusExcelService
    ) {}

    @Get('download')
    @ApiOperation({ 
        summary: '프로젝트 현황 Excel 다운로드', 
        description: '프로젝트 현황을 Excel 파일로 다운로드합니다.' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Excel 파일 다운로드 성공'
    })
    @ApiQuery({ 
        name: 'projectCode', 
        required: false, 
        description: '프로젝트 코드',
        example: 'PRJ001'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        description: '시작일 (YYYY-MM-DD)',
        example: '2025-01-01'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        description: '종료일 (YYYY-MM-DD)',
        example: '2025-12-31'
    })
    @RequirePermission('프로젝트 현황', 'read')
    async downloadProjectStatus(
        @Res() res: Response,
        @Request() req: Request & { user: { username: string } },
        @Query() queryDto: ProjectStatusQueryDto
    ) {
        try {
            const username = req.user?.username || 'system';
            
            // Excel 파일 생성
            const excelBuffer = await this.projectStatusExcelService.exportProjectStatusToExcel(queryDto);
            
            // 파일명 생성 (현재 날짜 포함)
            const now = new Date();
            const fileName = `프로젝트현황_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.xlsx`;
            
            // 응답 헤더 설정
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            res.setHeader('Content-Length', excelBuffer.length);
            
            // 파일 전송
            res.send(excelBuffer);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '프로젝트 현황 다운로드 중 오류가 발생했습니다.',
                error: error.message
            });
        }
    }

    @Get('dashboard')
    @ApiOperation({ 
        summary: '프로젝트 현황 Excel 다운로드 대시보드', 
        description: '프로젝트 현황 Excel 다운로드 대시보드 페이지를 제공합니다.' 
    })
    async getProjectStatusExcelDashboard(@Res() res: Response) {
        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 프로젝트 현황 Excel 다운로드</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; min-height: 100vh; }
        .header { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: white; padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2); }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 40px; }
        .card { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.2); }
        .card:hover { transform: translateY(-10px); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
        .card-header { display: flex; align-items: center; margin-bottom: 25px; }
        .card-icon { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-size: 1.8rem; }
        .card-title { font-size: 1.4rem; font-weight: 700; color: #2c3e50; }
        .btn { padding: 15px 30px; border: none; border-radius: 15px; cursor: pointer; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; text-decoration: none; display: inline-block; margin: 10px; }
        .btn-primary { background: linear-gradient(45deg, #667eea, #764ba2); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
        .btn-info { background: linear-gradient(45deg, #17a2b8, #6f42c1); color: white; }
        .btn-info:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(23, 162, 184, 0.4); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        .loading { text-align: center; padding: 40px; color: #7f8c8d; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #007bff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .info-list { list-style: none; padding: 0; }
        .info-list li { padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .info-list li:last-child { border-bottom: none; }
        .info-name { font-weight: 600; color: #2c3e50; }
        .info-desc { color: #7f8c8d; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 프로젝트 현황 Excel 다운로드</h1>
        <p>프로젝트 현황을 Excel 파일로 다운로드하세요</p>
    </div>

    <div class="container">
        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon" style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">📋</div>
                    <div class="card-title">다운로드 옵션</div>
                </div>
                <form id="downloadForm">
                    <div class="form-group">
                        <label for="projectCode">프로젝트 코드</label>
                        <input type="text" id="projectCode" name="projectCode" placeholder="전체 프로젝트 (선택사항)">
                    </div>
                    <div class="form-group">
                        <label for="startDate">시작일</label>
                        <input type="date" id="startDate" name="startDate">
                    </div>
                    <div class="form-group">
                        <label for="endDate">종료일</label>
                        <input type="date" id="endDate" name="endDate">
                    </div>
                    <div style="text-align: center;">
                        <button type="button" class="btn btn-primary" onclick="downloadProjectStatus()">📥 Excel 다운로드</button>
                        <button type="button" class="btn btn-info" onclick="previewProjectStatus()">👁️ 미리보기</button>
                    </div>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon" style="background: linear-gradient(45deg, #56ab2f, #a8e6cf); color: white;">📊</div>
                    <div class="card-title">포함된 정보</div>
                </div>
                <ul class="info-list">
                    <li>
                        <span class="info-name">📋 프로젝트 기본 정보</span>
                        <span class="info-desc">코드, 명, 고객, 품목, 규격</span>
                    </li>
                    <li>
                        <span class="info-name">🛒 수주 현황</span>
                        <span class="info-desc">수주일, 고객 정보</span>
                    </li>
                    <li>
                        <span class="info-name">📦 설계 정보</span>
                        <span class="info-desc">설계 완료일</span>
                    </li>
                    <li>
                        <span class="info-name">🛍️ 발주 현황</span>
                        <span class="info-desc">발주일, 공급업체</span>
                    </li>
                    <li>
                        <span class="info-name">📥 입고 현황</span>
                        <span class="info-desc">입고일, 수량</span>
                    </li>
                    <li>
                        <span class="info-name">🏭 생산계획 현황</span>
                        <span class="info-desc">생산계획일, 수량</span>
                    </li>
                    <li>
                        <span class="info-name">✅ 생산완료 현황</span>
                        <span class="info-desc">생산완료일, 수량</span>
                    </li>
                    <li>
                        <span class="info-name">🔍 품질검사 현황</span>
                        <span class="info-desc">검사일, 결과</span>
                    </li>
                    <li>
                        <span class="info-name">🚚 출하 현황</span>
                        <span class="info-desc">출하일, 수량</span>
                    </li>
                    <li>
                        <span class="info-name">📦 납품 현황</span>
                        <span class="info-desc">납품일, 상태</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div class="card-icon" style="background: linear-gradient(45deg, #ff6b6b, #feca57); color: white;">📈</div>
                <div class="card-title">Excel 파일 구성</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div>
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">📋 프로젝트현황 시트</h4>
                    <ul style="color: #7f8c8d; font-size: 0.9rem; line-height: 1.6;">
                        <li>• 모든 프로젝트의 상세 현황</li>
                        <li>• 단계별 완료일 정보</li>
                        <li>• 프로젝트별 진행 상황</li>
                        <li>• 고객 및 품목 정보</li>
                    </ul>
                </div>
                <div>
                    <h4 style="color: #2c3e50; margin-bottom: 15px;">📊 요약현황 시트</h4>
                    <ul style="color: #7f8c8d; font-size: 0.9rem; line-height: 1.6;">
                        <li>• 전체 프로젝트 통계</li>
                        <li>• 단계별 완료 현황</li>
                        <li>• 프로젝트별 진행률</li>
                        <li>• 완료/진행중/시작전 분류</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function downloadProjectStatus() {
            try {
                showLoading('Excel 파일을 생성하는 중...');
                
                const formData = new FormData(document.getElementById('downloadForm'));
                const params = new URLSearchParams();
                
                for (const [key, value] of formData.entries()) {
                    if (value) params.append(key, value);
                }
                
                const response = await fetch('/api/project-status-excel/download?' + params.toString());
                
                if (!response.ok) {
                    throw new Error('다운로드 요청 실패: ' + response.status);
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '프로젝트현황_' + new Date().toISOString().slice(0, 10) + '.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                hideLoading();
                alert('✅ 프로젝트 현황이 성공적으로 다운로드되었습니다!');
            } catch (error) {
                hideLoading();
                console.error('다운로드 실패:', error);
                alert('❌ 다운로드 실패: ' + error.message);
            }
        }

        async function previewProjectStatus() {
            try {
                showLoading('프로젝트 현황을 조회하는 중...');
                
                const formData = new FormData(document.getElementById('downloadForm'));
                const params = new URLSearchParams();
                
                for (const [key, value] of formData.entries()) {
                    if (value) params.append(key, value);
                }
                
                const response = await fetch('/api/project-status?' + params.toString());
                const result = await response.json();
                
                if (result && Array.isArray(result)) {
                    hideLoading();
                    alert('✅ 프로젝트 현황 미리보기: 총 ' + result.length + '개 레코드가 조회됩니다.');
                } else {
                    throw new Error('미리보기 조회 실패');
                }
            } catch (error) {
                hideLoading();
                console.error('미리보기 실패:', error);
                alert('❌ 미리보기 실패: ' + error.message);
            }
        }

        function showLoading(message) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading';
            loadingDiv.className = 'loading';
            loadingDiv.innerHTML = \`
                <div class="spinner"></div>
                <p>\${message}</p>
            \`;
            loadingDiv.style.position = 'fixed';
            loadingDiv.style.top = '50%';
            loadingDiv.style.left = '50%';
            loadingDiv.style.transform = 'translate(-50%, -50%)';
            loadingDiv.style.background = 'rgba(255,255,255,0.95)';
            loadingDiv.style.padding = '40px';
            loadingDiv.style.borderRadius = '20px';
            loadingDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            loadingDiv.style.zIndex = '9999';
            document.body.appendChild(loadingDiv);
        }

        function hideLoading() {
            const loadingDiv = document.getElementById('loading');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }

        // 오늘 날짜를 기본값으로 설정
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().slice(0, 10);
            document.getElementById('endDate').value = today;
            
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            document.getElementById('startDate').value = oneMonthAgo.toISOString().slice(0, 10);
        });
    </script>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }
}
