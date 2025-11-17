const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TasteBase API",
            version: "1.0.0",
            description: "RESTful API for TasteBase"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ["./routes/*.js"],
});

// MUST export a function
module.exports = function (app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
