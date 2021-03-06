import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, AfterLoad } from 'typeorm';
import { IsNotEmpty, IsDefined } from 'class-validator';
import { SettingsGroup } from './settingsGroup';
import { ScalarList } from './scalarList';
import crypto = require('crypto');

export enum Type {
   string = 'string',
   number = 'number',
   boolean = 'bool'
}

@Entity({ schema: 'abacus_settings' })
export class Scalar
{
   @PrimaryGeneratedColumn('uuid')
   public id: string;

   @Column()
   @IsNotEmpty()
   public name: string;

   @Column()
   @IsDefined()
   public value: string;

   @Column({ default: '', name: 'display_name' })
   public displayName: string;

   @Column({ default: false })
   public required: boolean;

   @Column({ default: false, name: 'encrypt' })
   public encrypt: boolean;

   @Column('enum', { name: 'type', enum: Type })
   public type: Type;

   @Column({ default: false, name: 'is_default' })
   public isDefault: boolean;

   @ManyToOne(() => ScalarList, (list) => list.entries, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'scalar_list_id' })
   public scalarList: ScalarList;

   @ManyToOne(() => SettingsGroup, (parent) => parent.scalars, { onDelete: 'CASCADE' })
   @JoinColumn({ name: 'parent_group_id' })
   public parentGroup: SettingsGroup;

   @BeforeInsert()
   public encryptValues(): void
   {
      if (this.encrypt && this.type === Type.string)
      {
         this.value = this.encryptValue(this.value);
      }
   }

   @AfterLoad()
   public decryptValues(): void
   {
      if (this.encrypt && this.type === Type.string)
      {
         this.value = this.decryptValue(this.value);
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

   public defaultState(): boolean
   {
      if (this.isDefault === null || this.isDefault === undefined)
      {
         this.isDefault = false;
      }
      return this.isDefault;
   }

   public getValue(): string
   {
      let ret = null;
      switch (this.getType())
      {
         case Type.string:
            ret = this.stringValue();
            break;
         case Type.number:
            ret = this.numberValue().toString();
            break;
         case Type.boolean:
            ret = this.booleanValue().toString();
            break;
         default:
            break;
      }
      return ret;
   }

   public isRequired(): boolean
   {
      if (this.required === null || this.required === undefined)
      {
         this.required = false;
      }
      return this.required;
   }

   public isEncrypted(): boolean
   {
      if (this.encrypt === null || this.encrypt === undefined)
      {
         this.encrypt = false;
      }
      return this.encrypt;
   }

   public getType(): Type
   {
      if (this.type === null || this.type === undefined)
      {
         this.type = Type.string;
      }
      return this.type;
   }

   public stringValue(): string
   {
      let ret = null;
      if (this.getType() === Type.string)
      {
         ret = this.value;
      }
      return ret;
   }

   public booleanValue(): string
   {
      let ret = null;
      if (this.getType() === Type.boolean)
      {
         ret = this.value === 'true';
      }
      return ret;
   }

   public numberValue(): string
   {
      let ret = null;
      if (this.getType() === Type.number)
      {
         ret = Number(this.value);
         if (Number.isNaN(ret))
         {
            ret = null;
         }
      }
      return ret;
   }

   public mergeDefaultsFromGroups(toMergeFrom: Scalar): void
   {
      if (toMergeFrom !== null && toMergeFrom !== undefined)
      {
         this.value = toMergeFrom.getValue();
         this.required = toMergeFrom.isRequired();
         this.encrypt = toMergeFrom.isEncrypted();
         this.type = toMergeFrom.getType();
         if (toMergeFrom.displayName !== null && toMergeFrom.displayName !== undefined &&
            toMergeFrom.displayName.trim() !== '')
         {
            this.displayName = toMergeFrom.displayName;
         }
      }
   }

   public merge(scalarToMerge: Scalar, defaultScalar: Scalar): void
   {
      if (scalarToMerge.displayName && scalarToMerge.displayName.trim() !== '')
      {
         this.displayName = scalarToMerge.displayName;
      }
      const newValue = scalarToMerge.getValue();
      if (newValue)
      {
         this.value = newValue;
      }
      else if (defaultScalar)
      {
         this.value = defaultScalar.getValue();
      }
      const newRequired = scalarToMerge.isRequired();
      if (newRequired)
      {
         this.required = newRequired;
      }
      else if (defaultScalar)
      {
         this.required = defaultScalar.isRequired();
      }
      const newEncrypted = scalarToMerge.isEncrypted();
      if (newEncrypted)
      {
         this.encrypt = newEncrypted;
      }
      else if (defaultScalar)
      {
         this.encrypt = defaultScalar.isEncrypted();
      }
      const newType = scalarToMerge.getType();
      if (newType)
      {
         this.type = newType;
      }
      else if (defaultScalar)
      {
         this.type = defaultScalar.getType();
      }
   }

   public inheritDefaults(defaultValues: Scalar): void
   {
      if (defaultValues !== null)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName.trim() === '')
         {
            this.displayName = defaultValues.displayName;
         }
         if (this.getValue() === null || this.getValue() === undefined)
         {
            this.value = defaultValues.getValue();
            this.isDefault = true;
         }
         if (this.required === null || this.required === undefined)
         {
            this.required = defaultValues.isRequired();
         }
         if (this.encrypt === null || this.encrypt === undefined)
         {
            this.encrypt = defaultValues.isEncrypted();
         }
         this.type = defaultValues.getType();
      }
   }

   public validate(treatAsDefault: boolean, existingDefaults: Scalar): void
   {
      const toValidate: Scalar = new Scalar(this.name, this.getValue(), this.displayName, this.isRequired(), this.getType(), this.isEncrypted());
      toValidate.isDefault = this.defaultState();
      toValidate.inheritDefaults(existingDefaults);
      toValidate.isValid(treatAsDefault);
   }

   private isValid(treatAsDefault: boolean): void
   {
      if (this.name === null || this.name.trim() === '')
      {
         throw new Error('name is required for a Scalar');
      }
      if (treatAsDefault)
      {
         if (this.displayName === null || this.displayName === undefined || this.displayName.trim() === '')
         {
            throw new Error('displayName is required for Scalar (' + this.name + ')');
         }
      }
      else
      {
         if (this.isRequired() && (this.getValue() === null || this.getValue().trim() === ''))
         {
            throw new Error('required attribute (' + this.name + ') has no value');
         }
      }
      if (this.getValue() !== null && this.getValue().trim() !== '')
      {
         switch (this.getType())
         {
            case Type.number:
               if (this.numberValue() === null)
               {
                  throw new Error('attribute (' + this.name + ') is not a number');
               }
               break;
            case Type.boolean:
               if (this.booleanValue() === null)
               {
                  throw new Error('attribute (' + this.name + ') is not a boolean');
               }
               break;
            case Type.string:
            default:
               if (this.stringValue() === null)
               {
                  throw new Error('attribute (' + this.name + ') is not a string');
               }
               break;
         }
      }
   }

   public constructor(name: string, value: string, displayName: string, required: boolean, type?: Type, encrypt?: boolean)
   {
      this.name = name;
      this.value = value;
      this.displayName = displayName;
      this.required = required;
      this.type = type;
      this.encrypt = encrypt;
   }
}
