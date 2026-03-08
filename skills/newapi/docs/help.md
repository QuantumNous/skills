# Help & Reference

This file is the single entry point for all user questions about New API. Read this file, then follow the instructions below based on the question type.

---

## Type 1: Skill usage questions

Questions like "newapi 是什么", "怎么查余额", "copy-token 怎么用", "CONFIG_MISSING 怎么办" — answer directly from the content below.

### What is New API?

[New API](https://www.newapi.ai) is a unified AI gateway for aggregating and distributing model access. It can expose different providers through OpenAI-compatible, Claude-compatible, or Gemini-compatible interfaces, making it easier to integrate multiple model vendors behind one endpoint.

In addition to model access, New API provides token management, usage tracking, balance monitoring, and group-based access control.

This skill lets you manage your New API account directly from the AI coding assistant — no need to open the web console.

### FAQ

**Q: Why are token keys shown as `sk-xxxx**********xxxx`?**
A: For security. Token keys are always masked in output. Use `/newapi copy-token <id>` to copy the real key to your clipboard without displaying it in the conversation.

**Q: Can I ask the AI to show me my real token key?**
A: No. The AI is strictly prohibited from reading or displaying raw keys. The only supported way to retrieve a real key is `/newapi copy-token`, which copies it to your clipboard silently.

**Q: Where do I find my access token and user ID?**
A: Log in to the New API web console and open Personal Settings. Generate an access token there; your user ID is shown on the same page.

**Q: What's the difference between access token and API token?**
A: The **access token** (`NEWAPI_ACCESS_TOKEN`) authenticates this skill to the New API management API. **API tokens** (managed via `/newapi tokens`) are the `sk-xxx` keys used by applications to call models.

**Q: I get `[CONFIG_MISSING]` — what do I do?**
A: You haven't set the required environment variables. Run:

```bash
export NEWAPI_BASE_URL=https://your-instance.com
export NEWAPI_ACCESS_TOKEN=your-token
export NEWAPI_USER_ID=1
```

Alternatively, add them to a `.env` file in your project root.

**Q: Can I have the AI configure my token into another app (e.g., OpenClaw, Lobechat)?**
A: Yes. Use `/newapi apply-token <token_id> <file_path>`. The AI will update the config with a placeholder, then let a script replace that placeholder with the real key without ever exposing the key in the conversation. The script also creates a backup and safely replaces the original file.

**Q: I want to check a config file but it might have secrets in it.**
A: Use `/newapi scan-config <file_path>`. It shows the file structure with sensitive values such as passwords, tokens, API keys, and credential-bearing connection strings replaced by `<REDACTED>`, so neither you nor the AI accidentally expose secrets.

---

## Type 2: API usage questions

Questions like "newapi 怎么调用 Claude 格式", "怎么用 Banana", "怎么生成图片" — these go beyond the skill's scope. Follow these steps:

1. **Fetch** the relevant LLM-optimized documentation index:
   - **API Reference** (endpoints, request/response formats, auth): `https://apifox.newapi.ai/llms.txt`
   - **Product Docs** (models, guides, deployment, pricing): `https://www.newapi.ai/llms.txt`
2. From the index, find the specific page URL matching the user's question.
3. **Fetch** that page URL for detailed documentation.
4. Answer the user based on the fetched content.
