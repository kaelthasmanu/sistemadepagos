import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.usuarios.create({ data: dto });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [data, count] = await this.prisma.$transaction([
      this.prisma.usuarios.findMany({ skip, take }),
      this.prisma.usuarios.count(),
    ]);

    return {
      data,
      count,
      page,
      limit: take,
      totalPages: Math.max(1, Math.ceil(count / take)),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuarios.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return user;
  }
}
