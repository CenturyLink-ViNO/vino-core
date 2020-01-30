import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne, AfterLoad } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ServiceActivation } from './ServiceActivation';

@Entity('service_status')
export class Status
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column()
   @IsNotEmpty()
   public status: string;

   @Column('bigint')
   @IsNotEmpty()
   public time: number;

   @Column('text')
   @IsNotEmpty()
   public message: string;

   @Column({ name: 'status_index' })
   @IsNotEmpty()
   public statusIndex: number;

   @ManyToOne(() => ServiceActivation, (serviceActivation) => serviceActivation.status)
   @JoinColumn({ name: 'service_activation_id' })
   public serviceActivation: ServiceActivation;

   @AfterLoad()
   public afterLoad(): void
   {
      this.time = Number(this.time);
   }
}