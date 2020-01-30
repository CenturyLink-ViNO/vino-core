import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Parameter } from './Parameter';

export enum OutputType {
   REGEX = 'REGEX',
   XPATH = 'XPATH',
   JSONPATH = 'JSONPATH',
   CUSTOM = 'CUSTOM'
}

@Entity('output_parameter_details')
export class OutputDetails
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column('enum', { enum: OutputType })
   @IsNotEmpty()
   public type: OutputType;

   @Column()
   @IsNotEmpty()
   public format: string;

   @OneToOne(() => Parameter, (parameter) => parameter.outputDetails, {})
   public parameter: Parameter;
}