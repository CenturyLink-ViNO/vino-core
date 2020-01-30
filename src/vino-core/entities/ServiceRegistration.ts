import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { IsUUID, NotContains, IsNotEmpty } from 'class-validator';

@Entity()
export class ServiceRegistration
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column()
   @IsNotEmpty()
   @NotContains('.')
   public name: string;

   @Column()
   @IsNotEmpty()
   public description: string;

   @Column({ name: 'entry_node_id' })
   @IsNotEmpty()
   public entryNodeId: string;
}