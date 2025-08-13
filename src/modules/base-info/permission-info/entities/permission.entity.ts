import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Entity } from 'typeorm';

@Entity('authoritymanages')
export class AuthorityManages {
    @ApiProperty({ example: 1, description: '권한 고유 ID (자동 생성)' })
    @PrimaryGeneratedColumn({ comment: '권한 고유 ID (자동 생성)' })
    id: number;

    @ApiProperty({ example: 'all', description: '모든 권한' })
    @Column({ name: 'all_grant', type: 'varchar', length: 10, comment: '모든 권한' })
    allGrant: string;

    @ApiProperty({ example: 'admin', description: '권한 그룹명' })
    @Column({ name: 'group_name', type: 'varchar', length: 50, comment: '권한 그룹명' })
    groupName: string;

    @ApiProperty({ example: 'admin', description: '메인 메뉴' })
    @Column({ name: 'main_menu', type: 'text', comment: '메인 메뉴' })
    mainMenu: string;

    @ApiProperty({ example: 'admin', description: '서브 메뉴' })
    @Column({ name: 'sub_menu', type: 'text', comment: '서브 메뉴' })
    subMenu: string;

    @ApiProperty({ example: 'admin', description: '생성일시 (자동 생성)' })
    @CreateDateColumn({ comment: '생성일시' })
    createdAt: Date;

    @ApiProperty({ example: 'admin', description: '수정일시 (자동 생성)' })
    @UpdateDateColumn({ comment: '수정일시' })
    updatedAt: Date;
}

@Entity('sub_menu')
export class SubMenu {
    @ApiProperty({ example: 1, description: '서브 메뉴 고유 ID (자동 생성)' })
    @PrimaryGeneratedColumn({ comment: '서브 메뉴 고유 ID (자동 생성)' })
    id: number;
    
    @ApiProperty({ example: 1, description: '메인 메뉴 고유 ID' })
    @Column({ name: 'menu_id', type: 'int', comment: '메인 메뉴 고유 ID' })
    menuId: number;
    
    @ApiProperty({ example: 'admin', description: '메인 메뉴명' })
    @Column({ name: 'menu_name', type: 'varchar', length: 50, comment: '메인 메뉴명' })
    menuName: string;

    @ApiProperty({ example: 'admin', description: '상위 메뉴 고유 ID' })
    @Column({ name: 'upper_menu_id', type: 'int', comment: '상위 메뉴 고유 ID' })
    upperMenuId: number;

    @ApiProperty({ example: 'admin', description: '생성일시 (자동 생성)' })
    @CreateDateColumn({ comment: '생성일시' })
    createdAt: Date;

    @ApiProperty({ example: 'admin', description: '수정일시 (자동 생성)' })
    @UpdateDateColumn({ comment: '수정일시' })
    updatedAt: Date;
}

@Entity('main_menu')
export class mainMenu {
    @ApiProperty({ example: 1, description: '메인 메뉴 고유 ID (자동 생성)' })
    @PrimaryGeneratedColumn({ comment: '메인 메뉴 고유 ID (자동 생성)' })
    id: number;

    @ApiProperty({ example: 1, description: '메인 메뉴 고유 ID' })
    @Column({ name: 'menu_id', type: 'int', comment: '메인 메뉴 고유 ID' })
    menuId: number;

    @ApiProperty({ example: 'admin', description: '메인 메뉴명' })
    @Column({ name: 'menu_name', type: 'varchar', length: 50, comment: '메인 메뉴명' })
    menuName: string;

    @ApiProperty({ example: 'admin', description: '생성일시 (자동 생성)' })
    @CreateDateColumn({ comment: '생성일시' })
    createdAt: Date;

    @ApiProperty({ example: 'admin', description: '수정일시 (자동 생성)' })
    @UpdateDateColumn({ comment: '수정일시' })
    updatedAt: Date;
}