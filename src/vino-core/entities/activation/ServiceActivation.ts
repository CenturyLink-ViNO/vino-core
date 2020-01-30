import { Entity, Column, PrimaryColumn, OneToMany, AfterLoad } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { StepWrapper } from './StepWrapper';
import { Status } from './Status';

@Entity()
export class ServiceActivation
{
   @PrimaryColumn()
   @IsNotEmpty()
   public id: string;

   @Column({ name: 'reference_id' })
   @IsNotEmpty()
   public referenceId: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column()
   @IsNotEmpty()
   public description: string;

   @Column()
   @IsNotEmpty()
   public visible: boolean;

   @Column('bigint', { name: 'start_time' })
   @IsNotEmpty()
   public startTime: number;

   @Column({ name: 'customer_name' })
   @IsNotEmpty()
   public customerName: string;

   @Column({ nullable: true })
   public notes: string;

   @Column({ name: 'settings_root_group', nullable: true })
   public settingsRootGroup: string;

   @Column('jsonb', { name: 'input_template', nullable: true })
   public inputTemplate: object;

   @Column('jsonb', { name: 'msg', nullable: true })
   public msg: object;

   @OneToMany(() => StepWrapper, (step) => step.serviceActivation, { cascade: true, onDelete: 'CASCADE' })
   public steps: StepWrapper[];

   @OneToMany(() => Status, (status) => status.serviceActivation, { eager: true, cascade: true, onDelete: 'CASCADE' })
   public status: Status[];

   @AfterLoad()
   public afterLoad(): void
   {
      this.startTime = Number(this.startTime);
      this.status = this.status.sort((first, second) => first.statusIndex - second.statusIndex);
   }
}
