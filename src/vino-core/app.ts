/* globals __dirname */
/* globals process */
/* globals console */
/* globals module */

import createError from 'http-errors';
import * as express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import http from 'http';
import RED from 'node-red';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

import apiRouter from './routes/api';
import uiRouter from './routes/ui';
import fileUploadRouter from './routes/fileUpload';
import projectsRouter from './routes/projects'

import { SwaggerUtility } from './routes/services/utility/swaggerUtility';

import swaggerJsDoc from 'swagger-jsdoc';
const swaggerUtility = new SwaggerUtility();

const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');

const app = express.default();
app.use(compression());

app.set('trust proxy', true);

const keycloakSettings = {
   'realm': process.env.KEYCLOAK_REALM,
   'auth-server-url': `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_HOST}/auth`,
   'ssl-required': 'none',
   'resource': process.env.KEYCLOAK_CLIENT_ID,
   'credentials': { 'secret': process.env.KEYCLOAK_CLIENT_SECRET },
   'confidential-port': 0,
   'policy-enforcer': {}
};


const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, keycloakSettings);

app.use(session({
   secret: process.env.VINO_SECRET,
   resave: false,
   saveUninitialized: true,
   store: memoryStore
}));

const server = http.createServer(app);
const port = process.env.VINO_PORT || 3000;
app.set('port', port);

// Setup up swagger-jsdoc
const swaggerDefinition = {
   info: {
      title: 'ViNO Rest Services',
      version: '1.0.0'
   },
   basePath: '/rest'
};
const options = {
   swaggerDefinition: swaggerDefinition,
   apis: ['./routes/services/private/*', './routes/services/public/*']
};
const swaggerSpec = swaggerJsDoc(options);

app.get('/swagger-rest.json', (req, res) =>
{
   res.setHeader('Content-Type', 'application/json');
   res.send(swaggerSpec);
});

app.get('/swagger-flows.json', async function(req, res)
{
   res.setHeader('Content-Type', 'application/json');
   const flowsJSON = await swaggerUtility.generateFlowsSwagger();
   res.send(flowsJSON);
});

// Serve up swagger-ui at /swagger via static route
const docsHandler = express.static(path.join(__dirname, '/etc/swaggerModels/'));
app.get(/^\/swagger(\/.*)?$/, function(req, res, next)
{
   if (req.url === '/swagger')
   {
      res.writeHead(302, { 'Location': req.url + '/' });
      res.end();
      return;
   }
   req.url = req.url.substr('/swagger'.length);
   return docsHandler(req, res, next);
});

app.use('/swaggerUI', express.static(path.join(__dirname, '/libraries/swagger-ui/')));

// app.use('/swaggerModels', express.static(__dirname + '/etc/swaggerModels/'));

const redSettings = {
   httpAdminRoot: '/service-manager',
   httpNodeRoot: '/api',
   nodesDir: path.join(__dirname, '/nodes'),
   userDir: '/root/.node-red/',
   functionGlobalContext: {},
   vino: { serviceManagerBaseUrl: process.env.NODE_RED_URL || `localhost:${port}` },
   editorTheme: {
      page: {
         title: 'ViNO - Service Manager',
         css: ['/opt/vino/vino-core/web/css/ctl.css'],
         favicon: '/opt/vino/vino-core/web/favicon.ico'
      },
      header: {
         title: 'ViNO - Service Manager',
         image: '/opt/vino/vino-core/web/centurylink-logo-black-text.png',
         url: '/' // Make the header logo navigate to the main application
      },
      deployButton: {
         type: 'simple',
         label: 'Save'
      },
      projects: {
         // To enable the Projects feature, set this value to true
         enabled: true
      },
      userMenu: false, // hide the user menu - we want authentication to be handled by the main application
      login: { image: '/opt/vino/vino-core/web/centurylink-logo-black-text.png' }
   }
};
RED.init(server, redSettings);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'web')));
app.use('/nodes/lib/ui', express.static(path.join(__dirname, 'nodes/lib/ui')));

app.use(morgan('combined', {
   stream: fs.createWriteStream('/var/log/vino/ip-access.log', {flags: 'a'})
}));

app.use(keycloak.middleware());
app.use('/', express.static('./web'));
app.use('/rest', keycloak.protect(), apiRouter(keycloak));
app.use('/ui', keycloak.protect(), uiRouter());
app.use('/files', keycloak.protect(), fileUploadRouter);
app.use('/projects', keycloak.protect('realm:administrator'), projectsRouter(RED));

app.use(redSettings.httpAdminRoot, keycloak.protect('realm:user'), RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(redSettings.httpNodeRoot, RED.httpNode);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction)
{
   next(createError(404));
});

// error handler
app.use(function(err, req: express.Request, res: express.Response, next: express.NextFunction)
{
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get('env') === 'development' ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.send('error');
   next(err);
});

createConnection().then(function()
{
   server.listen(port);
   RED.start();
}).catch(function(err)
{
   console.error(`Error connecting to database. ${err}`);
});

module.exports = app;
