// Using the .env file
require("dotenv").config();

// .env variables
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

// App setup
const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());

// Connect to the database
const ConnectDB = require("./database/connection");
ConnectDB(DB_URL);

// Import routers
const SupplierRoutes = require("./routes/suppliers/SupplierRoutes");
const UserRoutes = require("./routes/users/UserRoutes");
const ClientRoutes = require("./routes/clients/ClientRoutes");
const AuthRoutes = require("./routes/authentication/AuthRoutes");
const ArticleRoutes = require("./routes/articles/ArticleRoutes");
const ColorRoutes = require("./routes/colors/ColorRoutes");
const CatalogRoutes = require("./routes/catalogs/CatalogRoutes");
const SalesRoutes = require("./routes/sales/SalesRoutes");
const RoleRoutes = require('./routes/roles/RoleRoutes')

// Enable CORS for specified origins and methods
const AllowedOrigins = require("./utils/AllowedOrigins");
app.use(
  cors({
    origin: AllowedOrigins,
    methods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Set up routes
const routes = [
  AuthRoutes,
  ArticleRoutes,
  SupplierRoutes,
  UserRoutes,
  ClientRoutes,
  ColorRoutes,
  CatalogRoutes,
  SalesRoutes,
  RoleRoutes
];

// Prefix all routes with "/api"
routes.forEach((route) => {
  app.use("/api", route);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
