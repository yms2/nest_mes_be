import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

//user URL.경로로 시작하는 API 요청은 여기로 들어오게 해줘 라는 의미
@Controller('user')
//실제 컨트롤러 클레스 선언 API 엔드포인트로 등록
export class UserController {
  //생성자를 만들어서 UserService 주입 => UserService 클래스를 사용할 수 있게 해줌
  constructor(private readonly userService: UserService) {}
}
