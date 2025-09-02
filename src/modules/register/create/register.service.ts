import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { user } from './entity/create.entity';
import { CreateRegisterDto, UserRole } from './dto/create.dto';
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
  async createUser(createRegisterDto: CreateRegisterDto & { employee_code?: string }): Promise<user> {
    const { username, password, passwordConfirm, email, group_name, employee_code } = createRegisterDto;

    // 1. 비밀번호 확인 검증
    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 2. 아이디 중복 체크
    const existingUser = await this.regiseterRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('이미 사용중인 아이디입니다.');
    }

    // 3. 사원코드 중복 체크
    if (employee_code) {
      const existingEmployeeCode = await this.regiseterRepository.findOne({ where: { employee_code } });
      if (existingEmployeeCode) {
        throw new ConflictException('이미 사용중인 사원코드입니다.');
      }
    }

    // 4. 이메일 중복 체크 (이메일이 제공된 경우에만)
    if (email) {
      const existingEmail = await this.regiseterRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException('이미 사용중인 이메일입니다.');
      }
    }

    // 5. 권한 검증
    if (!Object.values(UserRole).includes(group_name)) {
      throw new BadRequestException('유효하지 않은 권한입니다.');
    }

    // 6. 비밀번호 유효성 검사 (DTO에서 이미 검증됨)
    if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
    }

    // 7. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12); // saltRounds를 12로 증가

    // 8. 새 유저 생성 및 저장
    const newUser = this.regiseterRepository.create({
      username,
      password: hashedPassword,
      email,
      group_name,
      employee_code,
    });

    // 9. 실제 DB에 INSERT 실행
    const savedUser = await this.regiseterRepository.save(newUser);
    
    // 10. 비밀번호 필드를 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as user;
  }

  // 특정 날짜의 마지막 사용자 조회 (사원코드 생성용)
  async findLastUserByDate(dateStr: string): Promise<user | null> {
    const pattern = `EMP${dateStr}%`;
    return this.regiseterRepository
      .createQueryBuilder('user')
      .where('user.employee_code LIKE :pattern', { pattern })
      .orderBy('user.employee_code', 'DESC')
      .getOne();
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
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.regiseterRepository.update(id, { password: hashedPassword });
  }

  // 사용자명으로 사용자 조회
  async findByUsername(username: string): Promise<user | null> {
    return await this.regiseterRepository.findOne({ where: { username } });
  }

  // 권한별 사용자 목록 조회
  async findUsersByRole(role: UserRole): Promise<user[]> {
    return await this.regiseterRepository.find({ 
      where: { group_name: role },
      select: ['id', 'username', 'email', 'group_name', 'createdAt']
    });
  }

  // 전체 사용자 목록 조회 (비밀번호 제외)
  async findAllUsers(): Promise<Omit<user, 'password'>[]> {
    const users = await this.regiseterRepository.find({
      select: ['id', 'username', 'email', 'group_name', 'createdAt', 'updatedAt']
    });
    return users;
  }
}
