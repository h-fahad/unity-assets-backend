import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  RawBodyRequest,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../common/auth-request.interface';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session for subscription' })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    
    try {
      const session = await this.stripeService.createCheckoutSession(
        userId,
        dto.planId,
        dto.billingCycle,
      );
      
      return session;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing request body');
    }

    try {
      return await this.stripeService.handleWebhook(signature, req.rawBody);
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  @Post('create-subscription-manual')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually create subscription for testing' })
  async createSubscriptionManual(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    
    try {
      // Create a test subscription directly in the database
      const plan = await this.stripeService['prisma'].subscriptionPlan.findUnique({
        where: { id: dto.planId, isActive: true },
      });

      if (!plan) {
        throw new BadRequestException('Plan not found or inactive');
      }

      // Calculate dates based on billing cycle
      const startDate = new Date();
      const endDate = new Date();
      
      switch (dto.billingCycle) {
        case 'WEEKLY':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'MONTHLY':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'YEARLY':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Deactivate any existing active subscription
      await this.stripeService['prisma'].userSubscription.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Create new subscription
      const subscription = await this.stripeService['prisma'].userSubscription.create({
        data: {
          userId,
          planId: dto.planId,
          startDate,
          endDate,
          isActive: true,
          stripeSubscriptionId: `manual_${Date.now()}`,
        } as any,
        include: {
          plan: true,
        },
      });

      return {
        message: 'Subscription created manually',
        subscription,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
} 