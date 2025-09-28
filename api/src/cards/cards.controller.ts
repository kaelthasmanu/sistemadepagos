import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Get('user/:usuarioId')
  findByUser(@Param('usuarioId') usuarioId: string) {
    return this.service.findByUser(Number(usuarioId));
  }
}
