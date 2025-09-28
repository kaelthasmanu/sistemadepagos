import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCardDto) {
    return this.prisma.tarjetas.create({
      data: {
        usuario_id: dto.usuarioId,
        alias: dto.alias,
        brand: dto.brand,
        last4: dto.last4,
        exp_month: dto.exp_month,
        exp_year: dto.exp_year,
        token: dto.token,
      },
    });
  }

  async findByUser(usuarioId: number) {
    return this.prisma.tarjetas.findMany({ where: { usuario_id: usuarioId } });
  }
}
