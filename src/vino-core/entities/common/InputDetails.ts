import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Parameter } from './Parameter';

@Entity('input_parameter_details')
export class InputDetails
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column({ name: 'from_constants' })
   @IsNotEmpty()
   public fromConstants: boolean;

   @Column({
      name: 'constants_path',
      type: 'text',
      nullable: true
   })
   public constantsPath: string;

   @Column({
      name: 'is_optional',
      default: false
   })
   public isOptional: boolean;

   @Column({
      name: 'is_final',
      default: false
   })
   public isFinal: boolean;

   @Column({
      type: 'simple-array',
      nullable: true
   })
   public options: string[];

   @OneToOne(() => Parameter, (parameter) => parameter.inputDetails)
   public parameter: Parameter;
}