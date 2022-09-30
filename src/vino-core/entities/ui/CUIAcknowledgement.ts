import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'cui_acknowledgement', schema: 'abacus_ui' })
export default class CUIAcknowledgement
{
   @PrimaryColumn({ name: 'user_id' })
   public userId: string;

}