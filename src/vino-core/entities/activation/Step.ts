import { Entity, Column, JoinColumn, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, AfterLoad } from 'typeorm';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { StepWrapper } from './StepWrapper';
import { Parameter } from '../common/Parameter';

@Entity('service_activation_steps')
export class Step
{
   @PrimaryGeneratedColumn('uuid')
   @IsNotEmpty()
   @IsUUID()
   public id: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column()
   @IsNotEmpty()
   public description: string;

   @Column({ name: 'node_id' })
   @IsNotEmpty()
   public nodeId: string;

   @Column({ name: 'iteration_count' })
   @IsNotEmpty()
   public iterationCount: number;

   @Column('bigint', { name: 'activation_time' })
   @IsNotEmpty()
   public activatedTime: number;

   @ManyToOne(() => StepWrapper, (stepWrapper) => stepWrapper.steps)
   @JoinColumn({ name: 'step_wrapper_id' })
   public stepWrapper: StepWrapper;

   @ManyToMany(() => Parameter, (parameter) => parameter.inputStep, { eager: true, cascade: true })
   @JoinTable({
      name: 'service_activation_step_input_parameters',
      joinColumn: { name: 'service_activation_step_id' },
      inverseJoinColumn: { name: 'parameter_id' }
   })
   public inputParameters: Parameter[];

   @ManyToMany(() => Parameter, (parameter) => parameter.outputStep, { eager: true, cascade: true })
   @JoinTable({
      name: 'service_activation_step_output_parameters',
      joinColumn: { name: 'service_activation_step_id' },
      inverseJoinColumn: { name: 'parameter_id' }
   })
   public outputParameters: Parameter[];


   @AfterLoad()
   public afterLoad(): void
   {
      this.activatedTime = Number(this.activatedTime);
   }
}