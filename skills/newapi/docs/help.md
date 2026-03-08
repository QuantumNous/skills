## Help & Reference

This file is the single entry point for all user questions about New API. Read this file, then follow the instructions below based on the question type.

---

### Type 1: Skill usage questions

Questions like "newapi 是什么", "怎么查余额", "copy-token 怎么用", "CONFIG_MISSING 怎么办" — answer directly from the content below.

#### What is New API?

[New API](https://www.newapi.ai) is an A unified AI model hub for aggregation & distribution. It supports cross-converting various LLMs into OpenAI-compatible, Claude-compatible, or Gemini-compatible formats. Supports unified access to multiple AI providers (OpenAI, Claude, Gemini, etc.). It provides token management, usage tracking, balance monitoring, and group-based access control.

This skill lets you manage your New API account directly from the AI coding assistant — no need to open the web console.

#### FAQ

**Q: Why are token keys shown as `sk-xxxx**********xxxx`?**
A: For security. Keys are always masked in output. Use `/newapi copy-token <id>` to copy the real key to your clipboard.

**Q: Can I ask the AI to show me my real token key?**
A: No. The AI is strictly prohibited from reading or displaying raw keys. The only way to get the key is via `/newapi copy-token`, which copies it to your clipboard silently.

**Q: Where do I find my access token and user ID?**
A: Log in to your New API web console → Personal Settings. Generate an access token there; your user ID is displayed on the same page.

**Q: What's the difference between access token and API token?**
A: The **access token** (`NEWAPI_ACCESS_TOKEN`) authenticates you to the management API — it's like your account password for this skill. **API tokens** (managed via `/newapi tokens`) are the `sk-xxx` keys you use to call AI models.

**Q: I get `[CONFIG_MISSING]` — what do I do?**
A: You haven't set the required environment variables. Run:
```bash
export NEWAPI_BASE_URL=https://your-instance.com
export NEWAPI_ACCESS_TOKEN=your-token
export NEWAPI_USER_ID=1
```
Or add them to a `.env` file in your project root.

---

### Type 2: API usage questions

Questions like "newapi 怎么调用 Claude 格式", "怎么用 Banana", "怎么生成图片" — these go beyond the skill's scope. Follow these steps:

1. **Fetch** the relevant LLM-optimized documentation index:
   - **API Reference** (endpoints, request/response formats, auth): `https://apifox.newapi.ai/llms.txt`
   - **Product Docs** (models, guides, deployment, pricing): `https://www.newapi.ai/llms.txt`
2. From the index, find the specific page URL matching the user's question.
3. **Fetch** that page URL for detailed documentation.
4. Answer the user based on the fetched content.