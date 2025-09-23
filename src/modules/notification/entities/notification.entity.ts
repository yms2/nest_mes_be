import { BaseEntity } from "@/common/entities/base.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity } from "typeorm";

@Entity()
export class Notification extends BaseEntity {
    @ApiProperty({ example: 'NTF001', description: '알림 코드' })
    @Column({ name: 'notification_code', type: 'varchar', length: 20 ,comment: '알림 코드',nullable: true})
    notificationCode: string;

    @ApiProperty({ example: '알람 종류' })
    @Column({ name: 'notification_type', type: 'varchar', length: 50 ,comment: '알림 종류',nullable: true})
    notificationType: string;

    @ApiProperty({ example: '알람 일자' })
    @Column({ name: 'notification_date', type: 'date' ,comment: '알림 일자',nullable: true})
    notificationDate: Date;

    @ApiProperty({ example: '알람 제목' })
    @Column({ name: 'notification_title', type: 'varchar', length: 255 ,comment: '알림 제목',nullable: true})
    notificationTitle: string;

    @ApiProperty({ example: '알람 내용' })
    @Column({ name: 'notification_content', type: 'varchar', length: 255 ,comment: '알림 내용',nullable: true})
    notificationContent: string;

    @ApiProperty({ example: '발신자' })
    @Column({ name: 'sender', type: 'varchar', length: 255 ,comment: '발신자',nullable: true})
    sender: string;

    @ApiProperty({ example: '수신자' })
    @Column({ name: 'receiver', type: 'varchar', length: 255 ,comment: '수신자',nullable: true})
    receiver: string;

    @ApiProperty({ example: '확인일자' })
    @Column({ name: 'check_date', type: 'date' ,comment: '확인일자',nullable: true})
    checkDate: Date;

    @ApiProperty({ example: '상태' })
    @Column({ name: 'status', type: 'varchar', length: 255 ,comment: '상태',nullable: true})
    status: string;
    
}