import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreatePurchaseDto, ConfirmPurchaseDto } from './dto/create-purchase.dto';
import Stripe from 'stripe';
import { prisma } from 'lib/prisma'; // Assuming lib/prisma exports the client

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PurchaseService {
  private stripe: Stripe;

  constructor() {
    const rawKey = process.env.STRIPE_SECRET_KEY || '';
    console.log('--- STRIPE INIT ---');
    console.log(`Loaded Secret Key Length: ${rawKey.length}`);
    console.log(`Key Prefix: ${rawKey.substring(0, 8)}...`);

    this.stripe = new Stripe(rawKey, {
      apiVersion: '2023-10-16', // or current stable version
    } as any);
  }

  async createPaymentIntent(userId: number, createPurchaseDto: CreatePurchaseDto) {
    try {
      const { book_id, amount, currency } = createPurchaseDto;
      const book = await prisma.book.findUnique({ where: { id: book_id } });

      if (!book) {
        throw new BadRequestException('Book not found');
      }

      // Convert amount to cents for Stripe, assuming amount is passed in full dollars like 10.99
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          userId: userId.toString(),
          bookId: book_id.toString(),
        },
      });

      console.log(`PaymentIntent created successfully: ${paymentIntent.id}`);

      // Save a pending purchase in DB
      await prisma.purchase.create({
        data: {
          user_id: userId,
          book_id: book_id,
          amount,
          currency,
          stripe_payment_intent: paymentIntent.id,
          payment_status: paymentIntent.status,
          purchased_at: new Date(),
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
       console.error('--- STRIPE CREATE INTENT ERROR ---');
       console.error(error);
       if (error instanceof BadRequestException) throw error;
       throw new InternalServerErrorException('Error creating payment intent: ' + error.message);
    }
  }

  async confirmPayment(userId: number, confirmPurchaseDto: ConfirmPurchaseDto) {
    try {
      const { paymentIntentId } = confirmPurchaseDto;

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new BadRequestException('Payment not successful yet');
      }

      // Find the pending purchase
      const purchase = await prisma.purchase.findFirst({
        where: {
          stripe_payment_intent: paymentIntentId,
          user_id: userId,
        },
      });

      if (!purchase) {
        throw new BadRequestException('Purchase record not found');
      }

      // Update purchase status
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { payment_status: paymentIntent.status },
      });

      // Add book to UserLibrary to signify they own it
      const existingLibraryEntry = await prisma.userLibrary.findFirst({
         where: {
           user_id: userId,
           book_id: purchase.book_id
         }
      });

      if (!existingLibraryEntry) {
         await prisma.userLibrary.create({
            data: {
              user_id: userId,
              book_id: purchase.book_id,
            }
         });
      }

      return { message: 'Payment confirmed successfully', purchase };
    } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new InternalServerErrorException('Error confirming payment: ' + (error as Error).message);
    }
  }

  async getMyPurchasedBooks(userId: number) {
    try {
      const purchases = await prisma.purchase.findMany({
        where: {
          user_id: userId,
          payment_status: 'succeeded',
        },
        include: {
          book: {
            include: {
              bookCategories: {
                include: {
                  category: true
                }
              }
            }
          }
        },
        orderBy: {
          purchased_at: 'desc',
        },
      });

      // Return unified objects
      return purchases.map(p => ({
         ...p.book,
         purchase_details: {
             purchase_id: p.id,
             amount: p.amount,
             currency: p.currency,
             purchased_at: p.purchased_at
         }
      }));
    } catch (error) {
       throw new InternalServerErrorException('Error fetching purchased books: ' + (error as Error).message);
    }
  }
}
