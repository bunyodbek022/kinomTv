import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UUID } from 'crypto';
import { PurchaseDto } from './dto/purchase-subscription';
import { addDays, format } from 'date-fns';

@Injectable()
export class SubscriptionPlanService {
  constructor(private readonly prisma: PrismaService) {}
  async create(payload: CreateSubscriptionPlanDto) {
    try {
      const exist = await this.prisma.subscriptionPlan.findFirst({
        where: { name: payload.name, isActive: true },
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

  async purchase(userId: UUID, payload: PurchaseDto) {
    try {
      const subPlanExist = await this.prisma.subscriptionPlan.findUnique({
        where: { id: payload.planId },
      });
      if (!subPlanExist) {
        throw new NotFoundException('Bunday subscription plan mavjud emas');
      }
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });
      if (subPlanExist.name === 'LIFETIME' && user?.role === 'USER') {
        throw new ForbiddenException(
          'Siz bu subscription planda foydalana olmaysiz',
        );
      }

      const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
      const end = addDays(new Date(), subPlanExist.durationDays);

      const userSub = await this.prisma.userSubscription.create({
        data: {
          planId: subPlanExist.id,
          userId: userId,
          startDate: new Date(),
          endDate: end,
          status: 'pending_payment',
          autoRenew: payload.autoRenew || false,
        },
      });

      const payment = await this.prisma.payments.create({
        data: {
          userSubscriptionId: userSub.id,
          amount: subPlanExist.price,
          paymentMethod: payload.paymentMethod,
          paymentDetailes: JSON.stringify(payload.payment_details),
          status: 'complected',
        },
      });

      if (payment.status === 'complected') {
        await this.prisma.userSubscription.update({
          where: { id: userSub.id },
          data: { status: 'active' },
        });
      }
      return {
        success: true,
        message: 'Obuna muvaffaqiyatli sotib olindi',
        data: {
          subscription: {
            id: userSub.id,
            plan: {
              id: subPlanExist.id,
              name: subPlanExist.name,
            },
            startDate: userSub.startDate,
            endDate: userSub.endDate,
            status: userSub.status,
            autoRenew: userSub.autoRenew,
          },
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
          },
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: 'subscription xarid qilishda xatolik',
        error,
      });
    }
  }
  async findAll(userRole: string) {
    try {
      if (userRole === 'SUPERADMIN' || userRole === 'ADMIN') {
        return await this.prisma.subscriptionPlan.findMany({
          where: { isActive: true },
        });
      }

      return this.prisma.subscriptionPlan.findMany({
        where: {
          isActive: true,
          NOT: {
            name: {
              in: ['LIFETIME'], 
            },
          },
        },
      });
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
        message: 'subscription plan updated successfully',
        data: updatedPlan,
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
      const softDeleted = await this.prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        success: true,
        message: 'Bu subscription plan recomendationdan olib tashlandi',
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
