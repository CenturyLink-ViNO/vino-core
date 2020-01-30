import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { Step } from './Step';
import { ServiceActivation } from './ServiceActivation';

@Entity('service_activation_step_wrapper')
export class StepWrapper
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column({ name: 'node_id' })
   @IsNotEmpty()
   public nodeId: string;

   @OneToMany(() => Step, (step) => step.stepWrapper, { eager: true, cascade: true, onDelete: 'CASCADE' })
   public steps: Step[];

   @ManyToOne(() => ServiceActivation, (serviceActivation) => serviceActivation.steps)
   @JoinColumn({ name: 'service_activation_id' })
   public serviceActivation: ServiceActivation;
}