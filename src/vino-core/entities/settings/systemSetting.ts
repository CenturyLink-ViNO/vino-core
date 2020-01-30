import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ schema: 'abacus_settings' })
export class SystemSetting
{
   @PrimaryGeneratedColumn('uuid')
   public id: string;

   @Column()
   @IsNotEmpty()
   public key: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column()
   @IsNotEmpty()
   public value: string;

   public updateFrom(newSettingValue: SystemSetting): void
   {
      this.name = newSettingValue.name;
      this.value = newSettingValue.value;
   }

   public constructor(key: string, name: string, value: string)
   {
      this.key = key;
      this.name = name;
      this.value = value;
   }
}
