"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const typeorm_service_1 = require("./services/typeorm_service");
const config_1 = __importDefault(require("./config/config"));
const backup_service_1 = __importDefault(require("./services/backup_service"));
const request_logger_1 = __importDefault(require("./middlewares/request_logger"));
const error_handler_1 = __importDefault(require("./middlewares/error_handler"));
const logging_service_1 = __importDefault(require("./services/logging_service"));
const post_router_1 = __importDefault(require("./routes/post_router"));
const app_router_1 = __importDefault(require("./routes/app_router"));
const form_data_resolver_1 = __importDefault(require("./middlewares/form_data_resolver"));
const auth_router_1 = __importDefault(require("./routes/auth_router"));
require("./types");
const app = (0, express_1.default)();
const port = config_1.default.serverPort;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(request_logger_1.default);
app.use(form_data_resolver_1.default);
app.use('/share', express_1.default.static(config_1.default.publicFilesDir));
app.use('/api', post_router_1.default);
app.use('/api', auth_router_1.default);
app.use('/', app_router_1.default);
app.use(error_handler_1.default);
(0, backup_service_1.default)();
logging_service_1.default.console(JSON.stringify(config_1.default));
typeorm_service_1.AppDataSource.initialize()
    .then(() => {
    logging_service_1.default.saveInfo('MySQL Database connected');
    const server = app.listen(parseInt(port), '0.0.0.0', () => {
        logging_service_1.default.console(`Server is running on http://0.0.0.0:${port}`);
        logging_service_1.default.console(config_1.default);
        logging_service_1.default.saveInfo(`Server is running on http://0.0.0.0:${port}`);
    });
    server.on('error', (err) => {
        logging_service_1.default.saveError(`Server encountered an error: ${err.message}`);
    });
})
    .catch((err) => logging_service_1.default.saveError(`Database connection error: ${err}`));
