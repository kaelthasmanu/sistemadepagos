import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return this.prisma.usuarios.create({ data: dto });
  }

  async findAll() {
    return this.prisma.usuarios.findMany();
  }

  async findOne(id: number) {
    return this.prisma.usuarios.findUnique({ where: { id } });
  }
}
