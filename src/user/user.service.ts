import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async logout(id: number): Promise<boolean> {
    await this.usersRepository.update(id, { refreshToken: '' });
    return true;
  }

  async findByUserid(userId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ userId: userId });
  }

  async validateUserPassword(userId: string, password: string): Promise<User | null> {
    const user = await this.findByUserid(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    return true;
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    await this.usersRepository.update(id, { refreshToken: refreshToken });
    return true;
  }

  async tokenConfirm(id: number, refreshToken: string) {
    return await this.usersRepository.findOneBy({
      id: id,
      refreshToken: refreshToken,
    });
  }
}
