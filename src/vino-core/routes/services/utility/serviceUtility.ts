import { StepWrapper } from '../../../entities/activation/StepWrapper';
import { Step } from '../../../entities/activation/Step';
import { Parameter, ParameterType } from '../../../entities/common/Parameter';
import { ServiceActivation } from '../../../entities/activation/ServiceActivation';
import { usFederalCustomerRole } from '../../../app';

export class ServiceUtility
{
   public async protectEncryptedData(stepWrapper: StepWrapper): Promise<StepWrapper>
   {
      if (stepWrapper.steps && Array.isArray(stepWrapper.steps))
      {
         for (const step of stepWrapper.steps)
         {
            if (step.inputParameters && Array.isArray(step.inputParameters))
            {
               for (const param of step.inputParameters)
               {
                  if (param.encrypt)
                  {
                     switch (param.parameterType)
                     {
                        case ParameterType.ENCODED_STRING:
                           param.encodedStringValue = '*******';
                           break;
                        case ParameterType.STRING:
                           param.stringValue = '*******';
                           break;
                        default:
                           // If we're not dealing with a string or encoded string, there is nothing to encrypt.
                           break;
                     }
                  }
               }
            }
         }
      }
      return stepWrapper;
   }
   public checkUserAuthorizedForUsFederalCustomer(activation: ServiceActivation, req: any): boolean
   {
      let token = req.kauth?.grant?.access_token;
      if (activation.isUsFederalCustomer)
      {
         let authorized = true;
         if (!token)
         {
            authorized = false;
         }
         else
         {
            authorized = token.hasRealmRole(usFederalCustomerRole);
         }
         return authorized;
      }
      return true
   }
}
