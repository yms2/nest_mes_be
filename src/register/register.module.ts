import { Module } from '@nestjs/common';
import { RegisterController } from './controller/create-register.controller';
import { RegisterService } from './service/create-register.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from '../register/entity/create-register.entity'; // User 엔티티를 사용한다면

@Module({
  imports: [TypeOrmModule.forFeature([user])], // 만약 User 엔티티 사용한다면
  controllers: [RegisterController],
  providers: [RegisterService],
})
export class RegisterModule {}
