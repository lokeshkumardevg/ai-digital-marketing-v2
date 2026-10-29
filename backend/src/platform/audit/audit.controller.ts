import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';

@Controller('v1/audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(
    @Req() req: any,
    @Query('agentId') agentId?: string,
    @Query('runId') runId?: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const orgId = req.user?.id || req.user?._id;
    return this.auditService.getLogs(orgId, { agentId, runId, limit, skip });
  }
}

