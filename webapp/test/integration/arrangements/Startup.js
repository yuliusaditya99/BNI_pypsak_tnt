sap.ui.define([
	"sap/ui/test/Opa5"
], (Opa5) => {
	"use strict";

	return Opa5.extend("com.bni.pypsak.test.integration.arrangements.Startup", {

		iStartMyApp() {
			this.iStartMyUIComponent({
				componentConfig: {
					name: "com.bni.pypsak",
					async: true,
					manifest: true
				}
			});
		}

	});
});
