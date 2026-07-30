import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from './card.entity';

@ApiTags('Tarjetas')
@Controller('cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una tarjeta tokenizada' })
  @ApiCreatedResponse({ type: Card })
  @ApiBadRequestResponse({ description: 'Cuerpo de la petición inválido' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  create(@Body() dto: CreateCardDto) {
    return this.service.create(dto);
  }

  @Get('user/:usuarioId')
  @ApiOperation({ summary: 'Listar tarjetas de un usuario' })
  @ApiOkResponse({ type: Card, isArray: true })
  findByUser(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.service.findByUser(usuarioId);
  }
}
