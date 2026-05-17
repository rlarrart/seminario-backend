import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Recibir formulario de contacto (público)
  @Post()
  async create(@Body() createContactRequestDto: CreateContactRequestDto) {
    return this.contactService.create(createContactRequestDto);
  }
}
