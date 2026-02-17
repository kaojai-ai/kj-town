# KJ Town

Auto-generates a 3D town from your system architecture and microservices. Build. Ship. Watch the town evolve 🚀✨

![KJ Town](/docs/images/kj-town.png)

## Live Demo

Visit the KJ-Town here: [https://kj-town.kaojai.ai/](https://kj-town.kaojai.ai/)

## Status

🚧 Concept phase (WIP)

Right now it’s **not fully automated yet** — we’re still shaping the pipeline that turns repo/architecture signals into a living 3D town.

That said, with current tech, we believe this is **very deliverable soon**.

Contributions welcome. If you think it’s cool let us know by starring this GitHub repo ⭐️🙌

## How does it work?

There will be a service that watches changes in your git repository organization. It checks for new services, how they are related, and your infrastructure (database, cache layer, etc.) and turns them into a city or town automatically.

Basically, the more you work, the more developed this virtual town becomes!

## Automated upgrade script

You can run an automation script that:
1. Reads your business + architecture file (`.md` or `.puml`)
2. Reads a public page URL that contains incremental system changes
3. Uses OpenAI Codex (`gpt-5-codex` by default, override via env/flag) to evolve `src/` as an incremental city/empire

Command:

```bash
OPENAI_API_KEY=your_key \
npm run auto:upgrade -- \
  --context ./fixtures/blueprint.puml \
  --changes-url https://example.com/changelog
```

Useful flags:
- `--dry-run` prints model output JSON without writing files
- `--model gpt-5-codex` overrides model
- `--max-context-chars 12000` limits architecture/context input size
- `--max-change-chars 12000` limits fetched change-page text size

## Support Us

If you like this product, please share 💬, star ⭐, and spread the word 🌍!

You can also support our SaaS: **[KaoJai.ai](https://kaojai.ai)** - Your business sidekick — built to blend.

We use AI to solve business problems fast, accurately, and at a super competitive price!

## License

MIT
