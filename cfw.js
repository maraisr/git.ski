/**
 * @type {import("cfw").Config}
 */
module.exports = {
	module: true,
	entry: "index.ts",
	name: "git-ski-app",
	zoneid: "d9802b5ed79ee6b26cbe754b37446279",
	routes: [
		"https://git.ski/*",
	],
	globals: {
		DATABASE: "KV:d1e3a03005034296920dbcfa37ab1293",
	},
};
