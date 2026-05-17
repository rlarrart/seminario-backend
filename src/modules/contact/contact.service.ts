import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactRequest } from './entities/contact-request.entity';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactRequest)
    private readonly contactRequestRepository: Repository<ContactRequest>,
  ) {}

  // Guardar solicitud de contacto
  async create(createContactRequestDto: CreateContactRequestDto): Promise<{ message: string }> {
    const contactRequest = this.contactRequestRepository.create(createContactRequestDto);
    await this.contactRequestRepository.save(contactRequest);
    return {
      message: 'Tu solicitud de contacto ha sido recibida. Nos comunicaremos contigo a la brevedad.',
    };
  }
}
