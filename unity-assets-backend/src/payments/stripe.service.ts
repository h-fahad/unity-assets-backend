import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../common/prisma.service';

type StripeInterval = 'day' | 'week' | 'month' | 'year';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createCheckoutSession(
    userId: number,
    planId: number,
    billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY',
  ) {
    // Get the plan and user
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new Error('Plan not found or inactive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate price based on billing cycle
    let price = plan.basePrice;
    let interval: StripeInterval = 'month';
    let intervalCount = 1;

    switch (billingCycle) {
      case 'WEEKLY':
        price = plan.basePrice / 4; // Weekly price (monthly / 4)
        interval = 'week';
        intervalCount = 1;
        break;
      case 'MONTHLY':
        price = plan.basePrice;
        interval = 'month';
        intervalCount = 1;
        break;
      case 'YEARLY':
        price = plan.basePrice * 12 * (1 - plan.yearlyDiscount / 100);
        interval = 'year';
        intervalCount = 1;
        break;
    }

    // Create or get Stripe price
    const stripePrice = await this.stripe.prices.create({
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval,
        interval_count: intervalCount,
      },
      product_data: {
        name: `${plan.name} - ${billingCycle}`,
      },
    });

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/packages`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
        billingCycle,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    console.log('Webhook received:', signature ? 'with signature' : 'without signature');
    
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed');
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        console.log('Processing invoice.payment_succeeded');
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted');
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Handling checkout session completed:', session.id);
    console.log('Session mode:', session.mode);
    console.log('Session metadata:', session.metadata);
    
    if (session.mode !== 'subscription') {
      console.log('Not a subscription session, skipping');
      return;
    }

    const userId = parseInt(session.metadata?.userId || '0');
    const planId = parseInt(session.metadata?.planId || '0');
    const billingCycle = session.metadata?.billingCycle as 'WEEKLY' | 'MONTHLY' | 'YEARLY';

    console.log('Parsed data:', { userId, planId, billingCycle });

    if (!userId || !planId) {
      console.log('Missing userId or planId, skipping');
      return;
    }

    // Get the subscription details
    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Calculate subscription dates
    const startDate = new Date((subscription as any).current_period_start * 1000);
    const endDate = new Date((subscription as any).current_period_end * 1000);

    // Deactivate any existing active subscription
    await this.prisma.userSubscription.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create new subscription
    console.log('Creating subscription in database:', {
      userId,
      planId,
      startDate,
      endDate,
      stripeSubscriptionId: subscription.id,
    });
    
    const newSubscription = await this.prisma.userSubscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        isActive: true,
        stripeSubscriptionId: subscription.id,
      } as any,
    });
    
    console.log('Subscription created successfully:', newSubscription.id);
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;

    // Update subscription end date
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        stripeSubscriptionId: (invoice as any).subscription as string,
      } as any,
    });

    if (subscription) {
      await this.prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          endDate: new Date(invoice.period_end * 1000),
        },
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    // Deactivate subscription
    await this.prisma.userSubscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      } as any,
      data: {
        isActive: false,
      },
    });
  }

  async cancelSubscription(stripeSubscriptionId: string) {
    await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  }
} 