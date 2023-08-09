describe("TESTS: Configuring Elytron OIDC client in webconsole", () => {
  const oidcAddress = ["subsystem", "elytron-oidc-client"];
  const providerAddress = ["subsystem", "elytron-oidc-client", "provider", "keycloak"];
  const secureDeploymentAddress = ["subsystem", "elytron-oidc-client", "secure-deployment", "wildfly-console"];
  const secureServerAddress = ["subsystem", "elytron-oidc-client", "secure-server", "wildfly-management"];
  const coreSeviceRbacAddress = ["core-service", "management", "access", "authorization"];
  const mappedRoleAddress = [
    "core-service",
    "management",
    "access",
    "authorization",
    "role-mapping",
    "Administrator",
    "include",
    "user-userwithmappedrole",
  ];
  let wildfly: string;

  const providerForm = {
    id: "model-browser-root-provider-add",
    providerName: "name",
    providerValue: "keycloak",
    serverUrl: "provider-url",
    serverUrlValue: "http://localhost:8888/realms/wildfly-infra",
  };

  const secureDeployment = {
    id: "model-browser-root-secure-deployment-add",
    resource: {
      name: "name",
      value: "wildfly-console",
    },
    provider: {
      name: "provider",
      value: "keycloak",
    },
    clientId: {
      name: "client-id",
      value: "wildfly-console",
    },
    publicClient: {
      name: "public-client",
      value: false,
    },
  };
  const secureServer = {
    id: "model-browser-root-secure-server-add",
    resource: {
      name: "name",
      value: "wildfly-management",
    },
    provider: {
      name: "provider",
      value: "keycloak",
    },
    clientId: {
      name: "client-id",
      value: "wildfly-console",
    },
    bearerOnly: {
      name: "bearer-only",
      value: false,
    },
    principal: {
      name: "principal-attribute",
      value: "preferred_username",
    },
    sslRequired: {
      name: "ssl-required",
      value: "EXTERNAL",
    },
  };

  const roleMapping = {
    id: "user-form",
    userName: {
      name: "name",
      value: "userwithmappedrole",
    },
    roleMapped: {
      name: "include",
      value: "Administrator",
    },
  };

  before(() => {
    cy.startWildflyContainer().then((result) => {
      wildfly = result as string;
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  beforeEach(() => {
    // required for "flip" method to see all fields in long form with a lot of elements
    cy.viewport(1000, 2500);
  })

  it("Navigate to elytron OIDC client configuration from home page", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-configuration").should("be.visible").click();
    cy.get("#subsystems").should("be.visible").click();
    cy.get("#elytron-oidc-client").should("be.visible").click();
    cy.get("#elytron-oidc-client > a:nth-child(4)").should("be.visible").click();
    cy.get("#model-browser-root___provider_anchor").should("be.visible");
    cy.get("#model-browser-root___realm_anchor").should("be.visible");
    cy.get("#model-browser-root___secure-deployment_anchor").should("be.visible");
    cy.get("#model-browser-root___secure-server_anchor").should("be.visible");
  });

  it("add keycloak provider", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get("#model-browser-root___provider_anchor").click();
    cy.addInTable("model-browser-children-table");
    cy.text(providerForm.id, providerForm.providerName, providerForm.providerValue);
    cy.get("a.field-section-toggle-pf").click();
    cy.text(providerForm.id, providerForm.serverUrl, providerForm.serverUrlValue);
    cy.get(".modal-md > div:nth-child(1) > div:nth-child(3) > button:nth-child(2)").click();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, providerAddress, providerForm.serverUrl, providerForm.serverUrlValue);
  });

  it("Configure management client secured by bearer token", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get("#model-browser-root___secure-deployment_anchor").click();
    cy.addInTable("model-browser-children-table");
    cy.text(secureDeployment.id, secureDeployment.resource.name, secureDeployment.resource.value);
    cy.get("a.field-section-toggle-pf").click();
    cy.text(secureDeployment.id, secureDeployment.provider.name, secureDeployment.provider.value);
    cy.text(secureDeployment.id, secureDeployment.clientId.name, secureDeployment.clientId.value);
    cy.flip(secureDeployment.id, secureDeployment.publicClient.name, secureDeployment.publicClient.value);
    cy.get(".modal-md > div:nth-child(1) > div:nth-child(3) > button:nth-child(2)").click();
    cy.verifySuccess();
    cy.verifyAttribute(
      wildfly,
      secureDeploymentAddress,
      secureDeployment.provider.name,
      secureDeployment.provider.value
    );
    cy.verifyAttribute(
      wildfly,
      secureDeploymentAddress,
      secureDeployment.clientId.name,
      secureDeployment.clientId.value
    );
    cy.verifyAttribute(wildfly, secureDeploymentAddress, secureDeployment.publicClient.name, true);
    cy.closeWizard();
  });

  it("Configure web console secured by OIDC client", () => {
    cy.navigateToGenericSubsystemPage(wildfly, oidcAddress);
    cy.get("#model-browser-root___secure-server_anchor").click();
    cy.addInTable("model-browser-children-table");
    cy.text(secureServer.id, secureServer.resource.name, secureServer.resource.value);
    cy.get("a.field-section-toggle-pf").click();
    cy.text(secureServer.id, secureServer.provider.name, secureServer.provider.value);
    cy.text(secureServer.id, secureServer.clientId.name, secureServer.clientId.value);
    cy.flip(secureServer.id, secureServer.bearerOnly.name, secureServer.bearerOnly.value);
    cy.text(secureServer.id, secureServer.principal.name, secureServer.principal.value);
    cy.selectText(secureServer.id, secureServer.sslRequired.name, secureServer.sslRequired.value);
    cy.get(".modal-md > div:nth-child(1) > div:nth-child(3) > button:nth-child(2)").click();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.provider.name, secureServer.provider.value);
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.clientId.name, secureServer.clientId.value);
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.bearerOnly.name, true);
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.principal.name, secureServer.principal.value);
    cy.verifyAttribute(wildfly, secureServerAddress, secureServer.sslRequired.name, secureServer.sslRequired.value);
  });

  it("Is posible enable RBAC with roles for OIDC provider", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-access-control").click();
    cy.get("#hal-finder-preview > div:nth-child(2) > a").should("have.text", "Enable RBAC").click();
    cy.get("#hal-modal-title").should("have.text", "Switch Provider");
    cy.get("#hal-modal > div > div > div.modal-body > p > p:nth-child(2)").should(
      "contain.text",
      "be sure your configuration has a user who will be mapped to one of the RBAC roles."
    );
    cy.confirmYesInWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, coreSeviceRbacAddress, "provider", "rbac");
    cy.verifyAttribute(wildfly, coreSeviceRbacAddress, "use-identity-roles", true);
  });

  it("Is possible assigne EAP role to user from SSO", () => {
    cy.navigateTo(wildfly, "home");
    cy.get("#tlc-access-control").should("have.text", "Access Control").click();
    cy.get("#access-control-browse-by-users").should("have.text", "Users").click();
    cy.get("#role-add").click();
    cy.text(roleMapping.id, roleMapping.userName.name, roleMapping.userName.value);
    cy.text(roleMapping.id, roleMapping.roleMapped.name, roleMapping.roleMapped.value);
    cy.get("body > div:nth-child(10)").click();
    cy.confirmAddResourceWizard();
    cy.verifySuccess();
    cy.verifyAttribute(wildfly, mappedRoleAddress, roleMapping.userName.name, roleMapping.userName.value);
  });
});
