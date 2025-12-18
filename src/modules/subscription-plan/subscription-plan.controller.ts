import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PurchaseDto } from './dto/purchase-subscription';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('subscription')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @Post('purchase')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  purchase(@Body() payload: PurchaseDto, @Req() req) {
    const userId = req.user.id;
    return this.subscriptionPlanService.purchase(userId, payload);
  }

  @Post()
  @ApiSecurity('cookie-auth-key')
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() payload: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(payload);
  }

  @Get('plans')
  @ApiSecurity('cookie-auth-key')
  @UseGuards(AuthGuard)
  findAll(@Req() req) {
    const userRole = req.user.role;
    return this.subscriptionPlanService.findAll(userRole);
  }

  @Get('plans/:id')
  @ApiSecurity('cookie-auth-key')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch('plans/:id')
  @ApiSecurity('cookie-auth-key')
  update(
    @Param('id') id: string,
    @Body() payload: UpdateSubscriptionPlanDto,
    @Req() req,
  ) {
    if (req.user.role !== 'SUPERADMIN' || req.user.role !== 'ADMIN') {
      throw new ForbiddenException({
        message: "Sizda bu amalni bajarish uchun ruhsat yo'q",
      });
    }
    return this.subscriptionPlanService.update(id, payload);
  }

  @Delete('plans/:id')
  remove(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'SUPERADMIN' || req.user.role !== 'ADMIN') {
      throw new ForbiddenException({
        message: "Sizda bu amalni bajarish uchun ruhsat yo'q",
      });
    }
    return this.subscriptionPlanService.remove(id);
  }
}
