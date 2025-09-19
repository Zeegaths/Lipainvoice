const ENVIRONMENT = "production";


export const getEnvironment = () => {
    return ENVIRONMENT;
}

export const getHost = () => {
    const environment = getEnvironment();
    return environment === "production" ? "https://lipa.ic0.app" : "http://localhost:8080";
}