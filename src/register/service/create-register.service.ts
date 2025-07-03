import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from '../entity/create-register.entity';
import { CreateRegisterDto } from '../dto/create-register.dto';
import * as bcrypt from 'bcrypt';

// Service 받을 수 있게 해준다.
@Injectable()
export class RegisterService {
  //TypeORM의 Repository를 주입받아 사용
  // Repository는 TypeORM에서 제공하는 데이터베이스 작업을 위한 인터페이스이다
  constructor(
    @InjectRepository(user)
    private readonly regiseterRepository: Repository<user>,
  ) {}
  // 회원가입 요청 처리
  async createUser(createRegisterDto: CreateRegisterDto): Promise<user> {
    // 요청 들어온 데이터에 username, password, email 추출
    const { username, password, email } = createRegisterDto;

    // 아이디 중복 체크
    const existingUser = await this.regiseterRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('이미 사용중인 아이디입니다.');
    }

    // 비밀번호 유효성 검사 (예: 최소 길이, 특수문자 등)
    if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
    }

    // 이메일 중복 체크
    const existingEmail = await this.regiseterRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new BadRequestException('이미 사용중인 이메일입니다.');
    }

    // 3. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 유저 저장
    const user = this.regiseterRepository.create({
      username,
      password: hashedPassword,
      email,
    });
    // 실제 DB에 INSERT 실행
    return await this.regiseterRepository.save(user);
  }
}
