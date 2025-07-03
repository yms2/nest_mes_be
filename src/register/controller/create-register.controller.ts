//회원가입 하는 Controller
import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from '../service/create-register.service';
import { CreateRegisterDto } from '../dto/create-register.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Register') // Swagger에서 User 그룹으로 묶기
@Controller('register')
//실제 컨트롤러 클레스 선언 API 엔드포인트로 등록
export class RegisterController {
  //생성자를 만들어서 UserService 주입 => UserService 클래스를 사용할 수 있게 해줌
  //private readonly 외부에서 접근 불가 / 값 변경 불가;
  constructor(private readonly registerService: RegisterService) {}

  // 회원가입 요청을 처리하는 API 엔드포인트
  @Post('create')
  @ApiOperation({ summary: '회원가입', description: '신규 회원을 등록합니다.' })
  async create(@Body() createRegisterDto: CreateRegisterDto) {
    return this.registerService.createUser(createRegisterDto);
  }
}
