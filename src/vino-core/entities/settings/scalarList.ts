import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { SettingsGroup } from './settingsGroup';
import { Scalar } from './scalar';

@Entity({ schema: 'abacus_settings' })
export class ScalarList
{
   @PrimaryGeneratedColumn('uuid')
   public id: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column({ default: '', name: 'display_name' })
   public displayName: string;

   @Column({ default: false, name: 'is_default' })
   public isDefault: boolean;

   @OneToMany(() => Scalar, (scalar) => scalar.scalarList, { cascade: true, eager: true, onDelete: 'CASCADE' })
   @ValidateNested({ each: true })
   public entries: Scalar[];

   @ManyToOne(() => SettingsGroup, (parent) => parent.scalarLists, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'parent_group_id' })
   public parentGroup: SettingsGroup;

   public defaultState(): boolean
   {
      if (this.isDefault === null || this.isDefault === undefined)
      {
         this.isDefault = false;
      }
      return this.isDefault;
   }

   public mergeDefaultsFromGroups(toMergeFrom: ScalarList): void
   {
      if (toMergeFrom !== null && toMergeFrom !== undefined)
      {
         if (toMergeFrom.entries !== null && toMergeFrom.entries !== undefined)
         {
            this.entries = toMergeFrom.entries;
         }
         if (toMergeFrom.displayName !== null && toMergeFrom.displayName !== undefined &&
            toMergeFrom.displayName.trim() !== '')
         {
            this.displayName = toMergeFrom.displayName;
         }
      }
   }

   public scalar(nameToFind: string): Scalar
   {
      let ret: Scalar = null;
      if (nameToFind && nameToFind.trim() !== '')
      {
         if (this.entries)
         {
            ret = this.entries.find((scalar) => scalar.name === nameToFind.trim());
            if (ret === undefined)
            {
               ret = null;
            }
         }
      }
      return ret;
   }

   public merge(scalarListToMerge: ScalarList, isDefaults: boolean, defaultScalarList: ScalarList): void
   {
      if (scalarListToMerge)
      {
         if (scalarListToMerge.displayName && scalarListToMerge.displayName.trim() !== '')
         {
            this.displayName = scalarListToMerge.displayName;
         }
         // Merge Scalars
         if (scalarListToMerge.entries)
         {
            if (!this.entries || this.entries.length === 0)
            {
               this.entries = scalarListToMerge.entries;
            }
            else
            {
               for (let newScalar of scalarListToMerge.entries)
               {
                  let existingScalar = this.scalar(newScalar.name);
                  if (existingScalar)
                  {
                     if (isDefaults)
                     {
                        existingScalar.merge(newScalar, null);
                     }
                     else
                     {
                        existingScalar.merge(newScalar, defaultScalarList.scalar(newScalar.name));
                     }
                  }
                  else if (newScalar.name)
                  {
                     if (isDefaults)
                     {
                        this.entries.push(newScalar);
                     }
                     else if (defaultScalarList)
                     {
                        newScalar.inheritDefaults(defaultScalarList.scalar(newScalar.name));
                        this.entries.push(newScalar);
                     }
                  }
               }
            }
         }
      }
   }

   public inheritDefaults(defaultValues: ScalarList): void
   {
      if (defaultValues !== null)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName.trim() === '')
         {
            this.displayName = defaultValues.displayName;
         }
         if (this.entries === null || this.entries === undefined)
         {
            this.entries = defaultValues.entries;
         }
      }
   }

   public validate(treatAsDefaultGroup: boolean): void
   {
      if (this.name === null || this.name === undefined || this.name.trim() === '')
      {
         throw new Error('name is required for a ScalarList');
      }
      if (treatAsDefaultGroup)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName === '')
         {
            throw new Error('displayName is required for ScalarList (' + this.name + ')');
         }
      }
   }

   @AfterLoad()
   public sortEntries(): void
   {
      if (this.entries)
      {
         this.entries.sort(function(scalarA, scalarB)
         {
            if (scalarA.displayName && scalarB.displayName)
            {
               return scalarA.displayName.localeCompare(scalarB.displayName);
            }
            else
            {
               return 0;
            }
         });
      }
   }

   public constructor(name: string, displayName: string, entries: Scalar[])
   {
      this.name = name;
      this.displayName = displayName;
      this.entries = entries;
   }
}
