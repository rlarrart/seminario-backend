import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Buscar un usuario por su email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  // Buscar un usuario por su ID
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  // Buscar un usuario por su token de reestablecimiento de contraseña
  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { resetToken: token } });
  }

  // Crear un nuevo usuario en la base de datos
  async create(userData: Partial<User>): Promise<User> {
    const emailNormalized = userData.email?.toLowerCase().trim();
    if (!emailNormalized) {
      throw new ConflictException('El email es requerido');
    }

    const existingUser = await this.findByEmail(emailNormalized);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = this.userRepository.create({
      ...userData,
      email: emailNormalized,
    });
    return this.userRepository.save(user);
  }

  // Actualizar un usuario existente
  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    // Evitamos pisar el email con uno duplicado si se intenta cambiar
    if (updateData.email) {
      const emailNormalized = updateData.email.toLowerCase().trim();
      if (emailNormalized !== user.email) {
        const existingUser = await this.findByEmail(emailNormalized);
        if (existingUser) {
          throw new ConflictException('El email ya está registrado');
        }
        user.email = emailNormalized;
      }
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  // Guardar directamente (para tokens de reset, etc.)
  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
