import { Injectable, InternalServerErrorException, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterService } from '../register/create/register.service';
import { user } from '../register/create/entity/create.entity';
import { CreateRegisterDto, UserRole } from '../register/create/dto/create.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// 사용자 정보 업데이트용 DTO
export class UpdateUserInfoDto {
  username?: string;
  email?: string;
  group_name?: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: RegisterService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 회원가입 기능
  async register(createRegisterDto: CreateRegisterDto): Promise<Omit<user, 'password'> & { accessToken: string; refreshToken: string }> {
    try {
      // 1. 비밀번호 확인 검증
      if (createRegisterDto.password !== createRegisterDto.passwordConfirm) {
        throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      }

      // 2. 권한 검증
      if (!Object.values(UserRole).includes(createRegisterDto.group_name)) {
        throw new BadRequestException('유효하지 않은 권한입니다.');
      }

      // 3. 회원가입 처리
      const newUser = await this.userService.createUser(createRegisterDto);

      // 4. 회원가입 성공 시 JWT 토큰 발급 (자동 로그인)
      const payload = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        group_name: newUser.group_name,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      });

      // 5. 리프레시 토큰 저장
      await this.userService.updateRefreshToken(newUser.id, refreshToken);

      // 6. 회원가입 성공 응답 (토큰 포함)
      return {
        ...newUser,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      console.error('회원가입 처리 오류:', error);
      throw new InternalServerErrorException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  async validateAdmin(username: string, password: string) {
    return this.userService.validateUserPassword(username, password);
  }

  async login(user: Omit<user, 'password'>) {
    try {
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        group_name: user.group_name,
      };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      });
      await this.userService.updateRefreshToken(user.id, refreshToken);

      const result = { accessToken, refreshToken };
      return result;
    } catch (error) {
      console.error('로그인 처리 오류:', error);
      throw new InternalServerErrorException('로그인 실패');
    }
  }

  async logout(id: number) {
    return this.userService.logout(id);
  }

  async generateAdminAccessToken(user: user, refreshToken: string) {
    const tokenData = await this.userService.tokenConfirm(user.id, refreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        group_name: user.group_name,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );

    // ✅ 새 Refresh Token 발급
    const newRefreshToken = this.jwtService.sign(
      { id: user.id, username: user.username, email: user.email, group_name: user.group_name },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    await this.userService.updateRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  // 사용자 권한 확인
  async checkUserPermission(userId: number, requiredRole: UserRole): Promise<boolean> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return false;
      }

      // 권한 계층 구조 정의
      const roleHierarchy = {
        [UserRole.VIEWER]: 1,
        [UserRole.USER]: 2,
        [UserRole.MANAGER]: 3,
        [UserRole.ADMIN]: 4,
      };

      const userRoleLevel = roleHierarchy[user.group_name];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      console.error('권한 확인 오류:', error);
      return false;
    }
  }

  // 사용자 정보 조회 (비밀번호 제외)
  async getUserInfo(userId: number): Promise<Omit<user, 'password'> | null> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      return null;
    }
  }

  // 사용자 정보 업데이트 (아이디, 이메일, 그룹 변경)
  async updateUserInfo(userId: number, updateUserInfoDto: UpdateUserInfoDto): Promise<Omit<user, 'password'>> {
    try {
      const { username, email, group_name } = updateUserInfoDto;
      const updateData: Partial<user> = {};

      // 현재 사용자 정보 조회
      const currentUser = await this.userService.findById(userId);
      if (!currentUser) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 아이디 변경 시 중복 체크
      if (username && username !== currentUser.username) {
        const existingUser = await this.userService.findByUsername(username);
        if (existingUser) {
          throw new ConflictException('이미 사용중인 아이디입니다.');
        }
        updateData.username = username;
      }

      // 이메일 변경 시 중복 체크
      if (email && email !== currentUser.email) {
        const existingEmail = await this.userService.findById(userId);
        if (existingEmail && existingEmail.email === email) {
          throw new ConflictException('이미 사용중인 이메일입니다.');
        }
        updateData.email = email;
      }

      // 권한 변경 시 검증
      if (group_name && group_name !== currentUser.group_name) {
        if (!Object.values(UserRole).includes(group_name)) {
          throw new BadRequestException('유효하지 않은 권한입니다.');
        }
        updateData.group_name = group_name;
      }

      // 업데이트할 데이터가 있는 경우에만 업데이트
      if (Object.keys(updateData).length > 0) {
        // RegisterService의 Repository를 직접 사용하여 업데이트
        const userRepository = (this.userService as any).regiseterRepository;
        await userRepository.update(userId, updateData);
        
        // 업데이트된 사용자 정보 반환
        const updatedUser = await this.userService.findById(userId);
        if (updatedUser) {
          const { password, ...userWithoutPassword } = updatedUser;
          return userWithoutPassword;
        }
      }

      // 변경사항이 없는 경우 기존 정보 반환
      const { password, ...userWithoutPassword } = currentUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('사용자 정보 업데이트 오류:', error);
      throw new InternalServerErrorException('사용자 정보 업데이트 중 오류가 발생했습니다.');
    }
  }

  // 아이디 중복확인
  async checkUsernameAvailability(username: string): Promise<{ available: boolean; message: string }> {
    try {
      // 아이디 유효성 검사
      if (!username || username.length < 4) {
        return {
          available: false,
          message: '아이디는 최소 4자 이상이어야 합니다.'
        };
      }

      // 아이디 형식 검사 (영문, 숫자, 언더스코어만 허용)
      const usernamePattern = /^[a-zA-Z0-9_]+$/;
      if (!usernamePattern.test(username)) {
        return {
          available: false,
          message: '아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'
        };
      }

      // 중복 확인
      const existingUser = await this.userService.findByUsername(username);
      
      if (existingUser) {
        return {
          available: false,
          message: '이미 사용중인 아이디입니다.'
        };
      }

      return {
        available: true,
        message: '사용 가능한 아이디입니다.'
      };
    } catch (error) {
      console.error('아이디 중복확인 오류:', error);
      throw new InternalServerErrorException('아이디 중복확인 중 오류가 발생했습니다.');
    }
  }

  // 이메일 중복확인
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
    try {
      // 이메일 형식 검사
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return {
          available: false,
          message: '올바른 이메일 형식이 아닙니다.'
        };
      }

      // 중복 확인
      const existingUser = await this.userService.findByUsername(email);
      
      if (existingUser && existingUser.email === email) {
        return {
          available: false,
          message: '이미 사용중인 이메일입니다.'
        };
      }

      return {
        available: true,
        message: '사용 가능한 이메일입니다.'
      };
    } catch (error) {
      console.error('이메일 중복확인 오류:', error);
      throw new InternalServerErrorException('이메일 중복확인 중 오류가 발생했습니다.');
    }
  }

  // 사용자 정보 계정 조회 (ID로 조회)
  async getUserInfoById(id: number): Promise<Omit<user, 'password'> | null> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        return null;
      }
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('사원계정 조회 오류 (ID):', error);
      return null;
    }
  }
}