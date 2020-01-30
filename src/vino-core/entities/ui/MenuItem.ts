import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'menu_items', schema: 'abacus_ui' })
export default class MenuItem
{
   @PrimaryColumn()
   public id: string;

   @Column({ name: 'allowed_role' })
   @IsNotEmpty()
   public allowedRole: string;

   @Column({ nullable: true })
   public title: string;

   @Column({ nullable: true })
   public generator: string;

   @Column({ nullable: true })
   public glyphicon: string;

   @Column({ nullable: true })
   public target: string;

   @Column({ nullable: true })
   public script: string;

   @Column({ nullable: true })
   public command: string;

   @Column({ nullable: true })
   public url: string;

   @Column({ nullable: true })
   public ordinal: number;

   @OneToMany(() => MenuItem, (item) => item.parent, { cascade: true, onDelete: 'CASCADE' })
   public children: MenuItem[];

   @ManyToOne(() => MenuItem, (item) => item.children)
   @JoinColumn({ name: 'parent_id' })
   public parent: MenuItem
}