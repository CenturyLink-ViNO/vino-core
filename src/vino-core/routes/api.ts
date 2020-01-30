import express from 'express';

// Public Routes
import serviceControlRouter from './services/public/serviceControl';
import configurationStoreRouter from './services/public/configurationStore';
import settingsServerRouter from './services/public/settingsServer';
// Private Routes
import serviceRegistrationRouter from './services/private/serviceRegistration';
import configurationStorePrivateRouter from './services/private/configurationStore';
import settingsServerPrivateRouter from './services/private/settingsServer';

export default function(keycloak): express.Router
{
   const router = express.Router();
   // **********************************************************************************************************************
   // Public Routes *******************************************************************************************************
   // **********************************************************************************************************************
   // Service Control Routes
   router.use('/services', serviceControlRouter(keycloak));
   // Configuration Store Routes
   router.use('/services/activated', configurationStoreRouter(keycloak));
   // Settings Server Routes
   router.use('/settings', settingsServerRouter(keycloak));

   // **********************************************************************************************************************
   // Private Routes ******************************************************************************************************
   // **********************************************************************************************************************
   // Service Registration Routes
   router.use('/service', serviceRegistrationRouter(keycloak));
   // Service Activation Routes
   router.use('/service/activated', configurationStorePrivateRouter(keycloak));
   // Settings Server Routes
   router.use('/settings', settingsServerPrivateRouter(keycloak));

   return router;
}
