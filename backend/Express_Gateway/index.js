const express = require('express');
require('dotenv').config(); // Import and configure dotenv
const Consul = require('consul');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const consul = new Consul();

// Function to fetch the respective service details based on reference
const fetchingService = async (requestedService) => {
    try {
        const services = await consul.catalog.service.nodes(requestedService);
        if (services.length === 0) {
            throw new Error("Requested service not registered in Consul");
        }
        const foundService = services[0];
        return `http://${foundService.Address}:${foundService.ServicePort}`;
    } catch (error) {
        throw new Error(`Error fetching service details for ${requestedService}`);
    }
};

// Middleware for forwarding requests to respective services
const forwardRequest = (serviceName) => {
  return async (req, res, next) => {
      try {
          const serviceNameEnv = process.env[`${serviceName}_SERVICE_NAME`];
          console.log(`Fetching service for: ${serviceNameEnv}`);  // Log the service name
          if (!serviceNameEnv) {
              throw new Error(`Environment variable for ${serviceName}_SERVICE_NAME is not defined`);
          }
          const serviceUrl = await fetchingService(serviceNameEnv);
          createProxyMiddleware({
              target: serviceUrl,
              changeOrigin: true,
          })(req, res, next);
      } catch (error) {
          res.send({ error: error.message });
      }
  };
};


// Define API gateways for each service
app.use('/poc_gateway', forwardRequest('POC'));
app.use('/expert_gateway', forwardRequest('EXPERT'));
app.use('/mcq_gateway', forwardRequest('MCQ'));
app.use('/test_gateway', forwardRequest('TEST'));
app.use('/testcase_gateway', forwardRequest('TESTCASE'));
app.use('/coding_gateway', forwardRequest('CODING'));
app.use('/attendance_gateway', forwardRequest('ATTENDANCE'));
app.use('/certificates_gateway', forwardRequest('CERTIFICATES'));
app.use('/reports_gateway', forwardRequest('REPORTS'));
app.use('/results_gateway', forwardRequest('RESULTS'));
app.use('/user_gateway', forwardRequest('USER'));
app.use('/modules_gateway', forwardRequest('MODULES'));
app.use('/organization_gateway', forwardRequest('ORGANIZATION'));

app.listen(process.env.PORT || 4000, () => {
    console.log(`API Gateway running on port ${process.env.PORT || 4000}`);
});
