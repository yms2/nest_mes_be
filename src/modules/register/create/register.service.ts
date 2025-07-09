import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from './entity/create.entity';
import { CreateRegisterDto } from './dto/create.dto';
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

    async findById(id: number): Promise<user | null> {
    return this.regiseterRepository.findOne({ where: { id } });
  }
  // 회원가입 요청 처리
  async createUser(createRegisterDto: CreateRegisterDto): Promise<user> {
    // 요청 들어온 데이터에 username, password, email 추출
    const { username, password, email, group_name } = createRegisterDto;

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

    // 그룹명 존재 유무 체크
    if (!group_name) {
      throw new BadRequestException('그룹명을 선택해주세요.');
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

  // 사용자 비밀번호 검증
  async validateUserPassword(
    username: string,
    password: string,
  ): Promise<Omit<user, 'password'> | null> {
    const user = await this.regiseterRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: passwordField, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  // 리프레시 토큰 업데이트
  async updateRefreshToken(id: number, refreshToken: string): Promise<void> {
    await this.regiseterRepository.update(id, { refreshToken });
  }

  // 로그아웃
  async logout(id: number): Promise<void> {
    await this.regiseterRepository.update(id, { refreshToken: undefined });
  }

  // 토큰 확인
  async tokenConfirm(id: number, refreshToken: string): Promise<user | null> {
    const user = await this.regiseterRepository.findOne({ where: { id, refreshToken } });
    return user;
  }

  // 비밀번호 변경
  async changePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.regiseterRepository.update(id, { password: hashedPassword });
  }

  // 사용자명으로 사용자 조회
  async findByUsername(username: string): Promise<user | null> {
    return await this.regiseterRepository.findOne({ where: { username } });
  }
}
