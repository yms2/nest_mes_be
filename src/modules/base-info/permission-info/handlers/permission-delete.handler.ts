import { Injectable } from '@nestjs/common';
import { PermissionDeleteService } from '../services/permission-delete.service';

export class DeletePermissionCommand {
    constructor(
        public readonly id: number,
        public readonly deleteReason?: string,
        public readonly deletedBy?: string,
    ) {}
}

export class BatchDeletePermissionCommand {
    constructor(
        public readonly ids: number[],
        public readonly deleteReason?: string,
        public readonly deletedBy?: string,
    ) {}
}

export class SoftDeletePermissionCommand {
    constructor(
        public readonly id: number,
        public readonly deleteReason?: string,
        public readonly deletedBy?: string,
    ) {}
}

@Injectable()
export class PermissionDeleteHandler {
    constructor(
        private readonly permissionDeleteService: PermissionDeleteService,
    ) {}

    async handleDelete(command: DeletePermissionCommand): Promise<void> {
        return this.permissionDeleteService.deletePermission(
            command.id,
            command.deleteReason,
            command.deletedBy,
        );
    }

    async handleBatchDelete(command: BatchDeletePermissionCommand): Promise<void> {
        return this.permissionDeleteService.batchDeletePermissions(
            command.ids,
            command.deleteReason,
            command.deletedBy,
        );
    }

    async handleSoftDelete(command: SoftDeletePermissionCommand): Promise<void> {
        return this.permissionDeleteService.softDeletePermission(
            command.id,
            command.deleteReason,
            command.deletedBy,
        );
    }
}
