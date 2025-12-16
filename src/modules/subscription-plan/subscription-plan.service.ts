import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateSubscriptionPlanDto) {
    try {
      const exist = await this.prisma.subscriptionPlan.findFirst({
        where: { name: payload.name },
      });
      if (exist) {
        return {
          success: false,
          message: "Bunday ta'rif oldindan mavjud",
        };
      }
      const plan = await this.prisma.subscriptionPlan.create({
        data: {
          name: payload.name,
          price: payload.price,
          durationDays: payload.durationDays,
          features: payload.features || null,
        },
      });
      return {
        success: true,
        message: 'new Subscription plan created',
        data: plan,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'createSubscriptionPlanda xatolik',
        error,
      });
    }
  }

  async findAll() {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany();
      return {
        success: true,
        data: plans,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'findAll SubscriptionPlanda xatolik',
        error,
      });
    }
  }

  async findOne(id: string) {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
      });
      if (!plan) {
        return {
          success: false,
          message: 'Bunday turdagi subscriptionPlan topilmadi',
        };
      }

      return {
        success: true,
        data: plan,
      };
      
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'find One SubscriptionPlanda xatolik',
        error,
      });
    }
  }

  async update(id: string, payload: UpdateSubscriptionPlanDto) {
    try {
      const updatedPlan = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: payload,
      });
      return {
        success: true,
        message: "subscription plan updated successfully",
        data: updatedPlan
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'update SubscriptionPlanda xatolik',
        error,
      });
    }
  }

  async remove(id: string) {
    try {
      const softDeleted = await this.prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } });
      return {
        success: true,
        message: "Bu subscription plan recomendationdan olib tashlandi"
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'delete SubscriptionPlanda xatolik',
        error,
      });
    }
  }
}
