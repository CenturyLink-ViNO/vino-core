import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { OutputDetails } from './OutputDetails';
import { InputDetails } from './InputDetails';
import { Step } from '../activation/Step';

export enum ParameterType {
   STRING = 'string',
   NUMBER = 'number',
   BOOLEAN = 'boolean',
   JSON = 'json',
   ENCODED_STRING = 'encodedString',
   ENUMERATED = 'enumerated',
   STRING_LIST = 'stringList',
   NUMBER_LIST = 'numberList',
   BOOLEAN_LIST = 'booleanList'
}

@Entity()
export class Parameter
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column({ name: 'name' })
   @IsNotEmpty()
   public parameterName: string;

   @Column({ name: 'key' })
   @IsNotEmpty()
   public parameterKey: string;

   @Column({ name: 'description' })
   @IsNotEmpty()
   public parameterDescription: string;

   @Column('enum', { enum: ParameterType, name: 'type' })
   @IsNotEmpty()
   public parameterType: ParameterType;

   @Column({ default: false })
   @IsNotEmpty()
   public encrypt: boolean;

   @Column({
      name: 'string_value',
      nullable: true
   })
   public stringValue: string;

   @Column({
      name: 'number_value',
      type: 'float',
      nullable: true
   })
   public numberValue: number;

   @Column({
      name: 'bool_value',
      nullable: true
   })
   public booleanValue: boolean;

   @Column({
      name: 'encoded_string_value',
      nullable: true
   })
   public encodedStringValue: string;

   @Column({
      name: 'enumerated_string_value',
      nullable: true
   })
   public enumeratedValue: string;

   @Column({
      name: 'string_list_value',
      type: 'simple-array',
      nullable: true
   })
   public stringListValue: string[];

   @Column({
      name: 'number_list_value',
      type: 'simple-array',
      nullable: true
   })
   public numberListValue: number[];

   @Column({
      name: 'boolean_list_value',
      type: 'simple-array',
      nullable: true
   })
   public booleanListValue: boolean[];

   @Column({
      name: 'json_value',
      type: 'simple-json',
      nullable: true
   })
   public jsonValue: object; // TODO: determine how simple-json columns function without a defined structure

   @OneToOne(() => OutputDetails, (outputDetails) => outputDetails.parameter, { cascade: true, onDelete: 'CASCADE' })
   @JoinColumn({ name: 'output_details_id' })
   public outputDetails: OutputDetails;

   @OneToOne(() => InputDetails, (inputDetails) => inputDetails.parameter, { cascade: true, onDelete: 'CASCADE' })
   @JoinColumn({ name: 'input_details_id' })
   public inputDetails: InputDetails;

   @ManyToMany(() => Step, (step) => step.inputParameters)
   public inputStep: Step;

   @ManyToMany(() => Step, (step) => step.outputParameters)
   public outputStep: Step;

   @BeforeInsert()
   public sanitizeLists(): void
   {
      if (this.stringListValue)
      {
         this.stringListValue = JSON.parse(JSON.stringify(this.stringListValue));
      }
      if (this.booleanListValue)
      {
         this.booleanListValue = JSON.parse(JSON.stringify(this.booleanListValue));
      }
      if (this.numberListValue)
      {
         this.numberListValue = JSON.parse(JSON.stringify(this.numberListValue));
      }
   }
}
