import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PurchaseDto } from './dto/purchase-subscription';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';


@Controller('subscription')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}
  
  @Post("purchase")
  @UseGuards(AuthGuard)
  purchase(@Body() payload: PurchaseDto, @Req() req) {
    const userId = req.user.id
    return this.subscriptionPlanService.purchase(userId, payload);
  };

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() payload: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanService.create(payload);
  }

  
  @Get("plans")
  findAll() {
    return this.subscriptionPlanService.findAll();
  }

  @Get('plans/:id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }

  @Patch('plans/:id')
  update(@Param('id') id: string, @Body() payload: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlanService.update(id, payload);
  }

  @Delete('plans/:id')
  remove(@Param('id') id: string) {
    return this.subscriptionPlanService.remove(id);
  }
}
