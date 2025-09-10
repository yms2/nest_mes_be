import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PermissionUpdateDto {
    @ApiProperty({ example: 'admin', description: '권한 그룹명' })
    @IsString({ message: '권한 그룹명은 필수값입니다.' })
    @IsNotEmpty({ message: '권한 그룹명은 필수 입력값입니다.' })
    groupName: string;

    @ApiProperty({ example: 'all', description: '모든 권한' })
    @IsString({ message: '모든 권한은 필수값입니다.' })
    @IsNotEmpty({ message: '모든 권한은 필수 입력값입니다.' })
    allGrant: string;

    @ApiProperty({ example: '["menu1", "menu2"]', description: '메인 메뉴 권한' })
    @IsString({ message: '메인 메뉴 권한은 필수값입니다.' })
    @IsNotEmpty({ message: '메인 메뉴 권한은 필수 입력값입니다.' })
    mainMenu: string;

    @ApiProperty({ example: '["sub1", "sub2"]', description: '서브 메뉴 권한' })
    @IsString({ message: '서브 메뉴 권한은 필수값입니다.' })
    @IsNotEmpty({ message: '서브 메뉴 권한은 필수 입력값입니다.' })
    subMenu: string;
}

export class MenuPermissionUpdateDto {
    @ApiProperty({ example: [1, 2, 3], description: '메인 메뉴 ID 배열' })
    mainMenuIds: number[];

    @ApiProperty({ example: [1, 2, 3], description: '서브 메뉴 ID 배열' })
    subMenuIds: number[];
}
