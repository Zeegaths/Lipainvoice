const ENVIRONMENT = "development";

export const getEnvironment = () => {
    return ENVIRONMENT;
}

export const getHost = () => {
    return ENVIRONMENT === "development" ? "http://localhost:8080" : "https://lipa.ic0.app";
}