import { SheetsRegistry } from "jss";
import { createMuiTheme } from "@material-ui/core/styles";
import { createGenerateClassName } from "@material-ui/styles";

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#414d5a',
      main: '#414d5a',
      dark: '#414d5a'
    },
    secondary: {
      light: '#b7c3cd',
      main: '#b7c3cd',
      dark: '#b7c3cd'
    },
    type: 'light',
  },
});

function createPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName()
  };
}

let pageContext;

export default function getPageContext() {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).
  if (!process.browser) {
    return createPageContext();
  }

  // Reuse context on the client-side.
  if (!pageContext) {
    pageContext = createPageContext();
  }

  return pageContext;
}
