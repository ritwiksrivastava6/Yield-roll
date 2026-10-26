import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as signIn } from "./client-IWHfIGH2.mjs";
import { t as GROK_PROVIDERS } from "./server-ClJU1xeI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-hiaA4OIq.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-medium",
					children: "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "The screen, the book, and the pings stay on the account."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
						className: "min-h-11 w-full rounded-md border border-line px-4 text-sm text-fg",
						children: ["Continue with ", provider.label]
					}, provider.providerId))
				})
			]
		})
	});
}
//#endregion
export { Login as component };
