import { Injectable } from '@nestjs/common';
import { PermissionUpdateService } from '../services/permission-update.service';
import { PermissionUpdateDto } from '../dto/permission-update.dto';
import { authoritymanages } from '../entities/permission.entity';

export class UpdatePermissionCommand {
    constructor(
        public readonly id: number,
        public readonly updateDto: PermissionUpdateDto,
        public readonly updatedBy: string,
    ) {}
}

@Injectable()
export class PermissionUpdateHandler {
    constructor(
        private readonly permissionUpdateService: PermissionUpdateService,
    ) {}

    async handle(command: UpdatePermissionCommand): Promise<authoritymanages> {
        return this.permissionUpdateService.updatePermission(
            command.id,
            command.updateDto,
            command.updatedBy,
        );
    }
}
