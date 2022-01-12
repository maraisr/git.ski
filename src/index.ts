import type { Context as _Context } from "worktop";
import { Router } from "worktop";
import { start } from "worktop/cfw";
import * as Cache from "worktop/cfw.cache";
import type { KV } from "worktop/cfw.kv";
import { Database } from "worktop/cfw.kv";
import { reply } from "worktop/response";
import { body, uid } from "worktop/utils";

interface Models {
	link: string; // maraisr/git.ski -> git
	code: string; // git -> maraisr/git.ski
}

interface Context extends _Context {
	bindings: {
		DATABASE: KV.Namespace
	};
}

const router = new Router<Context>();

router.prepare = Cache.sync();

router.add("GET", "/:code", async (_req, ctx) => {
	if (!ctx.params.code) return reply(404);
	const database = new Database<Models>(ctx.bindings.DATABASE);

	const target = await database.get("code", ctx.params.code, {
		type: "json",
		cacheTtl: 3600,
	});
	if (!target) return reply(404);

	return Response.redirect(`https://github.com/${target}`, 307);
});

const github_regex = /https:\/\/github\.com\/([\w\.@\:\/\-~]+)(?:\.git)?/;

router.add("POST", "/", async (req, ctx) => {
	const input = await body<{ link: string }>(req);

	if (!input || !input.link || !github_regex.test(input.link)) return reply(406);
	input.link = input.link.trim();

	const database = new Database<Models>(ctx.bindings.DATABASE);
	const [, target] = input.link.match(github_regex) ?? [];

	if (await database.get("link", target)) return reply(406);

	const id = uid(7);
	ctx.waitUntil(database.put("code", id, target));
	ctx.waitUntil(database.put("link", target, id));

	return reply(200, `https://git.ski/${id}`);
});

export default start(router.run);
