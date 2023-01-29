import { ensureAuthenticated } from '../config/auth.js';
import express from "express";
import DB from '../db/connection.js';
import ClientMailService from '../service/clientmailservice.js';


const ClientRoutes = express.Router();
const ClientService = new ClientMailService(DB);

ClientRoutes.post("/create", ClientService.createClientService)
ClientRoutes.post("/all", ensureAuthenticated, ClientService.getClientService)
ClientRoutes.post("/delete/:id", ensureAuthenticated, ClientService.deleteMail)


export default ClientRoutes;