import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PrismaModule, UsersModule, CardsModule, PaymentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
