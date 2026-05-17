import { IsUUID, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateAdhesionDto {
  @IsUUID('4', { message: 'El ID de la oportunidad debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la oportunidad es obligatorio' })
  opportunityId!: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos de 1 unidad' })
  quantity!: number;

  @IsString({ message: 'El método de pago debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El método de pago es obligatorio para simular la transacción' })
  paymentMethod!: string;
}
