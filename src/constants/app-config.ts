import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Oops",
  version: packageJson.version,
  copyright: `© ${currentYear}, Oops.`,
  meta: {
    title: "Oops - AI-Native Software Development Workspace",
    description:
      "Oops is an AI-native software development workspace that brings requirements, design, technical planning, development, testing, and project knowledge into one collaborative workspace.",
  },
};
