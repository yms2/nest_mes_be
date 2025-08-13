import { Injectable } from '@nestjs/common';
import { PermissionCreateService } from '../services/permission-create.service';
import { PermissionCreateDto } from '../dto/permission-create.dto';
import { AuthorityManages } from '../entities/permission.entity';

export class CreatePermissionCommand {
    constructor(
        public readonly createDto: PermissionCreateDto,
    ) {}
}

@Injectable()
export class PermissionCreateHandler {
    constructor(
        private readonly permissionCreateService: PermissionCreateService,
    ) {}

    async handle(command: CreatePermissionCommand): Promise<AuthorityManages> {
        return this.permissionCreateService.createPermission(command.createDto);
    }
}
