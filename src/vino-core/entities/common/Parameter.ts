import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToOne, JoinColumn, BeforeInsert, AfterLoad } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { OutputDetails } from './OutputDetails';
import { InputDetails } from './InputDetails';
import { Step } from '../activation/Step';
import crypto = require('crypto');

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

   @BeforeInsert()
   public encryptValues(): void
   {
      if (this.encrypt)
      {
         switch (this.parameterType)
         {
            case ParameterType.ENCODED_STRING:
               this.encodedStringValue = this.encryptValue(this.encodedStringValue);
               break;
            case ParameterType.STRING:
               this.stringValue = this.encryptValue(this.stringValue);
               break;
            default:
               // If we're not dealing with a string or encoded string, there is nothing to encrypt.
               break;
         }
      }
   }

   @AfterLoad()
   public decryptValues(): void
   {
      if (this.encrypt)
      {
         switch (this.parameterType)
         {
            case ParameterType.ENCODED_STRING:
               this.encodedStringValue = this.decryptValue(this.encodedStringValue);
               break;
            case ParameterType.STRING:
               this.stringValue = this.decryptValue(this.stringValue);
               break;
            default:
               // If we're not dealing with a string or encoded string, there is nothing to decrypt.
               break;
         }
      }
   }

   // Below methods adapted from Open Source Github GIST: https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb
   // Original GIST authored by Vance Lucas (https://gist.github.com/vlucas)
   private encryptValue(value)
   {
      // Provide a generated encrpytion key to prevent runtime errors.
      // VINO_ENCRYPTION_KEY MUST BE SET for values to be secure
      const encryptionKey = process.env.VINO_ENCRYPTION_KEY || 'AIikHOZ3k0httmd3n9dsd5LrFRemogLu';
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
      let encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
   }

   private decryptValue(value)
   {
      // Provide a generated encrpytion key to prevent runtime errors.
      // VINO_ENCRYPTION_KEY MUST BE SET for values to be secure
      const encryptionKey = process.env.VINO_ENCRYPTION_KEY || 'AIikHOZ3k0httmd3n9dsd5LrFRemogLu';
      const textParts = value.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
      const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
      return decrypted.toString();
   }
}
